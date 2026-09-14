import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  Dimensions,
  Image,
  ImageBackground,
} from 'react-native';
import Alert from '../../components/FitAlert';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { userStorage } from '../../utils/userStorage';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import {
  SAFE_TOP_PADDING,
  foodImages,
  mealImages,
} from '../../utils/theme';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const getMealEmoji = (type) => {
  switch (type) {
    case 'Breakfast': return '🌅';
    case 'Lunch': return '☀️';
    case 'Dinner': return '🌙';
    case 'Snack': return '🍿';
    default: return '🍽️';
  }
};

const getMealColor = (type) => {
  switch (type) {
    case 'Breakfast': return '#F39C12';
    case 'Lunch': return '#3498DB';
    case 'Dinner': return '#9B59B6';
    case 'Snack': return '#E74C3C';
    default: return '#2ECC71';
  }
};

// 🥗 RICH QUICK PRESETS WITH HD FOOD IMAGES
const QUICK_PRESETS = [
  {
    name: 'Steamed Rice (1 cup)',
    calories: 200,
    protein: 4,
    carbs: 45,
    fat: 0.5,
    emoji: '🍚',
    image: foodImages.rice,
    category: 'Carbs',
  },
  {
    name: 'Grilled Chicken (100g)',
    calories: 165,
    protein: 31,
    carbs: 0,
    fat: 3.6,
    emoji: '🍗',
    image: foodImages.chicken,
    category: 'Protein',
  },
  {
    name: 'Boiled Egg (1 egg)',
    calories: 78,
    protein: 6,
    carbs: 0.6,
    fat: 5,
    emoji: '🥚',
    image: foodImages.egg,
    category: 'Protein',
  },
  {
    name: 'Fresh Banana',
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.4,
    emoji: '🍌',
    image: foodImages.banana,
    category: 'Fruit',
  },
  {
    name: 'Crisp Apple',
    calories: 95,
    protein: 0.5,
    carbs: 25,
    fat: 0.3,
    emoji: '🍎',
    image: foodImages.apple,
    category: 'Fruit',
  },
  {
    name: 'Whole Grain Bread',
    calories: 80,
    protein: 3,
    carbs: 15,
    fat: 1,
    emoji: '🍞',
    image: foodImages.bread,
    category: 'Grains',
  },
  {
    name: 'Greek Yogurt (1 cup)',
    calories: 130,
    protein: 17,
    carbs: 6,
    fat: 4,
    emoji: '🥣',
    image: foodImages.yogurt,
    category: 'Dairy',
  },
  {
    name: 'Salmon Fillet (100g)',
    calories: 208,
    protein: 20,
    carbs: 0,
    fat: 13,
    emoji: '🐟',
    image: foodImages.salmon,
    category: 'Protein',
  },
  {
    name: 'Fresh Avocado (1/2)',
    calories: 160,
    protein: 2,
    carbs: 9,
    fat: 15,
    emoji: '🥑',
    image: foodImages.avocado,
    category: 'Healthy Fats',
  },
  {
    name: 'Garden Salad Bowl',
    calories: 70,
    protein: 2,
    carbs: 10,
    fat: 2,
    emoji: '🥗',
    image: foodImages.salad,
    category: 'Veggies',
  },
  {
    name: 'Protein Shake (1 scoop)',
    calories: 140,
    protein: 25,
    carbs: 3,
    fat: 2,
    emoji: '🥤',
    image: foodImages.shake,
    category: 'Protein',
  },
  {
    name: 'Whole Milk (1 cup)',
    calories: 150,
    protein: 8,
    carbs: 12,
    fat: 8,
    emoji: '🥛',
    image: foodImages.milk,
    category: 'Dairy',
  },
];

const CaloriesScreen = () => {
  const { theme, isDark } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [foodLogs, setFoodLogs] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [dailyGoal, setDailyGoal] = useState(2000);
  const [loading, setLoading] = useState(true);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [presetModalVisible, setPresetModalVisible] = useState(false);

  const [editingFood, setEditingFood] = useState(null);
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [mealType, setMealType] = useState('Breakfast');
  const [newGoal, setNewGoal] = useState('2000');
  const [submitting, setSubmitting] = useState(false);

  const S = dynamicStyles(theme, isDark);

  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [selectedDate])
  );

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadFoodsForDate(selectedDate),
        loadWeeklyData(),
        loadDailyGoal(),
      ]);
    } catch (error) {
      console.log('❌ Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFoodsForDate = async (date) => {
    try {
      const isToday = isSameDay(date, new Date());
      let response;
      if (isToday) {
        response = await api.get('/foods/today');
      } else {
        const dateStr = date.toISOString().split('T')[0];
        response = await api.get(`/foods/date/${dateStr}`);
      }
      setFoodLogs(response.data);
    } catch (error) {
      console.log('❌ Load foods error:', error.message);
      setFoodLogs([]);
    }
  };

  const loadWeeklyData = async () => {
    try {
      const response = await api.get('/foods/weekly');
      setWeeklyData(response.data);
    } catch (error) {
      console.log('❌ Weekly error:', error.message);
    }
  };

  const loadDailyGoal = async () => {
    try {
      const saved = await userStorage.getItem('calorieGoal');
      if (saved) {
        setDailyGoal(parseInt(saved));
        setNewGoal(saved);
      }
    } catch (error) {
      console.log('❌ Goal error:', error);
    }
  };

  const saveDailyGoal = async () => {
    const goalNum = parseInt(newGoal);
    if (isNaN(goalNum) || goalNum < 500 || goalNum > 10000) {
      Alert.alert('Error', 'Goal must be between 500 and 10000');
      return;
    }
    setDailyGoal(goalNum);
    await userStorage.setItem('calorieGoal', goalNum.toString());
    setGoalModalVisible(false);
    Alert.alert('✅ Goal Updated', `Daily goal set to ${goalNum} kcal`);
  };

  const isSameDay = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const navigateDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    if (newDate > new Date()) {
      Alert.alert('Cannot go to future', 'You can only view today or earlier');
      return;
    }
    setSelectedDate(newDate);
  };

  const getDateLabel = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (isSameDay(selectedDate, today)) return 'Today';
    if (isSameDay(selectedDate, yesterday)) return 'Yesterday';
    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const addFood = async (foodData = null) => {
    let data;
    if (foodData) {
      data = foodData;
    } else {
      if (foodName.trim() === '' || calories.trim() === '') {
        Alert.alert('Error', 'Please enter food name and calories');
        return;
      }
      data = {
        foodName: foodName.trim(),
        calories: parseInt(calories),
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        mealType,
      };
    }

    setSubmitting(true);
    try {
      const response = await api.post('/foods', {
        ...data,
        date: selectedDate.toISOString(),
      });
      setFoodLogs([response.data, ...foodLogs]);
      setFoodName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      setMealType('Breakfast');
      setAddModalVisible(false);
      setPresetModalVisible(false);
      Alert.alert('✅ Added!', `${data.foodName} (${data.calories} kcal)`);
    } catch (error) {
      console.log('❌ Add error:', error.message);
      Alert.alert('Error', error.response?.data?.error || 'Failed to add');
    } finally {
      setSubmitting(false);
    }
  };

  const openAddModalForMeal = (type) => {
    setMealType(type);
    setFoodName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setAddModalVisible(true);
  };

  const openEditModal = (food) => {
    setEditingFood(food);
    setFoodName(food.foodName);
    setCalories(food.calories.toString());
    setProtein((food.protein || 0).toString());
    setCarbs((food.carbs || 0).toString());
    setFat((food.fat || 0).toString());
    setMealType(food.mealType);
    setEditModalVisible(true);
  };

  const updateFood = async () => {
    if (!editingFood) return;
    if (foodName.trim() === '' || calories.trim() === '') {
      Alert.alert('Error', 'Please enter food name and calories');
      return;
    }
    setSubmitting(true);
    try {
      const response = await api.put(`/foods/${editingFood._id}`, {
        foodName: foodName.trim(),
        calories: parseInt(calories),
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        mealType,
      });
      setFoodLogs(
        foodLogs.map((f) => (f._id === editingFood._id ? response.data : f))
      );
      setEditModalVisible(false);
      setEditingFood(null);
      Alert.alert('✅ Updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteFood = (id, name) => {
    Alert.alert('Delete', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/foods/${id}`);
            setFoodLogs(foodLogs.filter((f) => f._id !== id));
          } catch (error) {
            console.log('❌ Delete error:', error.message);
          }
        },
      },
    ]);
  };

  const totalCalories = foodLogs.reduce((sum, f) => sum + f.calories, 0);
  const totalProtein = foodLogs.reduce((sum, f) => sum + (f.protein || 0), 0);
  const totalCarbs = foodLogs.reduce((sum, f) => sum + (f.carbs || 0), 0);
  const totalFat = foodLogs.reduce((sum, f) => sum + (f.fat || 0), 0);

  const goalProgress = Math.min((totalCalories / dailyGoal) * 100, 100);
  const remaining = Math.max(dailyGoal - totalCalories, 0);

  // Calculate Macro Energy Percentages
  const proteinCals = totalProtein * 4;
  const carbsCals = totalCarbs * 4;
  const fatCals = totalFat * 9;
  const totalMacroCals = proteinCals + carbsCals + fatCals || 1;
  const proteinPct = Math.round((proteinCals / totalMacroCals) * 100);
  const carbsPct = Math.round((carbsCals / totalMacroCals) * 100);
  const fatPct = Math.round((fatCals / totalMacroCals) * 100);

  const groupedFoods = mealTypes.map((type) => ({
    type,
    emoji: getMealEmoji(type),
    color: getMealColor(type),
    image: mealImages[type] || foodImages.hero,
    items: foodLogs.filter((f) => f.mealType === type),
    total: foodLogs
      .filter((f) => f.mealType === type)
      .reduce((sum, f) => sum + f.calories, 0),
  }));

  const pieData = groupedFoods
    .filter((g) => g.total > 0)
    .map((g) => ({
      name: g.type,
      population: g.total,
      color: g.color,
      legendFontColor: theme.text,
      legendFontSize: 12,
    }));

  const renderMealSection = (group) => {
    const hasItems = group.items.length > 0;

    return (
      <View key={group.type} style={S.mealSection}>
        {/* Meal Header with HD Background Image */}
        <View style={S.mealBannerContainer}>
          <ImageBackground
            source={{ uri: group.image }}
            style={S.mealBannerBg}
            imageStyle={S.mealBannerImage}
          >
            <LinearGradient
              colors={[
                'rgba(15,20,30,0.4)',
                isDark ? 'rgba(10,14,26,0.88)' : 'rgba(15,25,45,0.85)',
              ]}
              style={S.mealBannerOverlay}
            >
              <View style={S.mealBannerTop}>
                <View style={S.mealTitleWrap}>
                  <Text style={S.mealEmojiBadge}>{group.emoji}</Text>
                  <View>
                    <Text style={S.mealBannerTitle}>{group.type}</Text>
                    <Text style={S.mealBannerSubtitle}>
                      {group.items.length}{' '}
                      {group.items.length === 1 ? 'item' : 'items'} logged
                    </Text>
                  </View>
                </View>

                <View style={S.mealBannerRight}>
                  <View style={[S.mealTotalBadge, { backgroundColor: group.color }]}>
                    <Text style={S.mealTotalText}>{group.total} kcal</Text>
                  </View>
                  <TouchableOpacity
                    style={S.mealAddQuickBtn}
                    onPress={() => openAddModalForMeal(group.type)}
                    activeOpacity={0.8}
                  >
                    <Text style={S.mealAddQuickText}>+ Log</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* Meal Items */}
        {hasItems ? (
          <View style={S.mealItemsList}>
            {group.items.map((item) => (
              <View
                key={item._id}
                style={[
                  S.foodItem,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <View style={S.foodInfo}>
                  <Text style={[S.foodName, { color: theme.text }]}>
                    {item.foodName}
                  </Text>
                  <View style={S.macroRow}>
                    <View style={[S.calorieTag, { backgroundColor: theme.primaryLight }]}>
                      <Text style={[S.foodCalories, { color: theme.primary }]}>
                        🔥 {item.calories} kcal
                      </Text>
                    </View>
                    {item.protein > 0 && (
                      <Text
                        style={[
                          S.macroTag,
                          {
                            color: '#FF6B6B',
                            backgroundColor: isDark ? 'rgba(255,107,107,0.15)' : '#FFE5E5',
                          },
                        ]}
                      >
                        P: {item.protein}g
                      </Text>
                    )}
                    {item.carbs > 0 && (
                      <Text
                        style={[
                          S.macroTag,
                          {
                            color: '#3498DB',
                            backgroundColor: isDark ? 'rgba(52,152,219,0.15)' : '#E8F4FD',
                          },
                        ]}
                      >
                        C: {item.carbs}g
                      </Text>
                    )}
                    {item.fat > 0 && (
                      <Text
                        style={[
                          S.macroTag,
                          {
                            color: '#F39C12',
                            backgroundColor: isDark ? 'rgba(243,156,18,0.15)' : '#FEF5E7',
                          },
                        ]}
                      >
                        F: {item.fat}g
                      </Text>
                    )}
                  </View>
                </View>
                <View style={S.foodActions}>
                  <TouchableOpacity
                    onPress={() => openEditModal(item)}
                    style={[S.actionButton, { backgroundColor: theme.cardSecondary }]}
                  >
                    <Text style={S.editText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteFood(item._id, item.foodName)}
                    style={[S.actionButton, { backgroundColor: theme.cardSecondary }]}
                  >
                    <Text style={[S.deleteText, { color: theme.danger }]}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <TouchableOpacity
            style={[S.mealEmptyPlaceholder, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => openAddModalForMeal(group.type)}
            activeOpacity={0.7}
          >
            <Text style={[S.mealEmptyText, { color: theme.textSecondary }]}>
              + Log {group.type}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[S.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[S.loadingText, { color: theme.textSecondary }]}>
          Loading nutritional records...
        </Text>
      </View>
    );
  }

  const isToday = isSameDay(selectedDate, new Date());

  return (
    <ScrollView
      style={[S.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      {/* ═══════════════════════════════════════════════════ */}
      {/* 🌟 HERO BANNER WITH HD NUTRITION IMAGE              */}
      {/* ═══════════════════════════════════════════════════ */}
      <View style={S.heroWrapper}>
        <ImageBackground
          source={{ uri: foodImages.hero }}
          style={S.heroImageBg}
          imageStyle={S.heroImage}
        >
          <LinearGradient
            colors={[
              'rgba(10,14,26,0.35)',
              isDark ? 'rgba(10,14,26,0.85)' : 'rgba(15,25,50,0.82)',
              isDark ? 'rgba(15,20,25,0.98)' : 'rgba(20,32,64,0.95)',
            ]}
            locations={[0, 0.45, 1]}
            style={S.heroOverlay}
          >
            <View style={S.heroBadge}>
              <Text style={S.heroBadgeText}>🥗 NUTRITION & CALORIES</Text>
            </View>
            <Text style={S.heroTitle}>Smart Calorie Tracker</Text>
            <Text style={S.heroSub}>
              Fuel your body with intention. Track intake, balance macros, and achieve peak wellness.
            </Text>

            <View style={S.heroChipsRow}>
              <View style={S.heroChip}>
                <Text style={S.heroChipEmoji}>🎯</Text>
                <Text style={S.heroChipText}>Goal: {dailyGoal} kcal</Text>
              </View>
              <View style={S.heroChip}>
                <Text style={S.heroChipEmoji}>🔥</Text>
                <Text style={S.heroChipText}>Eaten: {totalCalories} kcal</Text>
              </View>
              <View style={S.heroChip}>
                <Text style={S.heroChipEmoji}>⚡</Text>
                <Text style={S.heroChipText}>
                  {remaining > 0 ? `${remaining} kcal left` : 'Goal reached!'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>

      <View style={S.contentWrapper}>
        {/* ═══════════════════════════════════════════════════ */}
        {/* 📅 DATE NAVIGATION                                 */}
        {/* ═══════════════════════════════════════════════════ */}
        <View style={[S.dateNavCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <TouchableOpacity
            style={[S.dateNavButton, { backgroundColor: theme.cardSecondary }]}
            onPress={() => navigateDate(-1)}
            activeOpacity={0.7}
          >
            <Text style={[S.dateNavText, { color: theme.primary }]}>‹</Text>
          </TouchableOpacity>

          <View style={S.dateDisplay}>
            <View style={S.dateBadgeWrap}>
              <Text style={[S.dateLabel, { color: theme.text }]}>{getDateLabel()}</Text>
              {isToday && (
                <View style={[S.todayPill, { backgroundColor: theme.primaryLight }]}>
                  <Text style={[S.todayPillText, { color: theme.primary }]}>Active</Text>
                </View>
              )}
            </View>
            <Text style={[S.dateSubtext, { color: theme.textSecondary }]}>
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              S.dateNavButton,
              {
                backgroundColor: isToday ? theme.borderLight : theme.cardSecondary,
                opacity: isToday ? 0.4 : 1,
              },
            ]}
            onPress={() => navigateDate(1)}
            disabled={isToday}
            activeOpacity={0.7}
          >
            <Text style={[S.dateNavText, { color: theme.primary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ═══════════════════════════════════════════════════ */}
        {/* 🎯 DAILY CALORIE GOAL CARD                         */}
        {/* ═══════════════════════════════════════════════════ */}
        <View style={[S.goalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={S.goalHeader}>
            <View>
              <Text style={[S.goalLabel, { color: theme.textSecondary }]}>
                Daily Energy Intake
              </Text>
              <Text style={[S.goalValue, { color: theme.text }]}>
                {dailyGoal} <Text style={S.goalUnit}>kcal target</Text>
              </Text>
            </View>
            <TouchableOpacity
              style={[S.editGoalButton, { backgroundColor: theme.primaryLight }]}
              onPress={() => setGoalModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={[S.editGoalText, { color: theme.primary }]}>
                ✏️ Edit Goal
              </Text>
            </TouchableOpacity>
          </View>

          {/* Central Calorie Counter */}
          <View style={S.calorieDisplayRow}>
            <View style={S.calorieCountBlock}>
              <Text style={[S.calorieValue, { color: theme.primary }]}>
                {totalCalories}
              </Text>
              <Text style={[S.calorieLabel, { color: theme.textSecondary }]}>
                kcal consumed today
              </Text>
            </View>
            <View style={[S.remainingPill, { backgroundColor: remaining > 0 ? (isDark ? 'rgba(0,230,118,0.15)' : '#E8F8F0') : (isDark ? 'rgba(255,82,82,0.15)' : '#FFEBEE') }]}>
              <Text style={[S.remainingPillText, { color: remaining > 0 ? '#00C853' : theme.danger }]}>
                {remaining > 0 ? `⚡ ${remaining} kcal left` : '⚠️ Exceeded'}
              </Text>
            </View>
          </View>

          {/* Calorie Progress Bar */}
          <View
            style={[
              S.goalProgressContainer,
              { backgroundColor: theme.borderLight },
            ]}
          >
            <LinearGradient
              colors={
                goalProgress >= 100
                  ? ['#FF5252', '#D32F2F']
                  : goalProgress >= 80
                  ? ['#FFA07A', '#FF6B35']
                  : ['#00E676', '#00C853']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[S.goalProgressBar, { width: `${goalProgress}%` }]}
            />
          </View>

          {/* Footer stats */}
          <View style={S.remainingRow}>
            <Text style={[S.remainingText, { color: theme.textSecondary }]}>
              {Math.round(goalProgress)}% of daily goal completed
            </Text>
            <Text style={[S.percentText, { color: theme.primary }]}>
              {totalCalories} / {dailyGoal} kcal
            </Text>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════ */}
        {/* 🥩 MACRONUTRIENTS SECTION WITH RICH CARDS           */}
        {/* ═══════════════════════════════════════════════════ */}
        <View style={[S.macroCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={S.macroCardHeader}>
            <View>
              <Text style={[S.macroTitle, { color: theme.text }]}>
                🥩 Macronutrients
              </Text>
              <Text style={[S.macroSubtitle, { color: theme.textSecondary }]}>
                Energy source distribution
              </Text>
            </View>
            <View style={S.macroTotalPill}>
              <Text style={[S.macroTotalText, { color: theme.textSecondary }]}>
                {Math.round(totalProtein + totalCarbs + totalFat)}g total
              </Text>
            </View>
          </View>

          {/* Macro 3-column cards */}
          <View style={S.macroGrid}>
            {/* Protein */}
            <View
              style={[
                S.macroItem,
                {
                  backgroundColor: isDark ? 'rgba(255,107,107,0.1)' : '#FFF1F1',
                  borderColor: isDark ? 'rgba(255,107,107,0.25)' : '#FFD6D6',
                },
              ]}
            >
              <Text style={S.macroEmoji}>🍗</Text>
              <Text style={[S.macroValue, { color: '#FF6B6B' }]}>
                {totalProtein.toFixed(1)}g
              </Text>
              <Text style={[S.macroLabel, { color: theme.textSecondary }]}>
                Protein ({proteinPct}%)
              </Text>
              <Text style={[S.macroSubValue, { color: theme.textSecondary }]}>
                {Math.round(proteinCals)} kcal
              </Text>
            </View>

            {/* Carbs */}
            <View
              style={[
                S.macroItem,
                {
                  backgroundColor: isDark ? 'rgba(52,152,219,0.1)' : '#EFF6FC',
                  borderColor: isDark ? 'rgba(52,152,219,0.25)' : '#D1E6F7',
                },
              ]}
            >
              <Text style={S.macroEmoji}>🍚</Text>
              <Text style={[S.macroValue, { color: '#3498DB' }]}>
                {totalCarbs.toFixed(1)}g
              </Text>
              <Text style={[S.macroLabel, { color: theme.textSecondary }]}>
                Carbs ({carbsPct}%)
              </Text>
              <Text style={[S.macroSubValue, { color: theme.textSecondary }]}>
                {Math.round(carbsCals)} kcal
              </Text>
            </View>

            {/* Fats */}
            <View
              style={[
                S.macroItem,
                {
                  backgroundColor: isDark ? 'rgba(243,156,18,0.1)' : '#FFF9F0',
                  borderColor: isDark ? 'rgba(243,156,18,0.25)' : '#FCE4C3',
                },
              ]}
            >
              <Text style={S.macroEmoji}>🥑</Text>
              <Text style={[S.macroValue, { color: '#F39C12' }]}>
                {totalFat.toFixed(1)}g
              </Text>
              <Text style={[S.macroLabel, { color: theme.textSecondary }]}>
                Fats ({fatPct}%)
              </Text>
              <Text style={[S.macroSubValue, { color: theme.textSecondary }]}>
                {Math.round(fatCals)} kcal
              </Text>
            </View>
          </View>

          {/* Proportional Ratio Bar */}
          <View style={S.ratioBarWrapper}>
            <View
              style={[
                S.ratioSegment,
                { flex: Math.max(proteinPct, 1), backgroundColor: '#FF6B6B' },
              ]}
            />
            <View
              style={[
                S.ratioSegment,
                { flex: Math.max(carbsPct, 1), backgroundColor: '#3498DB' },
              ]}
            />
            <View
              style={[
                S.ratioSegment,
                { flex: Math.max(fatPct, 1), backgroundColor: '#F39C12' },
              ]}
            />
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════ */}
        {/* ⚡ QUICK LOG POPULAR FOODS (HD IMAGE CAROUSEL)     */}
        {/* ═══════════════════════════════════════════════════ */}
        <View style={S.quickSection}>
          <View style={S.sectionHeaderRow}>
            <View>
              <Text style={[S.sectionTitle, { color: theme.text }]}>
                ⚡ Quick Log Foods
              </Text>
              <Text style={[S.sectionSubtitle, { color: theme.textSecondary }]}>
                Instant 1-tap logging with HD food profiles
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setPresetModalVisible(true)}
              style={[S.viewAllPresetsBtn, { backgroundColor: theme.primaryLight }]}
              activeOpacity={0.7}
            >
              <Text style={[S.viewAllPresetsText, { color: theme.primary }]}>
                All Foods
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={S.quickScrollContent}
          >
            {QUICK_PRESETS.map((preset, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  S.quickFoodCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
                onPress={() =>
                  addFood({
                    foodName: preset.name,
                    calories: preset.calories,
                    protein: preset.protein,
                    carbs: preset.carbs,
                    fat: preset.fat,
                    mealType: mealType || 'Snack',
                  })
                }
                activeOpacity={0.85}
              >
                <View style={S.quickImageWrap}>
                  <Image source={{ uri: preset.image }} style={S.quickFoodImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)']}
                    style={S.quickImageGradient}
                  />
                  <View style={S.quickEmojiBadge}>
                    <Text style={S.quickEmojiText}>{preset.emoji}</Text>
                  </View>
                  <View style={S.quickCalPill}>
                    <Text style={S.quickCalText}>{preset.calories} kcal</Text>
                  </View>
                </View>

                <View style={S.quickFoodContent}>
                  <Text
                    style={[S.quickFoodName, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {preset.name}
                  </Text>
                  <Text style={[S.quickFoodMacros, { color: theme.textSecondary }]}>
                    P:{preset.protein}g • C:{preset.carbs}g
                  </Text>
                  <View style={[S.quickAddButton, { backgroundColor: theme.primary }]}>
                    <Text style={S.quickAddButtonText}>+ Add</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ═══════════════════════════════════════════════════ */}
        {/* 🔘 ACTION BUTTONS (ADD FOOD & PRESETS)              */}
        {/* ═══════════════════════════════════════════════════ */}
        <View style={S.actionsContainer}>
          <TouchableOpacity
            style={S.addButton}
            onPress={() => {
              setMealType('Breakfast');
              setFoodName('');
              setCalories('');
              setProtein('');
              setCarbs('');
              setFat('');
              setAddModalVisible(true);
            }}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#FF6B35', '#E85A24']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={S.addGradient}
            >
              <Text style={S.addButtonText}>+ Add Custom Food</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[S.presetButton, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setPresetModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={[S.presetButtonText, { color: theme.text }]}>
              ⚡ Presets
            </Text>
          </TouchableOpacity>
        </View>

        {/* ═══════════════════════════════════════════════════ */}
        {/* 🍽️ MEALS LOGGED PER TIME OF DAY (HD CARDS)        */}
        {/* ═══════════════════════════════════════════════════ */}
        <View style={S.mealsHeaderRow}>
          <Text style={[S.sectionTitle, { color: theme.text }]}>
            🍽️ Today's Meal Timeline
          </Text>
          <Text style={[S.sectionSubtitle, { color: theme.textSecondary }]}>
            Organized by breakfast, lunch, dinner & snacks
          </Text>
        </View>

        {foodLogs.length === 0 ? (
          <View style={[S.emptyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Image
              source={{ uri: foodImages.emptyPlate }}
              style={S.emptyImage}
            />
            <Text style={[S.emptyText, { color: theme.text }]}>
              No meals logged for {getDateLabel().toLowerCase()}
            </Text>
            <Text style={[S.emptySubText, { color: theme.textSecondary }]}>
              Fuel your journey! Tap below or select a quick food from the carousel above to start tracking.
            </Text>
            <TouchableOpacity
              style={[S.emptyAddButton, { backgroundColor: theme.primary }]}
              onPress={() => setAddModalVisible(true)}
              activeOpacity={0.85}
            >
              <Text style={S.emptyAddButtonText}>+ Log First Meal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          groupedFoods.map(renderMealSection)
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* 📊 CHARTS SECTION                                   */}
        {/* ═══════════════════════════════════════════════════ */}
        {pieData.length > 0 && (
          <View style={[S.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[S.chartTitle, { color: theme.text }]}>
              📊 Meal Distribution
            </Text>
            <PieChart
              data={pieData}
              width={CHART_WIDTH - 20}
              height={180}
              chartConfig={{
                color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        )}

        {weeklyData.length > 0 && weeklyData.some((d) => d.calories > 0) && (
          <View style={[S.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={S.chartHeaderRow}>
              <Text style={[S.chartTitle, { color: theme.text }]}>
                📈 Weekly Intake Trend
              </Text>
              <View style={[S.chartBadge, { backgroundColor: theme.primaryLight }]}>
                <Text style={[S.chartBadgeText, { color: theme.primary }]}>
                  7-Day History
                </Text>
              </View>
            </View>
            <BarChart
              data={{
                labels: weeklyData.map((d) => d.dayName),
                datasets: [{ data: weeklyData.map((d) => d.calories) }],
              }}
              width={CHART_WIDTH - 20}
              height={210}
              chartConfig={{
                backgroundColor: theme.card,
                backgroundGradientFrom: theme.card,
                backgroundGradientTo: theme.card,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 107, 53, ${opacity})`,
                labelColor: (opacity = 1) =>
                  isDark
                    ? `rgba(236, 240, 241, ${opacity})`
                    : `rgba(44, 62, 80, ${opacity})`,
                barPercentage: 0.65,
              }}
              style={S.chart}
              fromZero
              showValuesOnTopOfBars
              yAxisLabel=""
              yAxisSuffix=""
            />
          </View>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* 💡 HEALTHY NUTRITION TIP CARD                      */}
        {/* ═══════════════════════════════════════════════════ */}
        <View style={S.tipCardWrapper}>
          <ImageBackground
            source={{ uri: foodImages.nutritionTip }}
            style={S.tipCardBg}
            imageStyle={S.tipCardImage}
          >
            <LinearGradient
              colors={['rgba(15,20,30,0.55)', isDark ? 'rgba(10,14,24,0.92)' : 'rgba(15,25,45,0.88)']}
              style={S.tipCardOverlay}
            >
              <View style={S.tipBadge}>
                <Text style={S.tipBadgeText}>💡 NUTRITION WISDOM</Text>
              </View>
              <Text style={S.tipTitle}>High-Protein Satiety Secret</Text>
              <Text style={S.tipDesc}>
                Aim for 25–30g of lean protein in every main meal. Protein boosts thermogenesis, preserves muscle during workouts, and naturally suppresses hunger cravings.
              </Text>
            </LinearGradient>
          </ImageBackground>
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════ */}
      {/* 🌟 MODALS                                           */}
      {/* ═══════════════════════════════════════════════════ */}

      {/* ========== ADD FOOD MODAL ========== */}
      <Modal
        animationType="slide"
        transparent
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={S.modalOverlay}>
          <View style={[S.modalContent, { backgroundColor: theme.card }]}>
            <View style={S.modalHeader}>
              <View>
                <Text style={[S.modalTitle, { color: theme.text }]}>Add Food Item</Text>
                <Text style={[S.modalSub, { color: theme.textSecondary }]}>
                  Log custom food and macro values
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setAddModalVisible(false)}
                style={[S.modalCloseBtn, { backgroundColor: theme.cardSecondary }]}
              >
                <Text style={[S.modalClose, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[S.inputLabel, { color: theme.text }]}>Meal Category</Text>
              <View style={S.mealTypeContainer}>
                {mealTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      S.mealTypeButton,
                      {
                        backgroundColor:
                          mealType === type
                            ? theme.primary
                            : theme.cardSecondary,
                      },
                    ]}
                    onPress={() => setMealType(type)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        S.mealTypeText,
                        {
                          color: mealType === type ? '#fff' : theme.text,
                          fontWeight: mealType === type ? 'bold' : 'normal',
                        },
                      ]}
                    >
                      {getMealEmoji(type)} {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[S.inputLabel, { color: theme.text }]}>Food Name *</Text>
              <TextInput
                style={[
                  S.input,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.inputBorder,
                  },
                ]}
                placeholder="e.g., Grilled Salmon & Quinoa"
                placeholderTextColor={theme.inputPlaceholder}
                value={foodName}
                onChangeText={setFoodName}
              />

              <Text style={[S.inputLabel, { color: theme.text }]}>
                Calories (kcal) *
              </Text>
              <TextInput
                style={[
                  S.input,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.inputBorder,
                  },
                ]}
                placeholder="e.g., 450"
                placeholderTextColor={theme.inputPlaceholder}
                value={calories}
                onChangeText={setCalories}
                keyboardType="numeric"
              />

              <Text style={[S.inputLabel, { color: theme.text }]}>
                Macronutrients in Grams (Optional)
              </Text>
              <View style={S.macroInputRow}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <TextInput
                    style={[
                      S.macroInput,
                      {
                        backgroundColor: theme.inputBackground,
                        color: theme.text,
                        borderColor: theme.inputBorder,
                      },
                    ]}
                    placeholder="Protein (g)"
                    placeholderTextColor={theme.inputPlaceholder}
                    value={protein}
                    onChangeText={setProtein}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1, marginHorizontal: 3 }}>
                  <TextInput
                    style={[
                      S.macroInput,
                      {
                        backgroundColor: theme.inputBackground,
                        color: theme.text,
                        borderColor: theme.inputBorder,
                      },
                    ]}
                    placeholder="Carbs (g)"
                    placeholderTextColor={theme.inputPlaceholder}
                    value={carbs}
                    onChangeText={setCarbs}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <TextInput
                    style={[
                      S.macroInput,
                      {
                        backgroundColor: theme.inputBackground,
                        color: theme.text,
                        borderColor: theme.inputBorder,
                      },
                    ]}
                    placeholder="Fat (g)"
                    placeholderTextColor={theme.inputPlaceholder}
                    value={fat}
                    onChangeText={setFat}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[
                S.submitButton,
                {
                  backgroundColor: theme.primary,
                  opacity: submitting ? 0.6 : 1,
                },
              ]}
              onPress={() => addFood()}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={S.submitButtonText}>+ Add Food to Log</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========== EDIT MODAL ========== */}
      <Modal
        animationType="slide"
        transparent
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={S.modalOverlay}>
          <View style={[S.modalContent, { backgroundColor: theme.card }]}>
            <View style={S.modalHeader}>
              <View>
                <Text style={[S.modalTitle, { color: theme.text }]}>Edit Food</Text>
                <Text style={[S.modalSub, { color: theme.textSecondary }]}>
                  Modify logged entry
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                style={[S.modalCloseBtn, { backgroundColor: theme.cardSecondary }]}
              >
                <Text style={[S.modalClose, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[S.inputLabel, { color: theme.text }]}>Food Name</Text>
              <TextInput
                style={[
                  S.input,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.inputBorder,
                  },
                ]}
                value={foodName}
                onChangeText={setFoodName}
              />

              <Text style={[S.inputLabel, { color: theme.text }]}>Calories (kcal)</Text>
              <TextInput
                style={[
                  S.input,
                  {
                    backgroundColor: theme.inputBackground,
                    color: theme.text,
                    borderColor: theme.inputBorder,
                  },
                ]}
                value={calories}
                onChangeText={setCalories}
                keyboardType="numeric"
              />

              <Text style={[S.inputLabel, { color: theme.text }]}>
                Macronutrients (g)
              </Text>
              <View style={S.macroInputRow}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <TextInput
                    style={[
                      S.macroInput,
                      {
                        backgroundColor: theme.inputBackground,
                        color: theme.text,
                        borderColor: theme.inputBorder,
                      },
                    ]}
                    placeholder="Protein"
                    placeholderTextColor={theme.inputPlaceholder}
                    value={protein}
                    onChangeText={setProtein}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1, marginHorizontal: 3 }}>
                  <TextInput
                    style={[
                      S.macroInput,
                      {
                        backgroundColor: theme.inputBackground,
                        color: theme.text,
                        borderColor: theme.inputBorder,
                      },
                    ]}
                    placeholder="Carbs"
                    placeholderTextColor={theme.inputPlaceholder}
                    value={carbs}
                    onChangeText={setCarbs}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <TextInput
                    style={[
                      S.macroInput,
                      {
                        backgroundColor: theme.inputBackground,
                        color: theme.text,
                        borderColor: theme.inputBorder,
                      },
                    ]}
                    placeholder="Fat"
                    placeholderTextColor={theme.inputPlaceholder}
                    value={fat}
                    onChangeText={setFat}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <Text style={[S.inputLabel, { color: theme.text }]}>Meal Type</Text>
              <View style={S.mealTypeContainer}>
                {mealTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      S.mealTypeButton,
                      {
                        backgroundColor:
                          mealType === type
                            ? theme.primary
                            : theme.cardSecondary,
                      },
                    ]}
                    onPress={() => setMealType(type)}
                  >
                    <Text
                      style={[
                        S.mealTypeText,
                        {
                          color: mealType === type ? '#fff' : theme.text,
                          fontWeight: mealType === type ? 'bold' : 'normal',
                        },
                      ]}
                    >
                      {getMealEmoji(type)} {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[
                S.submitButton,
                {
                  backgroundColor: theme.success,
                  opacity: submitting ? 0.6 : 1,
                },
              ]}
              onPress={updateFood}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={S.submitButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========== GOAL MODAL ========== */}
      <Modal
        animationType="fade"
        transparent
        visible={goalModalVisible}
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <View style={S.modalOverlay}>
          <View
            style={[S.modalContent, { backgroundColor: theme.card, maxWidth: 360 }]}
          >
            <View style={S.modalHeader}>
              <View>
                <Text style={[S.modalTitle, { color: theme.text }]}>
                  Set Daily Target
                </Text>
                <Text style={[S.modalSub, { color: theme.textSecondary }]}>
                  Calorie intake goal
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setGoalModalVisible(false)}
                style={[S.modalCloseBtn, { backgroundColor: theme.cardSecondary }]}
              >
                <Text style={[S.modalClose, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={[S.inputLabel, { color: theme.text }]}>
              Target Calories (kcal)
            </Text>
            <TextInput
              style={[
                S.input,
                {
                  backgroundColor: theme.inputBackground,
                  color: theme.text,
                  borderColor: theme.inputBorder,
                },
              ]}
              placeholder="2000"
              placeholderTextColor={theme.inputPlaceholder}
              value={newGoal}
              onChangeText={setNewGoal}
              keyboardType="numeric"
              autoFocus
            />

            {/* Quick goal pills */}
            <Text style={[S.inputLabel, { color: theme.textSecondary, marginTop: 12 }]}>
              Quick Presets:
            </Text>
            <View style={S.quickGoalRow}>
              {['1600', '1800', '2000', '2200', '2500'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    S.quickGoalPill,
                    {
                      backgroundColor:
                        newGoal === g ? theme.primary : theme.cardSecondary,
                    },
                  ]}
                  onPress={() => setNewGoal(g)}
                >
                  <Text
                    style={[
                      S.quickGoalPillText,
                      { color: newGoal === g ? '#fff' : theme.text },
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[S.submitButton, { backgroundColor: theme.primary, marginTop: 20 }]}
              onPress={saveDailyGoal}
              activeOpacity={0.85}
            >
              <Text style={S.submitButtonText}>Save Daily Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ========== QUICK ADD MODAL ========== */}
      <Modal
        animationType="slide"
        transparent
        visible={presetModalVisible}
        onRequestClose={() => setPresetModalVisible(false)}
      >
        <View style={S.modalOverlay}>
          <View
            style={[
              S.modalContent,
              { backgroundColor: theme.card, maxHeight: '85%' },
            ]}
          >
            <View style={S.modalHeader}>
              <View>
                <Text style={[S.modalTitle, { color: theme.text }]}>
                  ⚡ Quick Add Foods
                </Text>
                <Text style={[S.modalSub, { color: theme.textSecondary }]}>
                  Tap any item to instantly add to {mealType}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setPresetModalVisible(false)}
                style={[S.modalCloseBtn, { backgroundColor: theme.cardSecondary }]}
              >
                <Text style={[S.modalClose, { color: theme.textSecondary }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Meal selector for quick add */}
            <View style={S.presetMealSelector}>
              {mealTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    S.presetMealBtn,
                    {
                      backgroundColor:
                        mealType === type ? theme.primary : theme.cardSecondary,
                    },
                  ]}
                  onPress={() => setMealType(type)}
                >
                  <Text
                    style={[
                      S.presetMealText,
                      { color: mealType === type ? '#fff' : theme.text },
                    ]}
                  >
                    {getMealEmoji(type)} {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {QUICK_PRESETS.map((preset, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    S.presetListItem,
                    { backgroundColor: theme.cardSecondary, borderColor: theme.border },
                  ]}
                  onPress={() =>
                    addFood({
                      foodName: preset.name,
                      calories: preset.calories,
                      protein: preset.protein,
                      carbs: preset.carbs,
                      fat: preset.fat,
                      mealType: mealType || 'Snack',
                    })
                  }
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: preset.image }} style={S.presetListImage} />
                  <View style={S.presetInfo}>
                    <Text style={[S.presetName, { color: theme.text }]}>
                      {preset.emoji} {preset.name}
                    </Text>
                    <Text
                      style={[S.presetMacros, { color: theme.textSecondary }]}
                    >
                      P: {preset.protein}g • C: {preset.carbs}g • F: {preset.fat}g
                    </Text>
                  </View>
                  <View style={[S.presetCalBadge, { backgroundColor: theme.primaryLight }]}>
                    <Text style={[S.presetCalories, { color: theme.primary }]}>
                      {preset.calories} kcal
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// ============================================
// 🎨 DYNAMIC STYLES - SLEEK & PREMIUM
// ============================================
const dynamicStyles = (theme, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 15,
      fontWeight: '500',
    },

    // 🌟 HERO BANNER
    heroWrapper: {
      paddingTop: SAFE_TOP_PADDING,
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    heroImageBg: {
      borderRadius: 22,
      overflow: 'hidden',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    heroImage: {
      borderRadius: 22,
    },
    heroOverlay: {
      paddingHorizontal: 20,
      paddingVertical: 22,
    },
    heroBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
      marginBottom: 8,
    },
    heroBadgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    heroTitle: {
      color: '#fff',
      fontSize: 26,
      fontWeight: 'bold',
      marginBottom: 6,
    },
    heroSub: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 13,
      lineHeight: 18,
      marginBottom: 14,
    },
    heroChipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    heroChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.15)',
    },
    heroChipEmoji: {
      fontSize: 11,
      marginRight: 4,
    },
    heroChipText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '600',
    },

    contentWrapper: {
      paddingHorizontal: 16,
    },

    // 📅 DATE NAVIGATION
    dateNavCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      borderWidth: 1,
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    dateNavButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dateNavText: {
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 26,
    },
    dateDisplay: {
      flex: 1,
      alignItems: 'center',
    },
    dateBadgeWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    dateLabel: {
      fontSize: 17,
      fontWeight: 'bold',
    },
    todayPill: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    todayPillText: {
      fontSize: 10,
      fontWeight: 'bold',
    },
    dateSubtext: {
      fontSize: 11,
      marginTop: 2,
    },

    // 🎯 GOAL CARD
    goalCard: {
      borderRadius: 20,
      borderWidth: 1,
      padding: 18,
      marginBottom: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 3,
    },
    goalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    goalLabel: {
      fontSize: 12,
      fontWeight: '500',
    },
    goalValue: {
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 2,
    },
    goalUnit: {
      fontSize: 13,
      fontWeight: 'normal',
    },
    editGoalButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
    },
    editGoalText: {
      fontSize: 12,
      fontWeight: '600',
    },
    calorieDisplayRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 6,
    },
    calorieCountBlock: {
      flex: 1,
    },
    calorieValue: {
      fontSize: 48,
      fontWeight: '800',
      lineHeight: 52,
    },
    calorieLabel: {
      fontSize: 12,
      marginTop: 2,
    },
    remainingPill: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      alignItems: 'center',
    },
    remainingPillText: {
      fontSize: 13,
      fontWeight: 'bold',
    },
    goalProgressContainer: {
      height: 10,
      borderRadius: 5,
      overflow: 'hidden',
      marginTop: 14,
    },
    goalProgressBar: {
      height: '100%',
      borderRadius: 5,
    },
    remainingRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
    },
    remainingText: {
      fontSize: 11,
    },
    percentText: {
      fontSize: 12,
      fontWeight: 'bold',
    },

    // 🥩 MACRONUTRIENTS
    macroCard: {
      borderRadius: 20,
      borderWidth: 1,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 2,
    },
    macroCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    macroTitle: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    macroSubtitle: {
      fontSize: 11,
      marginTop: 1,
    },
    macroTotalPill: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    macroTotalText: {
      fontSize: 11,
      fontWeight: '600',
    },
    macroGrid: {
      flexDirection: 'row',
      gap: 8,
    },
    macroItem: {
      flex: 1,
      borderRadius: 14,
      borderWidth: 1,
      padding: 12,
      alignItems: 'center',
    },
    macroEmoji: {
      fontSize: 20,
      marginBottom: 4,
    },
    macroValue: {
      fontSize: 17,
      fontWeight: 'bold',
    },
    macroLabel: {
      fontSize: 10,
      fontWeight: '600',
      marginTop: 2,
    },
    macroSubValue: {
      fontSize: 10,
      marginTop: 2,
    },
    ratioBarWrapper: {
      flexDirection: 'row',
      height: 6,
      borderRadius: 3,
      overflow: 'hidden',
      marginTop: 12,
    },
    ratioSegment: {
      height: '100%',
    },

    // ⚡ QUICK SECTION (HORIZONTAL HD FOOD CAROUSEL)
    quickSection: {
      marginBottom: 18,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: 'bold',
    },
    sectionSubtitle: {
      fontSize: 11,
      marginTop: 2,
    },
    viewAllPresetsBtn: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
    },
    viewAllPresetsText: {
      fontSize: 11,
      fontWeight: 'bold',
    },
    quickScrollContent: {
      gap: 12,
      paddingRight: 6,
    },
    quickFoodCard: {
      width: 145,
      borderRadius: 16,
      borderWidth: 1,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    quickImageWrap: {
      width: '100%',
      height: 95,
      position: 'relative',
    },
    quickFoodImage: {
      width: '100%',
      height: '100%',
    },
    quickImageGradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 40,
    },
    quickEmojiBadge: {
      position: 'absolute',
      top: 6,
      left: 6,
      backgroundColor: 'rgba(0,0,0,0.6)',
      width: 26,
      height: 26,
      borderRadius: 13,
      justifyContent: 'center',
      alignItems: 'center',
    },
    quickEmojiText: {
      fontSize: 14,
    },
    quickCalPill: {
      position: 'absolute',
      bottom: 6,
      right: 6,
      backgroundColor: 'rgba(0,0,0,0.7)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    quickCalText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
    },
    quickFoodContent: {
      padding: 10,
    },
    quickFoodName: {
      fontSize: 13,
      fontWeight: 'bold',
      marginBottom: 2,
    },
    quickFoodMacros: {
      fontSize: 10,
      marginBottom: 8,
    },
    quickAddButton: {
      borderRadius: 8,
      paddingVertical: 5,
      alignItems: 'center',
    },
    quickAddButtonText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: 'bold',
    },

    // 🔘 ACTION BUTTONS
    actionsContainer: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 18,
    },
    addButton: {
      flex: 2,
      borderRadius: 14,
      overflow: 'hidden',
      shadowColor: '#FF6B35',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 3,
    },
    addGradient: {
      paddingVertical: 14,
      alignItems: 'center',
    },
    addButtonText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: 'bold',
    },
    presetButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    presetButtonText: {
      fontSize: 13,
      fontWeight: 'bold',
    },

    // 🍽️ MEAL TIMELINE
    mealsHeaderRow: {
      marginBottom: 12,
    },
    mealSection: {
      marginBottom: 16,
    },
    mealBannerContainer: {
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    mealBannerBg: {
      width: '100%',
      minHeight: 80,
    },
    mealBannerImage: {
      borderRadius: 16,
    },
    mealBannerOverlay: {
      padding: 14,
      justifyContent: 'center',
    },
    mealBannerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    mealTitleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    mealEmojiBadge: {
      fontSize: 26,
    },
    mealBannerTitle: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    mealBannerSubtitle: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 11,
      marginTop: 1,
    },
    mealBannerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    mealTotalBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
    },
    mealTotalText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
    },
    mealAddQuickBtn: {
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
    },
    mealAddQuickText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: 'bold',
    },

    mealItemsList: {
      gap: 6,
    },
    foodItem: {
      borderRadius: 14,
      borderWidth: 1,
      padding: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
      elevation: 1,
    },
    foodInfo: {
      flex: 1,
    },
    foodName: {
      fontSize: 14,
      fontWeight: 'bold',
    },
    macroRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      marginTop: 5,
      gap: 6,
    },
    calorieTag: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    foodCalories: {
      fontSize: 11,
      fontWeight: 'bold',
    },
    macroTag: {
      fontSize: 10,
      fontWeight: '600',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 5,
    },
    foodActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    actionButton: {
      width: 32,
      height: 32,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    editText: {
      fontSize: 14,
    },
    deleteText: {
      fontSize: 14,
      fontWeight: 'bold',
    },

    mealEmptyPlaceholder: {
      borderRadius: 12,
      borderWidth: 1,
      borderStyle: 'dashed',
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    mealEmptyText: {
      fontSize: 12,
      fontWeight: '600',
    },

    // 🍽️ EMPTY CONTAINER
    emptyContainer: {
      alignItems: 'center',
      padding: 24,
      borderRadius: 20,
      borderWidth: 1,
      marginBottom: 16,
    },
    emptyImage: {
      width: 110,
      height: 110,
      borderRadius: 55,
      marginBottom: 14,
    },
    emptyText: {
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    emptySubText: {
      fontSize: 12,
      lineHeight: 18,
      marginTop: 6,
      textAlign: 'center',
      paddingHorizontal: 12,
      marginBottom: 16,
    },
    emptyAddButton: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 12,
    },
    emptyAddButtonText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: 'bold',
    },

    // 📊 CHARTS
    chartCard: {
      borderRadius: 20,
      borderWidth: 1,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    chartHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    chartTitle: {
      fontSize: 15,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    chartBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    chartBadgeText: {
      fontSize: 10,
      fontWeight: 'bold',
    },
    chart: {
      borderRadius: 16,
      marginLeft: -12,
    },

    // 💡 NUTRITION TIP CARD
    tipCardWrapper: {
      borderRadius: 20,
      overflow: 'hidden',
      marginBottom: 16,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
    tipCardBg: {
      width: '100%',
    },
    tipCardImage: {
      borderRadius: 20,
    },
    tipCardOverlay: {
      padding: 18,
    },
    tipBadge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      marginBottom: 8,
    },
    tipBadgeText: {
      color: '#fff',
      fontSize: 9,
      fontWeight: 'bold',
      letterSpacing: 0.8,
    },
    tipTitle: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 6,
    },
    tipDesc: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 12,
      lineHeight: 18,
    },

    // 🌟 MODAL STYLES
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.65)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 16,
    },
    modalContent: {
      borderRadius: 24,
      padding: 22,
      width: '100%',
      maxWidth: 440,
      maxHeight: '88%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 19,
      fontWeight: 'bold',
    },
    modalSub: {
      fontSize: 12,
      marginTop: 2,
    },
    modalCloseBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalClose: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 6,
      marginTop: 10,
    },
    input: {
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
    },
    macroInputRow: {
      flexDirection: 'row',
      marginTop: 4,
      marginBottom: 8,
    },
    macroInput: {
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 11,
      fontSize: 12,
      textAlign: 'center',
    },
    mealTypeContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 6,
    },
    mealTypeButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
    },
    mealTypeText: {
      fontSize: 12,
    },
    submitButton: {
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      marginTop: 18,
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: 'bold',
    },

    // Quick Goal pills
    quickGoalRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 6,
    },
    quickGoalPill: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
    },
    quickGoalPillText: {
      fontSize: 12,
      fontWeight: '600',
    },

    // Preset list in modal
    presetMealSelector: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: 12,
    },
    presetMealBtn: {
      flex: 1,
      paddingVertical: 6,
      borderRadius: 8,
      alignItems: 'center',
    },
    presetMealText: {
      fontSize: 11,
      fontWeight: '600',
    },
    presetListItem: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 14,
      borderWidth: 1,
      padding: 10,
      marginBottom: 8,
    },
    presetListImage: {
      width: 44,
      height: 44,
      borderRadius: 10,
      marginRight: 10,
    },
    presetInfo: {
      flex: 1,
    },
    presetName: {
      fontSize: 13,
      fontWeight: 'bold',
    },
    presetMacros: {
      fontSize: 10,
      marginTop: 2,
    },
    presetCalBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    presetCalories: {
      fontSize: 12,
      fontWeight: 'bold',
    },
  });

export default CaloriesScreen;