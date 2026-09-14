import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
} from 'react-native';
import Alert from '../../components/FitAlert';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { defaultWorkoutData, weekDays } from '../../utils/workoutData';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import CategoryImageCard from '../../components/CategoryImageCard';
import { fitnessImages, categoryColors, SAFE_TOP_PADDING, STATUS_BAR_HEIGHT } from '../../utils/theme';
import {
  loadCustomCategories,
  saveCustomCategories,
  addCustomCategory,
  deleteCustomCategory,
  addExerciseToCategory,
  deleteExerciseFromCategory,
  loadWorkoutPlans,
  saveWorkoutPlans,
  loadSchedule,
  saveSchedule,
  loadCompletedToday,
  saveCompletedToday,
  addToHistory,
  getTodayDayName,
  loadPlanProgress,
  togglePlanExercise,
  resetPlanProgress,
} from '../../utils/workoutStorage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const EMOJI_OPTIONS = ['⭐', '💥', '🔥', '⚡', '🎯', '💪', '🏆', '🌟', '🚀', '💯', '🏃', '🧘', '🥊', '🤸'];

const WorkoutScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('today');
  const [loading, setLoading] = useState(true);

  const [customCategories, setCustomCategories] = useState({});
  const [plans, setPlans] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [completedToday, setCompletedToday] = useState([]);
  const [planProgress, setPlanProgress] = useState({});

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const [addExerciseModal, setAddExerciseModal] = useState(false);
  const [addPlanModal, setAddPlanModal] = useState(false);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [scheduleDay, setScheduleDay] = useState(null);

  const [createCategoryModal, setCreateCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryEmoji, setNewCategoryEmoji] = useState('⭐');

  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseSets, setNewExerciseSets] = useState('3');
  const [newExerciseReps, setNewExerciseReps] = useState('12');
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanExercises, setNewPlanExercises] = useState([]);

  const S = dynamicStyles(theme, isDark);

  const loadAllData = async () => {
    try {
      const [custom, plansData, scheduleData, completed, planProg] =
        await Promise.all([
          loadCustomCategories(),
          loadWorkoutPlans(),
          loadSchedule(),
          loadCompletedToday(),
          loadPlanProgress(),
        ]);

      setCustomCategories(custom);
      setPlans(plansData);
      setSchedule(scheduleData);
      setCompletedToday(completed);
      setPlanProgress(planProg);
    } catch (error) {
      console.log('❌ Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [])
  );

  const getAllCategories = () => {
    const categories = { ...defaultWorkoutData };
    Object.keys(customCategories).forEach((name) => {
      categories[name] = {
        emoji: customCategories[name].emoji || '⭐',
        exercises: customCategories[name].exercises || [],
        isCustom: true,
      };
    });
    return categories;
  };

  // ⭐ Get image for category
  const getCategoryImage = (categoryName) => {
    const lowerName = categoryName.toLowerCase();
    if (fitnessImages[lowerName]) {
      return fitnessImages[lowerName];
    }
    // Default images for categories
    const defaults = {
      chest: fitnessImages.chest,
      arms: fitnessImages.arms,
      legs: fitnessImages.legs,
      abs: fitnessImages.abs,
      cardio: fitnessImages.cardio,
      yoga: fitnessImages.yoga,
      back: fitnessImages.motivation1,
      shoulders: fitnessImages.motivation2,
      glutes: fitnessImages.heroGym,
    };
    return defaults[lowerName] || fitnessImages.heroGym;
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Please enter category name');
      return;
    }
    if (newCategoryName.trim().length < 2) {
      Alert.alert('Error', 'Category name must be at least 2 characters');
      return;
    }
    if (defaultWorkoutData[newCategoryName.trim()]) {
      Alert.alert('Error', 'This name is already used by a default category');
      return;
    }

    const result = await addCustomCategory(newCategoryName, newCategoryEmoji);
    if (result.success) {
      setCustomCategories(result.categories);
      setNewCategoryName('');
      setNewCategoryEmoji('⭐');
      setCreateCategoryModal(false);
      Alert.alert('✅ Created!', `"${newCategoryName}" category added`);
      setSelectedCategory(newCategoryName.trim());
    } else {
      Alert.alert('Error', result.error);
    }
  };

  const handleDeleteCategory = (categoryName) => {
    Alert.alert('Delete Category', `Delete "${categoryName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = await deleteCustomCategory(categoryName);
          if (updated !== null) {
            setCustomCategories(updated);
            setSelectedCategory(null);
          }
        },
      },
    ]);
  };

  const addCustomExercise = async () => {
    if (!newExerciseName.trim()) {
      Alert.alert('Error', 'Please enter exercise name');
      return;
    }

    const exercise = {
      name: newExerciseName,
      sets: newExerciseSets,
      reps: newExerciseReps,
    };

    if (customCategories[selectedCategory]) {
      const result = await addExerciseToCategory(selectedCategory, exercise);
      if (result.success) {
        setCustomCategories(result.categories);
        setNewExerciseName('');
        setNewExerciseSets('3');
        setNewExerciseReps('12');
        setAddExerciseModal(false);
        Alert.alert('✅ Added!', `"${exercise.name}" added`);
      }
    } else {
      Alert.alert('⚠️ Note', 'Default categories cannot be modified.', [
        {
          text: 'Create Category',
          onPress: () => {
            setAddExerciseModal(false);
            setCreateCategoryModal(true);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  const handleDeleteExercise = (categoryName, exercise) => {
    if (!customCategories[categoryName]) return;
    Alert.alert('Delete Exercise', `Delete "${exercise.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = await deleteExerciseFromCategory(
            categoryName,
            exercise.id
          );
          if (updated !== null) setCustomCategories(updated);
        },
      },
    ]);
  };

  const toggleCompleted = async (exerciseId, exerciseName) => {
    let updated;
    if (completedToday.includes(exerciseId)) {
      updated = completedToday.filter((id) => id !== exerciseId);
    } else {
      updated = [...completedToday, exerciseId];
      try {
        await api.post('/workouts', {
          workoutName: exerciseName,
          category: 'General',
          exercises: [{ name: exerciseName, sets: 3, reps: 12 }],
          duration: 15,
        });
      } catch (error) {
        console.log('❌ Backend save error:', error.message);
      }
      await addToHistory({
        exerciseId,
        exerciseName,
        date: new Date().toISOString(),
        time: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      });
    }
    setCompletedToday(updated);
    await saveCompletedToday(updated);
  };

  const handleTogglePlanExercise = async (planId, exerciseId, exerciseName) => {
    const updatedProgress = await togglePlanExercise(planId, exerciseId);
    if (updatedProgress) {
      setPlanProgress(updatedProgress);
      const planData = updatedProgress[planId];
      if (planData && planData.completedExercises.includes(exerciseId)) {
        try {
          const plan = plans.find((p) => p.id === planId);
          await api.post('/workouts', {
            workoutName: exerciseName,
            category: plan?.name || 'Plan',
            exercises: [{ name: exerciseName, sets: 3, reps: 12 }],
            duration: 15,
          });
        } catch (error) {
          console.log('❌ Backend save error:', error.message);
        }
        await addToHistory({
          exerciseId,
          exerciseName,
          planId,
          date: new Date().toISOString(),
          time: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        });
      }
    }
  };

  const handleResetPlan = (plan) => {
    Alert.alert('Reset Progress', `Reset all for "${plan.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          const updated = await resetPlanProgress(plan.id);
          if (updated !== null) setPlanProgress(updated);
        },
      },
    ]);
  };

  const getPlanCompletedCount = (plan) => {
    const prog = planProgress[plan.id];
    return prog ? prog.completedExercises.length : 0;
  };

  const isPlanExerciseCompleted = (planId, exerciseId) => {
    const prog = planProgress[planId];
    return prog ? prog.completedExercises.includes(exerciseId) : false;
  };

  const toggleExerciseInPlan = (exercise) => {
    const exists = newPlanExercises.find((e) => e.id === exercise.id);
    if (exists) {
      setNewPlanExercises(newPlanExercises.filter((e) => e.id !== exercise.id));
    } else {
      setNewPlanExercises([...newPlanExercises, exercise]);
    }
  };

  const createPlan = async () => {
    if (!newPlanName.trim()) {
      Alert.alert('Error', 'Please enter plan name');
      return;
    }
    if (newPlanExercises.length === 0) {
      Alert.alert('Error', 'Please select at least one exercise');
      return;
    }
    const plan = {
      id: `plan_${Date.now()}`,
      name: newPlanName.trim(),
      exercises: newPlanExercises,
      createdAt: new Date().toISOString(),
    };
    const updated = [...plans, plan];
    setPlans(updated);
    await saveWorkoutPlans(updated);
    setNewPlanName('');
    setNewPlanExercises([]);
    setAddPlanModal(false);
    Alert.alert('✅ Plan Created!', `"${plan.name}" added`);
  };

  const deletePlan = (planId) => {
    Alert.alert('Delete Plan', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = plans.filter((p) => p.id !== planId);
          setPlans(updated);
          await saveWorkoutPlans(updated);
          await resetPlanProgress(planId);
        },
      },
    ]);
  };

  const openScheduleModal = (day) => {
    setScheduleDay(day);
    setScheduleModal(true);
  };

  const assignToSchedule = async (item, type) => {
    const updated = { ...schedule };
    updated[scheduleDay] = {
      type,
      id: item.id || item,
      name: item.name || item,
    };
    setSchedule(updated);
    await saveSchedule(updated);
    setScheduleModal(false);
    Alert.alert('✅ Scheduled!', `${scheduleDay} → ${item.name || item}`);
  };

  const clearSchedule = async (day) => {
    const updated = { ...schedule };
    delete updated[day];
    setSchedule(updated);
    await saveSchedule(updated);
  };

  // ========== RENDER PLAN DETAIL ==========
  const renderPlanDetail = () => {
    const plan = selectedPlan;
    if (!plan) return null;

    const completedCount = getPlanCompletedCount(plan);
    const total = plan.exercises.length;
    const progress = total > 0 ? (completedCount / total) * 100 : 0;
    const allDone = completedCount === total;

    return (
      <ScrollView
        style={[S.tabContent, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity style={S.backButton} onPress={() => setSelectedPlan(null)}>
          <Text style={[S.backButtonText, { color: theme.primary }]}>
            ← Back to Plans
          </Text>
        </TouchableOpacity>

        <View style={S.planDetailHeader}>
          <Text style={S.planDetailEmoji}>{allDone ? '🏆' : '📋'}</Text>
          <Text style={[S.planDetailTitle, { color: theme.text }]}>
            {plan.name}
          </Text>
          <Text style={[S.planDetailSubtitle, { color: theme.textSecondary }]}>
            {total} exercises • Tap each to mark as done
          </Text>
        </View>

        <View
          style={[
            S.planDetailProgressCard,
            {
              backgroundColor: allDone ? (isDark ? '#1a3a1a' : '#f0fbf5') : theme.card,
              borderColor: allDone ? theme.success : theme.border,
              borderWidth: 2,
            },
          ]}
        >
          <View style={S.progressHeader}>
            <Text style={[S.progressTitle, { color: theme.text }]}>
              {allDone ? '🎉 All Done!' : 'Progress'}
            </Text>
            <Text style={[S.progressCount, { color: theme.primary }]}>
              {completedCount} / {total}
            </Text>
          </View>
          <View
            style={[S.progressBarContainer, { backgroundColor: theme.borderLight }]}
          >
            <View
              style={[
                S.progressBar,
                {
                  width: `${progress}%`,
                  backgroundColor: allDone ? theme.success : theme.primary,
                },
              ]}
            />
          </View>
          <Text style={[S.progressPercent, { color: theme.textSecondary }]}>
            {Math.round(progress)}% Complete{allDone ? ' 🎉' : ''}
          </Text>

          {allDone && (
            <View style={[S.celebrationBadge, { backgroundColor: theme.success }]}>
              <Text style={S.celebrationBadgeText}>✅ WORKOUT COMPLETE!</Text>
            </View>
          )}
        </View>

        {completedCount > 0 && (
          <TouchableOpacity
            style={[S.resetPlanButton, { backgroundColor: theme.cardSecondary }]}
            onPress={() => handleResetPlan(plan)}
          >
            <Text style={[S.resetPlanButtonText, { color: theme.danger }]}>
              ↻ Reset Progress
            </Text>
          </TouchableOpacity>
        )}

        <Text style={[S.sectionLabel, { color: theme.text }]}>Exercises</Text>
        {plan.exercises.map((exercise, index) => {
          const isDone = isPlanExerciseCompleted(plan.id, exercise.id);
          return (
            <TouchableOpacity
              key={exercise.id}
              style={[
                S.exerciseItem,
                {
                  backgroundColor: isDone
                    ? isDark
                      ? '#1a3a1a'
                      : '#e8f8f0'
                    : theme.card,
                  borderColor: theme.border,
                  borderLeftWidth: isDone ? 4 : 1,
                  borderLeftColor: isDone ? theme.success : theme.border,
                },
              ]}
              onPress={() =>
                handleTogglePlanExercise(plan.id, exercise.id, exercise.name)
              }
              activeOpacity={0.7}
            >
              <View
                style={[
                  S.exerciseNumber,
                  { backgroundColor: theme.cardSecondary },
                ]}
              >
                <Text
                  style={[
                    S.exerciseNumberText,
                    { color: isDone ? theme.success : theme.textSecondary },
                  ]}
                >
                  {index + 1}
                </Text>
              </View>
              <View style={S.exerciseInfo}>
                <Text
                  style={[
                    S.exerciseName,
                    {
                      color: isDone ? theme.textSecondary : theme.text,
                      textDecorationLine: isDone ? 'line-through' : 'none',
                    },
                  ]}
                >
                  {exercise.name}
                </Text>
                <Text style={[S.exerciseDetails, { color: theme.textSecondary }]}>
                  {exercise.sets} Sets × {exercise.reps} Reps
                </Text>
              </View>
              <View
                style={[
                  S.checkbox,
                  {
                    borderColor: isDone ? theme.success : theme.border,
                    backgroundColor: isDone ? theme.success : 'transparent',
                  },
                ]}
              >
                {isDone && <Text style={S.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 30 }} />
      </ScrollView>
    );
  };

  // ========== RENDER TODAY TAB ==========
  const renderTodayTab = () => {
    const todayDay = getTodayDayName();
    const todaySchedule = schedule[todayDay];
    const categories = getAllCategories();
    let todayExercises = [];

    if (todaySchedule) {
      if (todaySchedule.type === 'category') {
        const cat = categories[todaySchedule.id];
        if (cat) {
          todayExercises = cat.exercises.map((e) => ({
            ...e,
            categoryName: todaySchedule.id,
          }));
        }
      } else if (todaySchedule.type === 'plan') {
        const plan = plans.find((p) => p.id === todaySchedule.id);
        if (plan) {
          todayExercises = plan.exercises.map((e) => ({
            ...e,
            categoryName: plan.name,
          }));
        }
      }
    }

    const completedCount = todayExercises.filter((e) =>
      completedToday.includes(e.id)
    ).length;
    const progress =
      todayExercises.length > 0
        ? (completedCount / todayExercises.length) * 100
        : 0;

    return (
      <ScrollView
        style={[S.tabContent, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 🌟 TODAY HERO BANNER */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&q=95&fit=crop' }}
          style={S.todayHeroBanner}
          imageStyle={{ borderRadius: 0 }}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.15)', isDark ? 'rgba(15,20,35,0.92)' : 'rgba(10,20,50,0.85)']}
            style={S.todayHeroOverlay}
          >
            <View style={S.todayHeroContent}>
              <View style={S.todayDayBadge}>
                <Text style={S.todayDayBadgeText}>📅 TODAY</Text>
              </View>
              <Text style={S.todayHeroTitle}>{todayDay}'s Workout</Text>
              <Text style={S.todayHeroSub}>
                {todaySchedule
                  ? `${todayExercises.length} exercises • Push your limits!`
                  : 'No workout scheduled yet — plan your session!'}
              </Text>
              {todaySchedule && (
                <View style={S.todayProgressRow}>
                  <View style={[S.todayProgressBarBg, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <View
                      style={[
                        S.todayProgressBarFill,
                        { width: `${progress}%`, backgroundColor: progress === 100 ? '#00E676' : '#4A9EFF' },
                      ]}
                    />
                  </View>
                  <Text style={S.todayProgressLabel}>
                    {completedCount}/{todayExercises.length} done
                  </Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </ImageBackground>

        <View style={S.todayBodyPad}>
          {!todaySchedule ? (
            <View style={[S.emptyState, { backgroundColor: theme.card, marginTop: 0 }]}>
              <Text style={S.emptyEmoji}>🏋️</Text>
              <Text style={[S.emptyTitle, { color: theme.text }]}>No Workout Scheduled</Text>
              <Text style={[S.emptyText, { color: theme.textSecondary }]}>
                Go to "Plans" tab to schedule a workout for {todayDay}
              </Text>
              <TouchableOpacity
                style={[S.primaryButton, { backgroundColor: theme.primary }]}
                onPress={() => setActiveTab('plans')}
              >
                <Text style={S.primaryButtonText}>Go to Plans →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Clear button */}
              <TouchableOpacity
                onPress={() => clearSchedule(todayDay)}
                style={[S.clearTodayButton, { borderColor: theme.danger }]}
              >
                <Text style={[S.clearTodayButtonText, { color: theme.danger }]}>✕ Clear Schedule</Text>
              </TouchableOpacity>

              {/* Progress card */}
              <View style={[S.todayProgressCard, { backgroundColor: theme.card }]}>
                <View style={S.progressHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[S.todayScheduleName, { color: theme.text }]}>{todaySchedule.name}</Text>
                    <Text style={[S.todayScheduleSub, { color: theme.textSecondary }]}>
                      {todayExercises.length} exercises to complete
                    </Text>
                  </View>
                  <View style={[S.todayProgressCircle, { borderColor: progress === 100 ? theme.success : theme.primary }]}>
                    <Text style={[S.todayProgressCircleText, { color: progress === 100 ? theme.success : theme.primary }]}>
                      {Math.round(progress)}%
                    </Text>
                  </View>
                </View>
                <View style={[S.progressBarContainer, { backgroundColor: theme.borderLight, marginTop: 12 }]}>
                  <View
                    style={[
                      S.progressBar,
                      { width: `${progress}%`, backgroundColor: progress === 100 ? theme.success : theme.primary },
                    ]}
                  />
                </View>
                {progress === 100 && (
                  <View style={[S.celebrationBadge, { backgroundColor: theme.success, marginTop: 10 }]}>
                    <Text style={S.celebrationBadgeText}>🎉 WORKOUT COMPLETE!</Text>
                  </View>
                )}
              </View>

              <Text style={[S.sectionLabel, { color: theme.text }]}>Exercises</Text>
              {todayExercises.map((exercise, index) => {
                const isDone = completedToday.includes(exercise.id);
                return (
                  <TouchableOpacity
                    key={exercise.id}
                    style={[
                      S.exerciseItem,
                      {
                        backgroundColor: isDone
                          ? isDark ? '#1a3a1a' : '#e8f8f0'
                          : theme.card,
                        borderColor: theme.border,
                        borderLeftWidth: isDone ? 4 : 0,
                        borderLeftColor: isDone ? theme.success : 'transparent',
                      },
                    ]}
                    onPress={() => toggleCompleted(exercise.id, exercise.name)}
                    activeOpacity={0.7}
                  >
                    <View style={[S.exerciseNumBadge, { backgroundColor: isDone ? theme.success : theme.primary }]}>
                      <Text style={S.exerciseNumText}>{isDone ? '✓' : index + 1}</Text>
                    </View>
                    <View style={S.exerciseInfo}>
                      <Text
                        style={[
                          S.exerciseName,
                          {
                            color: isDone ? theme.textSecondary : theme.text,
                            textDecorationLine: isDone ? 'line-through' : 'none',
                          },
                        ]}
                      >
                        {exercise.name}
                      </Text>
                      <Text style={[S.exerciseDetails, { color: theme.textSecondary }]}>
                        {exercise.sets} Sets × {exercise.reps} Reps
                      </Text>
                    </View>
                    <View style={[S.checkbox, {
                      borderColor: isDone ? theme.success : theme.border,
                      backgroundColor: isDone ? theme.success : 'transparent',
                    }]}>
                      {isDone && <Text style={S.checkmark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    );
  };

  // ========== RENDER LIBRARY TAB ==========
  const renderLibraryTab = () => {
    const categories = getAllCategories();

    if (selectedCategory) {
      const cat = categories[selectedCategory];
      if (!cat) return null;
      const isCustomCategory = !!customCategories[selectedCategory];
      const catColors = categoryColors[selectedCategory] || categoryColors.Chest;

      return (
        <ScrollView
          style={[S.tabContent, { backgroundColor: theme.background }]}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={S.backButton}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[S.backButtonText, { color: theme.primary }]}>
              ← Back to Categories
            </Text>
          </TouchableOpacity>

          {/* ⭐ Category Header with Gradient */}
          <View
            style={[
              S.categoryHeaderBanner,
              { backgroundColor: catColors.primary },
            ]}
          >
            <Text style={S.categoryHeaderEmojiBig}>{cat.emoji}</Text>
            <View style={S.categoryTitleRow}>
              <Text style={S.categoryHeaderTitleWhite}>
                {selectedCategory}
              </Text>
              {isCustomCategory && (
                <View style={S.customBadgeWhite}>
                  <Text style={S.customBadgeTextWhite}>CUSTOM</Text>
                </View>
              )}
            </View>
            <Text style={S.categoryHeaderCountWhite}>
              {cat.exercises.length} exercises
            </Text>
          </View>

          {isCustomCategory ? (
            <>
              <TouchableOpacity
                style={[S.addCustomButton, { backgroundColor: '#9b59b6' }]}
                onPress={() => setAddExerciseModal(true)}
              >
                <Text style={S.addCustomButtonText}>+ Add New Exercise</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  S.deleteCategoryButton,
                  {
                    backgroundColor: isDark ? '#3a1a1a' : '#ffebee',
                    borderColor: theme.danger,
                  },
                ]}
                onPress={() => handleDeleteCategory(selectedCategory)}
              >
                <Text style={[S.deleteCategoryButtonText, { color: theme.danger }]}>
                  🗑️ Delete This Category
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View
              style={[
                S.defaultCategoryNote,
                {
                  backgroundColor: isDark ? '#3a301a' : '#fff8e1',
                  borderLeftColor: theme.warning,
                },
              ]}
            >
              <Text style={[S.defaultCategoryNoteText, { color: theme.textSecondary }]}>
                💡 Default category • Create custom category to add exercises
              </Text>
              <TouchableOpacity
                style={[S.createFromDefaultButton, { backgroundColor: '#9b59b6' }]}
                onPress={() => {
                  setSelectedCategory(null);
                  setCreateCategoryModal(true);
                }}
              >
                <Text style={S.createFromDefaultButtonText}>
                  + Create Custom Category
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {cat.exercises.length === 0 ? (
            <View style={[S.emptyCategoryState, { backgroundColor: theme.card }]}>
              <Text style={S.emptyEmoji}>💪</Text>
              <Text style={[S.emptyTitle, { color: theme.text }]}>
                No Exercises Yet
              </Text>
              <Text style={[S.emptyText, { color: theme.textSecondary }]}>
                Tap "+ Add New Exercise"
              </Text>
            </View>
          ) : (
            cat.exercises.map((exercise) => {
              const isDone = completedToday.includes(exercise.id);
              return (
                <View key={exercise.id} style={S.exerciseRow}>
                  <TouchableOpacity
                    style={[
                      S.exerciseItem,
                      S.exerciseItemFlex,
                      {
                        backgroundColor: isDone
                          ? isDark
                            ? '#1a3a1a'
                            : '#e8f8f0'
                          : theme.card,
                        borderColor: theme.border,
                        borderLeftWidth: isDone ? 4 : 1,
                        borderLeftColor: isDone ? theme.success : theme.border,
                      },
                    ]}
                    onPress={() => toggleCompleted(exercise.id, exercise.name)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        S.checkbox,
                        {
                          borderColor: isDone ? theme.success : theme.border,
                          backgroundColor: isDone ? theme.success : 'transparent',
                        },
                      ]}
                    >
                      {isDone && <Text style={S.checkmark}>✓</Text>}
                    </View>
                    <View style={S.exerciseInfo}>
                      <Text
                        style={[
                          S.exerciseName,
                          {
                            color: isDone ? theme.textSecondary : theme.text,
                            textDecorationLine: isDone ? 'line-through' : 'none',
                          },
                        ]}
                      >
                        {exercise.name}
                      </Text>
                      <Text style={[S.exerciseDetails, { color: theme.textSecondary }]}>
                        {exercise.sets} Sets × {exercise.reps} Reps
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {isCustomCategory && (
                    <TouchableOpacity
                      style={[
                        S.deleteExerciseButton,
                        { backgroundColor: isDark ? '#3a1a1a' : '#ffebee' },
                      ]}
                      onPress={() => handleDeleteExercise(selectedCategory, exercise)}
                    >
                      <Text style={[S.deleteExerciseText, { color: theme.danger }]}>
                        ✕
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
          <View style={{ height: 30 }} />
        </ScrollView>
      );
    }

    return (
      <ScrollView
        style={[S.tabContent, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 🌟 LIBRARY HERO BANNER */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=95&fit=crop' }}
          style={S.libraryHeroBanner}
          imageStyle={{ borderRadius: 0 }}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', isDark ? 'rgba(15,20,35,0.92)' : 'rgba(10,20,50,0.88)']}
            style={S.libraryHeroOverlay}
          >
            <View style={S.libraryHeroChip}>
              <Text style={S.libraryHeroChipText}>📚 EXERCISE LIBRARY</Text>
            </View>
            <Text style={S.libraryHeroTitle}>Train Every{`\n`}Muscle Group</Text>
            <Text style={S.libraryHeroSub}>
              {Object.keys(categories).length} categories · Select to start tracking
            </Text>
          </LinearGradient>
        </ImageBackground>

        <View style={S.libraryBodyPad}>
          <TouchableOpacity
            style={[S.createCategoryButton, { backgroundColor: '#8e44ad' }]}
            onPress={() => setCreateCategoryModal(true)}
          >
            <Text style={S.createCategoryButtonText}>✚ Create Your Own Category</Text>
          </TouchableOpacity>

          <Text style={[S.sectionLabel, { color: theme.text }]}>
            📚 Categories ({Object.keys(categories).length})
          </Text>

          {/* ⭐ IMAGE CARDS GRID */}
          <View style={S.categoriesImageGrid}>
            {Object.keys(categories).map((category) => {
              const isCustom = !!customCategories[category];
              return (
                <CategoryImageCard
                  key={category}
                  category={category}
                  image={getCategoryImage(category)}
                  exerciseCount={categories[category].exercises.length}
                  onPress={() => setSelectedCategory(category)}
                  isCustom={isCustom}
                />
              );
            })}
          </View>
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    );
  };

  // ========== RENDER PLANS TAB ==========
  const renderPlansTab = () => {
    if (selectedPlan) return renderPlanDetail();

    return (
      <ScrollView
        style={[S.tabContent, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 🌟 PLANS HERO BANNER */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=1200&q=95&fit=crop' }}
          style={S.plansHeroBanner}
          imageStyle={{ borderRadius: 0 }}
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', isDark ? 'rgba(10,14,26,0.93)' : 'rgba(15,25,50,0.9)']}
            style={S.plansHeroOverlay}
          >
            <View style={S.plansHeroChip}>
              <Text style={S.plansHeroChipText}>📋 WORKOUT PLANS</Text>
            </View>
            <Text style={S.plansHeroTitle}>Build Your{`\n`}Perfect Plan</Text>
            <Text style={S.plansHeroSub}>
              Schedule workouts, track progress, crush goals
            </Text>
          </LinearGradient>
        </ImageBackground>

        <View style={S.plansBodyPad}>
          {/* Create plan button */}
          <TouchableOpacity
            style={[S.createPlanButton, { backgroundColor: theme.success }]}
            onPress={() => setAddPlanModal(true)}
          >
            <Text style={S.createPlanButtonText}>✚ Create New Workout Plan</Text>
          </TouchableOpacity>

          {/* Weekly Schedule */}
          <Text style={[S.sectionLabel, { color: theme.text }]}>📅 Weekly Schedule</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.weekScrollRow}>
            {weekDays.map((day) => {
              const scheduled = schedule[day];
              const isToday = getTodayDayName() === day;
              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    S.scheduleDayCard,
                    {
                      backgroundColor: isToday ? (isDark ? '#1a2a4a' : '#e8f4fd') : scheduled ? (isDark ? '#1a2a2a' : '#e8f8f0') : theme.card,
                      borderColor: isToday ? theme.primary : scheduled ? theme.success : theme.border,
                      borderWidth: isToday ? 2 : 1,
                    },
                  ]}
                  onPress={() => openScheduleModal(day)}
                >
                  <Text style={[S.scheduleDayCardName, { color: isToday ? theme.primary : theme.textSecondary }]}>
                    {day.substring(0, 3).toUpperCase()}
                  </Text>
                  <Text style={[S.scheduleDayCardValue, { color: theme.text }]} numberOfLines={2}>
                    {scheduled ? scheduled.name : '—'}
                  </Text>
                  {isToday && (
                    <View style={[S.scheduleTodayDot, { backgroundColor: theme.primary }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Plans list */}
          <Text style={[S.sectionLabel, { color: theme.text }]}>📋 My Plans ({plans.length})</Text>

          {plans.length === 0 ? (
            <View style={[S.emptyPlansState, { backgroundColor: theme.card }]}>
              <Text style={S.emptyEmoji}>📋</Text>
              <Text style={[S.emptyTitle, { color: theme.text }]}>No Plans Yet</Text>
              <Text style={[S.emptyText, { color: theme.textSecondary }]}>
                Create custom workout plans and track them
              </Text>
              <TouchableOpacity
                style={[S.primaryButton, { backgroundColor: theme.primary }]}
                onPress={() => setAddPlanModal(true)}
              >
                <Text style={S.primaryButtonText}>Create First Plan →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            plans.map((plan) => {
              const completedCount = getPlanCompletedCount(plan);
              const total = plan.exercises.length;
              const progress = total > 0 ? (completedCount / total) * 100 : 0;
              const allDone = completedCount === total && total > 0;

              return (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    S.planCard,
                    {
                      backgroundColor: allDone ? (isDark ? '#1a3a1a' : '#f0fbf5') : theme.card,
                      borderColor: allDone ? theme.success : theme.border,
                      borderWidth: allDone ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelectedPlan(plan)}
                  activeOpacity={0.75}
                >
                  <View style={S.planHeader}>
                    <View style={[S.planIconBg, { backgroundColor: allDone ? theme.success : theme.primary }]}>
                      <Text style={S.planIconText}>{allDone ? '🏆' : '📋'}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={S.planTitleRow}>
                        <Text style={[S.planName, { color: theme.text }]}>{plan.name}</Text>
                        {allDone && (
                          <View style={[S.planDoneBadge, { backgroundColor: theme.success }]}>
                            <Text style={S.planDoneBadgeText}>✅ DONE</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[S.planCount, { color: theme.textSecondary }]}>
                        {plan.exercises.length} exercises
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={S.deletePlanButton}
                      onPress={() => deletePlan(plan.id)}
                    >
                      <Text style={S.deletePlanText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={S.planProgressRow}>
                    <View style={[S.planProgressBarContainer, { backgroundColor: theme.borderLight }]}>
                      <View
                        style={[
                          S.planProgressBar,
                          { width: `${progress}%`, backgroundColor: allDone ? theme.success : theme.primary },
                        ]}
                      />
                    </View>
                    <Text style={[S.planProgressText, { color: allDone ? theme.success : theme.primary }]}>
                      {completedCount}/{total}
                    </Text>
                  </View>

                  <View style={[S.planExercises, { borderTopColor: theme.borderLight }]}>
                    {plan.exercises.slice(0, 3).map((e) => {
                      const done = isPlanExerciseCompleted(plan.id, e.id);
                      return (
                        <Text
                          key={e.id}
                          style={[
                            S.planExerciseText,
                            { color: done ? theme.success : theme.textSecondary, textDecorationLine: done ? 'line-through' : 'none' },
                          ]}
                        >
                          {done ? '✅' : '▸'} {e.name}
                        </Text>
                      );
                    })}
                    {plan.exercises.length > 3 && (
                      <Text style={[S.planExerciseMore, { color: theme.primary }]}>
                        +{plan.exercises.length - 3} more exercises
                      </Text>
                    )}
                  </View>

                  <Text style={[S.tapToViewText, { color: theme.primary }]}>Tap to view & track →</Text>
                </TouchableOpacity>
              );
            })
          )}
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <View style={[S.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const categories = getAllCategories();

  return (
    <View style={[S.container, { backgroundColor: theme.background }]}>
      {/* ===== HEADER WITH SAFE TOP PADDING ===== */}
      <View
        style={[
          S.tabsContainer,
          { backgroundColor: theme.card, borderBottomColor: theme.border },
        ]}
      >
        {/* Title row */}
        <View style={S.workoutHeader}>
          <View>
            <Text style={[S.workoutTitle, { color: theme.text }]}>💪 Workouts</Text>
            <Text style={[S.workoutSubtitle, { color: theme.textSecondary }]}>Train consistently, grow stronger</Text>
          </View>
        </View>

        {/* Tab switcher */}
        <View style={[S.tabsTrack, { backgroundColor: isDark ? '#1a2234' : '#f1f4f9' }]}>
          {[
            { key: 'today', label: '📅 Today' },
            { key: 'library', label: '📚 Library' },
            { key: 'plans', label: '📋 Plans' },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  S.tab,
                  isActive && [S.tabActive, { backgroundColor: theme.primary }],
                ]}
                activeOpacity={0.8}
                onPress={() => {
                  setActiveTab(tab.key);
                  if (tab.key === 'library') setSelectedCategory(null);
                  if (tab.key === 'today') setSelectedPlan(null);
                }}
              >
                <Text
                  style={[
                    S.tabText,
                    { color: isActive ? '#fff' : theme.textSecondary },
                    isActive && S.tabTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {activeTab === 'today' && renderTodayTab()}
      {activeTab === 'library' && renderLibraryTab()}
      {activeTab === 'plans' && renderPlansTab()}

      {/* CREATE CATEGORY MODAL */}
      <Modal
        animationType="slide"
        transparent
        visible={createCategoryModal}
        onRequestClose={() => setCreateCategoryModal(false)}
      >
        <View style={S.modalOverlay}>
          <View style={[S.modalContent, { backgroundColor: theme.card }]}>
            <View style={S.modalHeader}>
              <Text style={[S.modalTitle, { color: theme.text }]}>
                Create Custom Category
              </Text>
              <TouchableOpacity onPress={() => setCreateCategoryModal(false)}>
                <Text style={[S.modalClose, { color: theme.textSecondary }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[S.modalSubtitle, { color: theme.textSecondary }]}>
              Create your own workout category
            </Text>

            <Text style={[S.modalLabel, { color: theme.text }]}>
              Category Name
            </Text>
            <TextInput
              style={[
                S.modalInput,
                {
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                  borderColor: theme.inputBorder,
                  borderWidth: 1,
                },
              ]}
              placeholder="e.g., Full Body, HIIT"
              placeholderTextColor={theme.inputPlaceholder}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              maxLength={30}
              autoFocus
            />

            <Text style={[S.modalLabel, { color: theme.text }]}>
              Choose an Emoji
            </Text>
            <View style={S.emojiGrid}>
              {EMOJI_OPTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    S.emojiButton,
                    {
                      backgroundColor:
                        newCategoryEmoji === emoji
                          ? '#9b59b6'
                          : theme.cardSecondary,
                      borderColor:
                        newCategoryEmoji === emoji ? '#9b59b6' : 'transparent',
                    },
                  ]}
                  onPress={() => setNewCategoryEmoji(emoji)}
                >
                  <Text style={S.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[S.modalButton, { backgroundColor: theme.primary }]}
              onPress={handleCreateCategory}
            >
              <Text style={S.modalButtonText}>Create Category</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ADD EXERCISE MODAL */}
      <Modal
        animationType="slide"
        transparent
        visible={addExerciseModal}
        onRequestClose={() => setAddExerciseModal(false)}
      >
        <View style={S.modalOverlay}>
          <View style={[S.modalContent, { backgroundColor: theme.card }]}>
            <View style={S.modalHeader}>
              <Text style={[S.modalTitle, { color: theme.text }]}>
                Add New Exercise
              </Text>
              <TouchableOpacity onPress={() => setAddExerciseModal(false)}>
                <Text style={[S.modalClose, { color: theme.textSecondary }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[S.modalSubtitle, { color: theme.textSecondary }]}>
              Adding to: <Text style={{ fontWeight: 'bold', color: theme.text }}>{selectedCategory}</Text>
            </Text>
            <Text style={[S.modalLabel, { color: theme.text }]}>
              Exercise Name
            </Text>
            <TextInput
              style={[
                S.modalInput,
                {
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                  borderColor: theme.inputBorder,
                  borderWidth: 1,
                },
              ]}
              placeholder="e.g., Incline Bench Press"
              placeholderTextColor={theme.inputPlaceholder}
              value={newExerciseName}
              onChangeText={setNewExerciseName}
              autoFocus
            />
            <View style={S.rowInputs}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[S.modalLabel, { color: theme.text }]}>Sets</Text>
                <TextInput
                  style={[
                    S.modalInput,
                    {
                      backgroundColor: theme.inputBackground,
                      color: theme.text,
                      borderColor: theme.inputBorder,
                      borderWidth: 1,
                    },
                  ]}
                  placeholder="3"
                  placeholderTextColor={theme.inputPlaceholder}
                  value={newExerciseSets}
                  onChangeText={setNewExerciseSets}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[S.modalLabel, { color: theme.text }]}>Reps</Text>
                <TextInput
                  style={[
                    S.modalInput,
                    {
                      backgroundColor: theme.inputBackground,
                      color: theme.text,
                      borderColor: theme.inputBorder,
                      borderWidth: 1,
                    },
                  ]}
                  placeholder="12"
                  placeholderTextColor={theme.inputPlaceholder}
                  value={newExerciseReps}
                  onChangeText={setNewExerciseReps}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
            </View>
            <TouchableOpacity
              style={[S.modalButton, { backgroundColor: theme.primary }]}
              onPress={addCustomExercise}
            >
              <Text style={S.modalButtonText}>Add Exercise</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* CREATE PLAN MODAL */}
      <Modal
        animationType="slide"
        transparent
        visible={addPlanModal}
        onRequestClose={() => setAddPlanModal(false)}
      >
        <View style={S.modalOverlay}>
          <View style={[S.modalContent, { backgroundColor: theme.card, maxHeight: '85%' }]}>
            <View style={S.modalHeader}>
              <Text style={[S.modalTitle, { color: theme.text }]}>
                Create Workout Plan
              </Text>
              <TouchableOpacity onPress={() => setAddPlanModal(false)}>
                <Text style={[S.modalClose, { color: theme.textSecondary }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[S.modalLabel, { color: theme.text }]}>Plan Name</Text>
            <TextInput
              style={[
                S.modalInput,
                {
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                  borderColor: theme.inputBorder,
                  borderWidth: 1,
                },
              ]}
              placeholder="e.g., Push Day"
              placeholderTextColor={theme.inputPlaceholder}
              value={newPlanName}
              onChangeText={setNewPlanName}
            />
            <Text style={[S.modalLabel, { color: theme.text }]}>
              Select Exercises ({newPlanExercises.length} selected)
            </Text>
            <ScrollView style={{ maxHeight: 300, marginBottom: 12 }}>
              {Object.keys(categories).map((category) => (
                <View key={category}>
                  <Text style={[S.pickerCategoryLabel, { color: theme.text }]}>
                    {categories[category].emoji} {category}
                  </Text>
                  {categories[category].exercises.map((exercise) => {
                    const isSelected = newPlanExercises.find(
                      (e) => e.id === exercise.id
                    );
                    return (
                      <TouchableOpacity
                        key={exercise.id}
                        style={[
                          S.pickerItem,
                          isSelected && {
                            backgroundColor: isDark ? '#1a3a1a' : '#e8f8f0',
                          },
                        ]}
                        onPress={() => toggleExerciseInPlan(exercise)}
                      >
                        <View
                          style={[
                            S.checkbox,
                            {
                              borderColor: isSelected
                                ? theme.success
                                : theme.border,
                              backgroundColor: isSelected
                                ? theme.success
                                : 'transparent',
                            },
                          ]}
                        >
                          {isSelected && <Text style={S.checkmark}>✓</Text>}
                        </View>
                        <Text style={[S.pickerItemText, { color: theme.text }]}>
                          {exercise.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[S.modalButton, { backgroundColor: theme.primary }]}
              onPress={createPlan}
            >
              <Text style={S.modalButtonText}>Create Plan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* SCHEDULE MODAL */}
      <Modal
        animationType="slide"
        transparent
        visible={scheduleModal}
        onRequestClose={() => setScheduleModal(false)}
      >
        <View style={S.modalOverlay}>
          <View style={[S.modalContent, { backgroundColor: theme.card, maxHeight: '80%' }]}>
            <View style={S.modalHeader}>
              <Text style={[S.modalTitle, { color: theme.text }]}>
                Schedule {scheduleDay}
              </Text>
              <TouchableOpacity onPress={() => setScheduleModal(false)}>
                <Text style={[S.modalClose, { color: theme.textSecondary }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <Text style={[S.modalLabel, { color: theme.text }]}>
                📚 Choose a Category
              </Text>
              <View style={S.pickerRow}>
                {Object.keys(categories).map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      S.pickerChip,
                      {
                        backgroundColor: customCategories[category]
                          ? isDark
                            ? '#2a1a3a'
                            : '#f9f4fc'
                          : theme.cardSecondary,
                        borderColor: customCategories[category]
                          ? '#9b59b6'
                          : theme.border,
                      },
                    ]}
                    onPress={() => assignToSchedule(category, 'category')}
                  >
                    <Text style={[S.pickerChipText, { color: theme.text }]}>
                      {categories[category].emoji} {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {plans.length > 0 && (
                <>
                  <Text style={[S.modalLabel, { color: theme.text }]}>
                    📋 Or Choose a Plan
                  </Text>
                  <View style={S.pickerRow}>
                    {plans.map((plan) => (
                      <TouchableOpacity
                        key={plan.id}
                        style={[
                          S.pickerChip,
                          {
                            backgroundColor: isDark ? '#1a3a1a' : '#e8f8f0',
                            borderColor: theme.success,
                          },
                        ]}
                        onPress={() => assignToSchedule(plan, 'plan')}
                      >
                        <Text style={[S.pickerChipText, { color: theme.text }]}>
                          ⭐ {plan.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ========== STATIC STYLES ==========
const styles = StyleSheet.create({});

// ========== DYNAMIC STYLES (Theme Based) ==========
const dynamicStyles = (theme, isDark) =>
  StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },

    tabsContainer: {
      paddingTop: SAFE_TOP_PADDING,
      paddingBottom: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: 6,
      elevation: 4,
    },
    workoutHeader: {
      marginBottom: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    workoutTitle: {
      fontSize: 26,
      fontWeight: '900',
      letterSpacing: -0.5,
    },
    workoutSubtitle: {
      fontSize: 13,
      marginTop: 2,
    },
    tabsTrack: {
      flexDirection: 'row',
      borderRadius: 14,
      padding: 4,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabActive: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.18,
      shadowRadius: 3,
      elevation: 2,
    },
    tabText: { fontSize: 13.5, fontWeight: '600' },
    tabTextActive: { fontWeight: 'bold' },
    tabContent: { flex: 1 },

    // ═══════════ TODAY TAB STYLES ═══════════
    todayHeroBanner: {
      width: '100%',
      height: 200,
    },
    todayHeroOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    todayHeroContent: {},
    todayDayBadge: {
      backgroundColor: 'rgba(74,158,255,0.9)',
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      marginBottom: 8,
    },
    todayDayBadgeText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.5,
    },
    todayHeroTitle: {
      fontSize: 26,
      fontWeight: '900',
      color: '#fff',
      letterSpacing: -0.5,
    },
    todayHeroSub: {
      color: 'rgba(255,255,255,0.75)',
      fontSize: 13,
      marginTop: 4,
    },
    todayProgressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      gap: 10,
    },
    todayProgressBarBg: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      overflow: 'hidden',
    },
    todayProgressBarFill: {
      height: '100%',
      borderRadius: 3,
    },
    todayProgressLabel: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 11,
      fontWeight: '700',
    },
    todayBodyPad: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    clearTodayButton: {
      borderWidth: 1,
      borderRadius: 10,
      paddingVertical: 8,
      paddingHorizontal: 14,
      alignSelf: 'flex-end',
      marginBottom: 12,
    },
    clearTodayButtonText: { fontSize: 12, fontWeight: '700' },
    todayProgressCard: {
      borderRadius: 18,
      padding: 18,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    todayScheduleName: { fontSize: 18, fontWeight: '800' },
    todayScheduleSub: { fontSize: 13, marginTop: 2 },
    todayProgressCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 3,
      justifyContent: 'center',
      alignItems: 'center',
    },
    todayProgressCircleText: { fontSize: 13, fontWeight: '900' },
    exerciseNumBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    exerciseNumText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '900',
    },

    // ═══════════ LIBRARY TAB STYLES ═══════════
    libraryHeroBanner: {
      width: '100%',
      height: 190,
    },
    libraryHeroOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    libraryHeroChip: {
      backgroundColor: 'rgba(156,93,220,0.9)',
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      marginBottom: 8,
    },
    libraryHeroChipText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.5,
    },
    libraryHeroTitle: {
      fontSize: 26,
      fontWeight: '900',
      color: '#fff',
      letterSpacing: -0.5,
      lineHeight: 30,
    },
    libraryHeroSub: {
      color: 'rgba(255,255,255,0.75)',
      fontSize: 13,
      marginTop: 6,
    },
    libraryBodyPad: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },

    // ═══════════ PLANS TAB STYLES ═══════════
    plansHeroBanner: {
      width: '100%',
      height: 190,
    },
    plansHeroOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    plansHeroChip: {
      backgroundColor: 'rgba(0,200,100,0.85)',
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      marginBottom: 8,
    },
    plansHeroChipText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.5,
    },
    plansHeroTitle: {
      fontSize: 26,
      fontWeight: '900',
      color: '#fff',
      letterSpacing: -0.5,
      lineHeight: 30,
    },
    plansHeroSub: {
      color: 'rgba(255,255,255,0.75)',
      fontSize: 13,
      marginTop: 6,
    },
    plansBodyPad: {
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    weekScrollRow: {
      marginBottom: 20,
    },
    scheduleDayCard: {
      width: 72,
      minHeight: 80,
      borderRadius: 14,
      padding: 10,
      alignItems: 'center',
      marginRight: 10,
      justifyContent: 'center',
    },
    scheduleDayCardName: {
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.5,
    },
    scheduleDayCardValue: {
      fontSize: 9,
      textAlign: 'center',
      marginTop: 5,
      fontWeight: '600',
      lineHeight: 12,
    },
    scheduleTodayDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginTop: 6,
    },
    planIconBg: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    planIconText: { fontSize: 22 },

    todayHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    todayTitle: { fontSize: 22, fontWeight: 'bold' },
    clearButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    clearButtonText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },

    progressCard: {
      borderRadius: 16,
      padding: 18,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 3,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    progressTitle: { fontSize: 16, fontWeight: 'bold', flex: 1 },
    progressCount: { fontSize: 16, fontWeight: 'bold' },
    progressBarContainer: {
      height: 12,
      borderRadius: 6,
      overflow: 'hidden',
      marginBottom: 8,
    },
    progressBar: { height: '100%', borderRadius: 6 },
    progressPercent: {
      fontSize: 13,
      textAlign: 'center',
      fontWeight: '600',
    },

    sectionLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 10,
      marginTop: 6,
    },
    exerciseItem: {
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
      elevation: 2,
    },
    exerciseItemFlex: { flex: 1, marginBottom: 0 },
    exerciseRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      gap: 8,
    },
    exerciseNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    exerciseNumberText: { fontSize: 14, fontWeight: 'bold' },
    checkbox: {
      width: 26,
      height: 26,
      borderRadius: 13,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    checkmark: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
    exerciseInfo: { flex: 1 },
    exerciseName: { fontSize: 16, fontWeight: '600' },
    exerciseDetails: { fontSize: 13, marginTop: 2 },

    deleteExerciseButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    deleteExerciseText: { fontSize: 16, fontWeight: 'bold' },

    emptyState: {
      borderRadius: 16,
      padding: 40,
      alignItems: 'center',
      marginTop: 30,
    },
    emptyPlansState: {
      borderRadius: 16,
      padding: 40,
      alignItems: 'center',
      marginTop: 10,
    },
    emptyCategoryState: {
      borderRadius: 16,
      padding: 40,
      alignItems: 'center',
      marginTop: 10,
    },
    emptyEmoji: { fontSize: 60, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold' },
    emptyText: {
      fontSize: 14,
      textAlign: 'center',
      marginTop: 6,
      marginBottom: 20,
    },
    primaryButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    primaryButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

    // ⭐ IMAGE GRID
    categoriesImageGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },

    // ⭐ CATEGORY HEADER BANNER (Gradient)
    categoryHeaderBanner: {
      borderRadius: 20,
      padding: 24,
      alignItems: 'center',
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
    categoryHeaderEmojiBig: {
      fontSize: 60,
      marginBottom: 8,
    },
    categoryHeaderTitleWhite: {
      fontSize: 26,
      fontWeight: 'bold',
      color: '#fff',
    },
    categoryHeaderCountWhite: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.85)',
      marginTop: 4,
    },
    customBadgeWhite: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      backgroundColor: 'rgba(255,255,255,0.3)',
    },
    customBadgeTextWhite: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },

    // Old category styles (kept for compatibility)
    categoriesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    categoryCard: {
      borderRadius: 16,
      padding: 16,
      width: '31%',
      alignItems: 'center',
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 3,
      position: 'relative',
    },
    customStar: { position: 'absolute', top: 6, right: 6 },
    customStarText: { fontSize: 12 },
    categoryEmoji: { fontSize: 30, marginBottom: 6 },
    categoryName: {
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
    },
    categoryCount: { fontSize: 11, marginTop: 2 },

    createCategoryButton: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 20,
      shadowColor: '#9b59b6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 5,
    },
    createCategoryButtonText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: 'bold',
    },

    backButton: { marginBottom: 12 },
    backButtonText: { fontSize: 15, fontWeight: '600' },
    categoryHeader: { alignItems: 'center', marginBottom: 20 },
    categoryHeaderEmoji: { fontSize: 50, marginBottom: 6 },
    categoryTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    categoryHeaderTitle: { fontSize: 22, fontWeight: 'bold' },
    customBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    customBadgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    categoryHeaderCount: { fontSize: 14, marginTop: 4 },
    addCustomButton: {
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 10,
    },
    addCustomButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
    deleteCategoryButton: {
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
    },
    deleteCategoryButtonText: { fontSize: 13, fontWeight: 'bold' },
    defaultCategoryNote: {
      borderRadius: 12,
      padding: 14,
      marginBottom: 16,
      borderLeftWidth: 4,
    },
    defaultCategoryNoteText: {
      fontSize: 13,
      marginBottom: 10,
      lineHeight: 18,
    },
    createFromDefaultButton: {
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    createFromDefaultButtonText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: 'bold',
    },

    createPlanButton: {
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 20,
    },
    createPlanButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

    scheduleGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    scheduleDay: {
      width: '13.5%',
      aspectRatio: 0.7,
      borderRadius: 10,
      padding: 6,
      alignItems: 'center',
      marginBottom: 8,
    },
    scheduleDayName: { fontSize: 11, fontWeight: 'bold' },
    scheduleDayValue: {
      fontSize: 9,
      textAlign: 'center',
      marginTop: 4,
      fontWeight: '600',
    },

    planCard: {
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 3,
    },
    planHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 10,
    },
    planTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    planName: {
      fontSize: 17,
      fontWeight: 'bold',
      marginRight: 8,
    },
    planDoneBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    planDoneBadgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    planCount: { fontSize: 13, marginTop: 2 },
    deletePlanButton: { padding: 6 },
    deletePlanText: { fontSize: 18 },

    planProgressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    planProgressBarContainer: {
      flex: 1,
      height: 8,
      borderRadius: 4,
      overflow: 'hidden',
      marginRight: 10,
    },
    planProgressBar: { height: '100%', borderRadius: 4 },
    planProgressText: {
      fontSize: 13,
      fontWeight: 'bold',
      minWidth: 40,
      textAlign: 'right',
    },

    planExercises: {
      borderTopWidth: 1,
      paddingTop: 8,
      marginBottom: 8,
    },
    planExerciseText: {
      fontSize: 13,
      marginBottom: 2,
    },
    planExerciseMore: {
      fontSize: 12,
      fontStyle: 'italic',
      marginTop: 4,
    },
    tapToViewText: {
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'right',
    },

    planDetailHeader: { alignItems: 'center', marginBottom: 20 },
    planDetailEmoji: { fontSize: 60, marginBottom: 8 },
    planDetailTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    planDetailSubtitle: {
      fontSize: 14,
      marginTop: 6,
      textAlign: 'center',
    },
    planDetailProgressCard: {
      borderRadius: 16,
      padding: 18,
      marginBottom: 16,
    },
    celebrationBadge: {
      borderRadius: 10,
      paddingVertical: 8,
      marginTop: 12,
      alignItems: 'center',
    },
    celebrationBadgeText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    resetPlanButton: {
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      marginBottom: 16,
    },
    resetPlanButtonText: { fontSize: 14, fontWeight: 'bold' },

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      borderRadius: 20,
      padding: 22,
      width: '90%',
      maxWidth: 450,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    modalClose: { fontSize: 22 },
    modalSubtitle: { fontSize: 14, marginBottom: 14 },
    modalLabel: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 6,
      marginTop: 8,
    },
    modalInput: {
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 11,
      fontSize: 15,
      marginBottom: 6,
    },
    rowInputs: { flexDirection: 'row', marginTop: 4 },
    modalButton: {
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 16,
    },
    modalButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

    emojiGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 6,
      marginBottom: 6,
      gap: 8,
    },
    emojiButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
    },
    emojiText: { fontSize: 22 },

    pickerCategoryLabel: {
      fontSize: 14,
      fontWeight: 'bold',
      marginTop: 10,
      marginBottom: 6,
    },
    pickerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 8,
      borderRadius: 8,
      marginBottom: 4,
    },
    pickerItemText: { fontSize: 14, flex: 1 },
    pickerRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 10,
    },
    pickerChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      marginBottom: 8,
      borderWidth: 1,
    },
    pickerChipText: { fontSize: 13, fontWeight: '600' },
  });

export default WorkoutScreen;