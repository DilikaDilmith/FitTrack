import { userStorage } from './userStorage';

export const STORAGE_KEYS = {
  CUSTOM_CATEGORIES: 'customCategories', // 👈 Custom Categories
  WORKOUT_PLANS: 'workoutPlans',
  WORKOUT_SCHEDULE: 'workoutSchedule',
  COMPLETED_TODAY: 'completedToday',
  COMPLETED_DATE: 'completedDate',
  WORKOUT_HISTORY: 'workoutHistory',
  PLAN_PROGRESS: 'planProgress',
};

// ========== CUSTOM CATEGORIES (User Created) ==========
// Format: { "Full Body": { emoji: '💥', exercises: [{id, name, sets, reps, isCustom}] } }
export const loadCustomCategories = async () => {
  try {
    const data = await userStorage.getItem(STORAGE_KEYS.CUSTOM_CATEGORIES);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.log('❌ Load custom categories error:', error);
    return {};
  }
};

export const saveCustomCategories = async (data) => {
  try {
    await userStorage.setItem(
      STORAGE_KEYS.CUSTOM_CATEGORIES,
      JSON.stringify(data)
    );
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

// Add exercise to custom category
export const addExerciseToCategory = async (categoryName, exercise) => {
  try {
    const categories = await loadCustomCategories();

    if (!categories[categoryName]) {
      return { success: false, error: 'Category not found' };
    }

    const newExercise = {
      id: `ex_${Date.now()}`,
      name: exercise.name.trim(),
      sets: parseInt(exercise.sets) || 3,
      reps: parseInt(exercise.reps) || 12,
      isCustom: true,
    };

    categories[categoryName].exercises.push(newExercise);
    await saveCustomCategories(categories);
    return { success: true, categories, exercise: newExercise };
  } catch (error) {
    console.log('❌ Add exercise error:', error);
    return { success: false, error: error.message };
  }
};

// Delete exercise from custom category
export const deleteExerciseFromCategory = async (categoryName, exerciseId) => {
  try {
    const categories = await loadCustomCategories();
    if (categories[categoryName]) {
      categories[categoryName].exercises = categories[categoryName].exercises.filter(
        (e) => e.id !== exerciseId
      );
      await saveCustomCategories(categories);
    }
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