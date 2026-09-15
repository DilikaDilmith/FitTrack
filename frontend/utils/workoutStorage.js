import api from '../services/api';
import { userStorage } from './userStorage';
import { defaultWorkoutData } from './workoutData';

export const STORAGE_KEYS = {
  CUSTOM_CATEGORIES: 'customCategories', // 👈 Custom Categories (local cache)
  WORKOUT_PLANS: 'workoutPlans',
  WORKOUT_SCHEDULE: 'workoutSchedule',
  COMPLETED_TODAY: 'completedToday',
  COMPLETED_DATE: 'completedDate',
  WORKOUT_HISTORY: 'workoutHistory',
  PLAN_PROGRESS: 'planProgress',
};

// ========== CUSTOM CATEGORIES (User Created - Backend Synced) ==========
// Format: { "Full Body": { emoji, exercises, isCustom, editedExercises, deletedIds } }

/**
 * Load user's workout library customizations.
 * 1. Try fetching from backend (source of truth).
 * 2. On success, update local cache and return data.
 * 3. On failure (offline), fall back to local cache.
 */
export const loadCustomCategories = async () => {
  try {
    // Try backend first
    const response = await api.get('/library');
    const serverCategories = response.data?.categories ?? [];

    // Convert array format → object format used internally
    const result = {};
    for (const cat of serverCategories) {
      result[cat.name] = {
        emoji: cat.emoji || '⭐',
        isCustom: cat.isUserCreated || false,
        exercises: cat.exercises || [],
        editedExercises: cat.editedExercises || {},
        deletedIds: cat.deletedIds || [],
      };
    }

    // Update local cache
    await userStorage.setItem(STORAGE_KEYS.CUSTOM_CATEGORIES, JSON.stringify(result));
    console.log('📚 Library loaded from backend:', Object.keys(result).length, 'categories');
    return result;
  } catch (error) {
    // Fallback: use local cache (offline or not logged in)
    console.log('📦 Library backend unavailable, using local cache:', error.message);
    try {
      const data = await userStorage.getItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }
};

/**
 * Save user's workout library customizations.
 * 1. Write to local cache immediately (fast UI feedback).
 * 2. Sync to backend in background (fire-and-forget).
 */
export const saveCustomCategories = async (data) => {
  try {
    // 1. Write local cache immediately
    await userStorage.setItem(
      STORAGE_KEYS.CUSTOM_CATEGORIES,
      JSON.stringify(data)
    );

    // 2. Sync to backend (background, fire-and-forget)
    const categories = Object.entries(data).map(([name, cat]) => ({
      name,
      emoji: cat.emoji || '⭐',
      isUserCreated: cat.isCustom || false,
      exercises: cat.exercises || [],
      editedExercises: cat.editedExercises || {},
      deletedIds: cat.deletedIds || [],
    }));

    api.post('/library/sync', { categories }).then(() => {
      console.log('☁️ Library synced to backend');
    }).catch((err) => {
      console.log('⚠️ Library sync failed (will retry on next save):', err.message);
    });
  } catch (error) {
    console.log('❌ Save custom categories error:', error);
  }
};


// Add new custom category
export const addCustomCategory = async (name, emoji) => {
  try {
    const categories = await loadCustomCategories();
    const trimmedName = name.trim();

    if (categories[trimmedName]) {
      return { success: false, error: 'Category already exists' };
    }

    categories[trimmedName] = {
      emoji: emoji || '⭐',
      exercises: [],
      isCustom: true,
    };

    await saveCustomCategories(categories);
    return { success: true, categories };
  } catch (error) {
    console.log('❌ Add custom category error:', error);
    return { success: false, error: error.message };
  }
};

// Delete custom category
export const deleteCustomCategory = async (name) => {
  try {
    const categories = await loadCustomCategories();
    delete categories[name];
    await saveCustomCategories(categories);
    return categories;
  } catch (error) {
    console.log('❌ Delete custom category error:', error);
    return null;
  }
};

// Add exercise to category
export const addExerciseToCategory = async (categoryName, exercise) => {
  try {
    const categories = await loadCustomCategories();
    const trimmedCategory = categoryName.trim();

    if (!categories[trimmedCategory]) {
      categories[trimmedCategory] = {
        emoji: '⭐',
        exercises: [],
        editedExercises: {},
        deletedIds: [],
      };
    }

    const newExercise = {
      id: `ex_${Date.now()}`,
      name: exercise.name.trim(),
      sets: parseInt(exercise.sets) || 3,
      reps: parseInt(exercise.reps) || 12,
      isCustom: true,
    };

    if (!Array.isArray(categories[trimmedCategory].exercises)) {
      categories[trimmedCategory].exercises = [];
    }

    categories[trimmedCategory].exercises.push(newExercise);
    await saveCustomCategories(categories);
    return { success: true, categories, exercise: newExercise };
  } catch (error) {
    console.log('❌ Add exercise error:', error);
    return { success: false, error: error.message };
  }
};

// Update exercise in category
export const updateExerciseInCategory = async (categoryName, exerciseId, updatedFields) => {
  try {
    const categories = await loadCustomCategories();
    const trimmedCategory = categoryName.trim();

    if (!categories[trimmedCategory]) {
      categories[trimmedCategory] = {
        emoji: '⭐',
        exercises: [],
        editedExercises: {},
        deletedIds: [],
      };
    }

    if (!categories[trimmedCategory].editedExercises) {
      categories[trimmedCategory].editedExercises = {};
    }

    categories[trimmedCategory].editedExercises[exerciseId] = {
      name: updatedFields.name ? updatedFields.name.trim() : undefined,
      sets: parseInt(updatedFields.sets),
      reps: parseInt(updatedFields.reps),
    };

    if (Array.isArray(categories[trimmedCategory].exercises)) {
      categories[trimmedCategory].exercises = categories[trimmedCategory].exercises.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            name: updatedFields.name ? updatedFields.name.trim() : ex.name,
            sets: parseInt(updatedFields.sets) || ex.sets,
            reps: parseInt(updatedFields.reps) || ex.reps,
          };
        }
        return ex;
      });
    }

    await saveCustomCategories(categories);
    return categories;
  } catch (error) {
    console.log('❌ Update exercise error:', error);
    return null;
  }
};

// Delete exercise from category
export const deleteExerciseFromCategory = async (categoryName, exerciseId) => {
  try {
    const categories = await loadCustomCategories();
    const trimmedCategory = categoryName.trim();

    if (!categories[trimmedCategory]) {
      categories[trimmedCategory] = {
        emoji: '⭐',
        exercises: [],
        editedExercises: {},
        deletedIds: [],
      };
    }

    if (!Array.isArray(categories[trimmedCategory].deletedIds)) {
      categories[trimmedCategory].deletedIds = [];
    }

    if (!categories[trimmedCategory].deletedIds.includes(exerciseId)) {
      categories[trimmedCategory].deletedIds.push(exerciseId);
    }

    if (Array.isArray(categories[trimmedCategory].exercises)) {
      categories[trimmedCategory].exercises = categories[trimmedCategory].exercises.filter(
        (e) => e.id !== exerciseId
      );
    }

    await saveCustomCategories(categories);
    return categories;
  } catch (error) {
    console.log('❌ Delete exercise error:', error);
    return null;
  }
};

// ========== WORKOUT PLANS ==========
export const loadWorkoutPlans = async () => {
  try {
    const data = await userStorage.getItem(STORAGE_KEYS.WORKOUT_PLANS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log('❌ Load plans error:', error);
    return [];
  }
};

export const saveWorkoutPlans = async (plans) => {
  try {
    await userStorage.setItem(STORAGE_KEYS.WORKOUT_PLANS, JSON.stringify(plans));
  } catch (error) {
    console.log('❌ Save plans error:', error);
  }
};

// ========== PLAN PROGRESS ==========
export const loadPlanProgress = async () => {
  try {
    const todayStr = new Date().toDateString();
    const data = await userStorage.getItem(STORAGE_KEYS.PLAN_PROGRESS);
    const progress = data ? JSON.parse(data) : {};

    const cleaned = {};
    Object.keys(progress).forEach((planId) => {
      if (progress[planId].dateStr === todayStr) {
        cleaned[planId] = progress[planId];
      }
    });

    if (Object.keys(cleaned).length !== Object.keys(progress).length) {
      await userStorage.setItem(
        STORAGE_KEYS.PLAN_PROGRESS,
        JSON.stringify(cleaned)
      );
    }

    return cleaned;
  } catch (error) {
    console.log('❌ Load plan progress error:', error);
    return {};
  }
};

export const savePlanProgress = async (progress) => {
  try {
    await userStorage.setItem(
      STORAGE_KEYS.PLAN_PROGRESS,
      JSON.stringify(progress)
    );
  } catch (error) {
    console.log('❌ Save plan progress error:', error);
  }
};

export const togglePlanExercise = async (planId, exerciseId) => {
  try {
    const progress = await loadPlanProgress();
    const planData = progress[planId] || { completedExercises: [] };

    let updatedExercises;
    if (planData.completedExercises.includes(exerciseId)) {
      updatedExercises = planData.completedExercises.filter(
        (id) => id !== exerciseId
      );
    } else {
      updatedExercises = [...planData.completedExercises, exerciseId];
    }

    progress[planId] = {
      completedExercises: updatedExercises,
      lastUpdated: Date.now(),
      dateStr: new Date().toDateString(),
    };

    await savePlanProgress(progress);
    return progress;
  } catch (error) {
    console.log('❌ Toggle plan exercise error:', error);
    return null;
  }
};

export const resetPlanProgress = async (planId) => {
  try {
    const progress = await loadPlanProgress();
    delete progress[planId];
    await savePlanProgress(progress);
    return progress;
  } catch (error) {
    console.log('❌ Reset plan progress error:', error);
    return null;
  }
};

// ========== WORKOUT SCHEDULE ==========
export const loadSchedule = async () => {
  try {
    const data = await userStorage.getItem(STORAGE_KEYS.WORKOUT_SCHEDULE);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.log('❌ Load schedule error:', error);
    return {};
  }
};

export const saveSchedule = async (schedule) => {
  try {
    await userStorage.setItem(
      STORAGE_KEYS.WORKOUT_SCHEDULE,
      JSON.stringify(schedule)
    );
  } catch (error) {
    console.log('❌ Save schedule error:', error);
  }
};

// ========== COMPLETED TODAY ==========
export const loadCompletedToday = async () => {
  try {
    const todayStr = new Date().toDateString();
    const savedDate = await userStorage.getItem(STORAGE_KEYS.COMPLETED_DATE);

    if (savedDate !== todayStr) {
      await userStorage.setItem(STORAGE_KEYS.COMPLETED_DATE, todayStr);
      await userStorage.setItem(STORAGE_KEYS.COMPLETED_TODAY, JSON.stringify([]));
      return [];
    }

    const data = await userStorage.getItem(STORAGE_KEYS.COMPLETED_TODAY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log('❌ Load completed error:', error);
    return [];
  }
};

export const saveCompletedToday = async (completed) => {
  try {
    await userStorage.setItem(
      STORAGE_KEYS.COMPLETED_TODAY,
      JSON.stringify(completed)
    );
    await userStorage.setItem(
      STORAGE_KEYS.COMPLETED_DATE,
      new Date().toDateString()
    );
  } catch (error) {
    console.log('❌ Save completed error:', error);
  }
};

// ========== WORKOUT HISTORY ==========
export const loadHistory = async () => {
  try {
    const data = await userStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.log('❌ Load history error:', error);
    return [];
  }
};

export const addToHistory = async (workoutEntry) => {
  try {
    const history = await loadHistory();
    history.unshift(workoutEntry);
    const trimmed = history.slice(0, 100);
    await userStorage.setItem(
      STORAGE_KEYS.WORKOUT_HISTORY,
      JSON.stringify(trimmed)
    );
  } catch (error) {
    console.log('❌ Add history error:', error);
  }
};

// ========== HELPER ==========
export const getTodayDayName = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date().getDay()];
};