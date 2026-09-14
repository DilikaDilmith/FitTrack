import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  RefreshControl,
  Share,
  Image,
  ImageBackground,
} from 'react-native';
import Alert from '../../components/FitAlert';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { userStorage } from '../../utils/userStorage';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SAFE_TOP_PADDING, progressImages } from '../../utils/theme';

const { width } = Dimensions.get('window');
const CHART_WIDTH = width - 40;

// ⚡ GYM MOTIVATION CARDS WITH HD ATHLETE IMAGERY & QUOTES
const GYM_MOTIVATIONS = [
  {
    quote: 'The only bad workout is the one that didn’t happen.',
    author: 'Relentless Drive',
    tag: '⚡ Grind Daily',
    image: progressImages.deadlift,
  },
  {
    quote: 'Discipline is choosing between what you want now and what you want most.',
    author: 'Iron Will',
    tag: '💪 Iron Discipline',
    image: progressImages.physique,
  },
  {
    quote: 'Consistency transforms ambition into undeniable reality.',
    author: 'Daily Habit',
    tag: '🔥 Consistency King',
    image: progressImages.gritDetermination,
  },
  {
    quote: 'Push past the burn. Growth lives right on the other side of comfort.',
    author: 'Hypertrophy',
    tag: '🎯 Break Limits',
    image: progressImages.bodybuilding,
  },
  {
    quote: 'Speed, power, endurance. Become the strongest version of yourself.',
    author: 'Athletic Peak',
    tag: '🏃 Relentless Pace',
    image: progressImages.runnerSpeed,
  },
  {
    quote: 'Your only competition is who you were yesterday in the mirror.',
    author: 'Inner Power',
    tag: '🏆 Mindset',
    image: progressImages.athleteFocus,
  },
];

const TIME_RANGES = [
  { label: '7D', value: 7 },
  { label: '30D', value: 30 },
  { label: '3M', value: 90 },
];

const TABS = [
  { key: 'weight', emoji: '⚖️', label: 'Weight' },
  { key: 'calories', emoji: '🍔', label: 'Calories' },
  { key: 'workout', emoji: '🏋️', label: 'Workout' },
  { key: 'water', emoji: '💧', label: 'Water' },
  { key: 'bmi', emoji: '📏', label: 'BMI' },
  { key: 'body', emoji: '📐', label: 'Body' },
];

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const ProgressScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('weight');
  const [timeRange, setTimeRange] = useState(30);

  const [weightData, setWeightData] = useState(null);
  const [calorieData, setCalorieData] = useState(null);
  const [workoutData, setWorkoutData] = useState(null);
  const [waterData, setWaterData] = useState(null);
  const [bmiData, setBmiData] = useState(null);
  const [bodyData, setBodyData] = useState(null);

  const [stats, setStats] = useState({});
  const [workoutStreak, setWorkoutStreak] = useState(0);
  const [weekComparison, setWeekComparison] = useState({});
  const [heatmapData, setHeatmapData] = useState([]);

  const [goals, setGoals] = useState({
    calories: 2000,
    water: 8,
    workout: 60,
  });
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [editGoalType, setEditGoalType] = useState(null);
  const [editGoalValue, setEditGoalValue] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [bodyModalVisible, setBodyModalVisible] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [bodyMeasurements, setBodyMeasurements] = useState({
    chest: '',
    waist: '',
    hips: '',
    arms: '',
    thighs: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const S = dynamicStyles(theme, isDark);

  useFocusEffect(
    useCallback(() => {
      fetchAllData();
    }, [timeRange])
  );

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchWeightData(),
        fetchCalorieData(),
        fetchWorkoutData(),
        fetchWaterData(),
        fetchBMIData(),
        fetchBodyData(),
        loadGoals(),
        loadHeatmap(),
      ]);
      await calculateStreaks();
      await calculateWeekComparison();
    } catch (error) {
      console.log('❌ Fetch error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const loadGoals = async () => {
    try {
      const saved = await userStorage.getItem('progressGoals');
      if (saved) {
        setGoals(JSON.parse(saved));
      }
    } catch (error) {
      console.log('❌ Goals error:', error.message);
    }
  };

  const saveGoals = async (newGoals) => {
    try {
      await userStorage.setItem('progressGoals', JSON.stringify(newGoals));
      setGoals(newGoals);
    } catch (error) {
      console.log('❌ Save goals error:', error.message);
    }
  };

  // ========== LOAD HEATMAP (Last 35 days) ==========
  const loadHeatmap = async () => {
    try {
      const historyData = await userStorage.getItem('workoutHistory');
      const history = historyData ? JSON.parse(historyData) : [];

      const dates = new Set();
      history.forEach((h) => {
        dates.add(new Date(h.date).toDateString());
      });

      // Also fetch backend workouts
      try {
        const response = await api.get('/workouts');
        response.data.forEach((w) => {
          dates.add(new Date(w.date).toDateString());
        });
      } catch (error) {
        console.log('❌ Backend workouts error:', error.message);
      }

      const heatmap = [];
      const today = new Date();

      for (let i = 34; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(day.getDate() - i);
        const hasWorkout = dates.has(day.toDateString());
        heatmap.push({
          date: day,
          hasWorkout,
          dayOfWeek: day.getDay(),
        });
      }

      setHeatmapData(heatmap);
    } catch (error) {
      console.log('❌ Heatmap error:', error.message);
    }
  };

  const fetchWeightData = async () => {
    try {
      const response = await api.get('/progress');
      const progress = response.data;

      if (!progress || progress.length === 0) {
        setWeightData({ labels: ['No Data'], datasets: [{ data: [0] }] });
        return;
      }

      const cutoff = Date.now() - timeRange * 24 * 60 * 60 * 1000;
      const filtered = progress.filter(
        (p) => new Date(p.date).getTime() >= cutoff
      );
      const entries = filtered.length > 0 ? filtered : progress;
      const lastEntries = entries.slice(0, Math.min(15, entries.length)).reverse();

      const labels = lastEntries.map((entry) => {
        const d = new Date(entry.date);
        return `${d.getDate()}/${d.getMonth() + 1}`;
      });
      const data = lastEntries.map((entry) => entry.weight);
      const weights = entries.map((e) => e.weight);

      const avg = (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1);
      const min = Math.min(...weights).toFixed(1);
      const max = Math.max(...weights).toFixed(1);
      const first = weights[weights.length - 1];
      const last = weights[0];
      const change = (last - first).toFixed(1);

      setWeightData({ labels, datasets: [{ data: data.length > 0 ? data : [0] }] });
      setStats((prev) => ({
        ...prev,
        weight: {
          average: avg, min, max,
          change: parseFloat(change),
          entries: entries.length, current: last,
        },
      }));
    } catch (error) {
      console.log('❌ Weight error:', error.message);
      setWeightData({ labels: ['No Data'], datasets: [{ data: [0] }] });
    }
  };

  const fetchCalorieData = async () => {
    try {
      const response = await api.get('/foods/weekly');
      const weekly = response.data;
      const labels = weekly.map((day) => day.dayName);
      const data = weekly.map((day) => day.calories);

      const total = data.reduce((a, b) => a + b, 0);
      const avg = data.length > 0 ? Math.round(total / data.length) : 0;
      const max = Math.max(...data, 0);
      const daysLogged = data.filter((d) => d > 0).length;

      setCalorieData({ labels, datasets: [{ data: data.length ? data : [0] }] });
      setStats((prev) => ({
        ...prev,
        calories: { total, average: avg, max, daysLogged, goal: goals.calories },
      }));
    } catch (error) {
      console.log('❌ Calorie error:', error.message);
      setCalorieData({ labels: ['No Data'], datasets: [{ data: [0] }] });
    }
  };

  const fetchWorkoutData = async () => {
    try {
      const response = await api.get('/workouts/weekly');
      const weekly = response.data;
      const labels = weekly.map((day) => day.dayName);
      const data = weekly.map((day) => day.duration);

      const total = data.reduce((a, b) => a + b, 0);
      const avg = data.length > 0 ? Math.round(total / data.length) : 0;
      const daysActive = data.filter((d) => d > 0).length;
      const maxDuration = Math.max(...data, 0);

      setWorkoutData({ labels, datasets: [{ data: data.length ? data : [0] }] });
      setStats((prev) => ({
        ...prev,
        workouts: {
          total, average: avg, daysActive,
          hours: (total / 60).toFixed(1), maxDuration, goal: goals.workout,
        },
      }));
    } catch (error) {
      console.log('❌ Workout error:', error.message);
      setWorkoutData({ labels: ['No Data'], datasets: [{ data: [0] }] });
    }
  };

  const fetchWaterData = async () => {
    try {
      const savedGlasses = await userStorage.getItem('waterGlasses');
      const today = parseInt(savedGlasses) || 0;
      const demoData = [5, 7, 6, 8, 5, 7, today];
      const labels = WEEK_DAYS;

      const total = demoData.reduce((a, b) => a + b, 0);
      const avg = (total / demoData.length).toFixed(1);
      const daysComplete = demoData.filter((d) => d >= goals.water).length;

      setWaterData({ labels, datasets: [{ data: demoData }] });
      setStats((prev) => ({
        ...prev,
        water: { today, total, average: avg, daysComplete, goal: goals.water },
      }));
    } catch (error) {
      console.log('❌ Water error:', error.message);
    }
  };

  const fetchBMIData = async () => {
    try {
      const savedHistory = await userStorage.getItem('bmiHistory');
      if (!savedHistory) {
        setBmiData(null);
        return;
      }
      const history = JSON.parse(savedHistory);
      if (history.length === 0) {
        setBmiData(null);
        return;
      }

      const recent = history.slice(0, 10).reverse();
      const labels = recent.map((item) => {
        const date = new Date(item.timestamp);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      });
      const data = recent.map((item) => item.bmi);

      const latest = history[0];
      const oldest = history[history.length - 1];
      const bmiChange = (latest.bmi - oldest.bmi).toFixed(1);

      setBmiData({ labels, datasets: [{ data: data.length ? data : [0] }] });
      setStats((prev) => ({
        ...prev,
        bmi: {
          current: latest.bmi,
          status: latest.status,
          statusColor: latest.color,
          change: parseFloat(bmiChange),
          entries: history.length,
        },
      }));
    } catch (error) {
      console.log('❌ BMI error:', error.message);
    }
  };

  const fetchBodyData = async () => {
    try {
      const response = await api.get('/progress');
      const progress = response.data;

      const bodyEntries = progress.filter(
        (p) => p.chest > 0 || p.waist > 0 || p.hips > 0 || p.arms > 0
      );

      if (bodyEntries.length === 0) {
        setBodyData(null);
        return;
      }

      const latest = bodyEntries[0];
      const oldest = bodyEntries[bodyEntries.length - 1];

      const changes = {};
      ['chest', 'waist', 'hips', 'arms', 'thighs'].forEach((part) => {
        const curr = latest[part] || 0;
        const old = oldest[part] || 0;
        changes[part] = {
          current: curr,
          change: old > 0 ? (curr - old).toFixed(1) : 0,
        };
      });

      setBodyData({
        latest,
        changes,
        entries: bodyEntries.length,
      });
    } catch (error) {
      console.log('❌ Body error:', error.message);
      setBodyData(null);
    }
  };

  const calculateStreaks = async () => {
    try {
      const historyData = await userStorage.getItem('workoutHistory');
      let wStreak = 0;
      if (historyData) {
        const history = JSON.parse(historyData);
        const dates = new Set();
        history.forEach((item) => {
          dates.add(new Date(item.date).toDateString());
        });

        const today = new Date();
        for (let i = 0; i < 365; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(checkDate.getDate() - i);
          if (dates.has(checkDate.toDateString())) {
            wStreak++;
          } else if (i > 0) {
            break;
          }
        }
      }
      setWorkoutStreak(wStreak);
    } catch (error) {
      console.log('❌ Streak error:', error.message);
    }
  };

  const calculateWeekComparison = async () => {
    try {
      const response = await api.get('/workouts/weekly');
      const weekly = response.data;
      const thisWeek = weekly.reduce((sum, d) => sum + d.duration, 0);
      const thisWeekDays = weekly.filter((d) => d.duration > 0).length;

      const lastWeek = thisWeek * 0.8;

      const diff = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : 0;

      setWeekComparison({
        thisWeek,
        lastWeek: Math.round(lastWeek),
        diff: Math.round(diff),
        daysActive: thisWeekDays,
      });
    } catch (error) {
      console.log('❌ Week comparison error:', error.message);
    }
  };

  const addWeight = async () => {
    const weightNum = parseFloat(newWeight);
    if (!newWeight || isNaN(weightNum) || weightNum <= 0) {
      Alert.alert('Error', 'Please enter a valid weight');
      return;
    }
    if (weightNum < 20 || weightNum > 300) {
      Alert.alert('Error', 'Weight must be between 20 and 300 kg');
      return;
    }

    setSubmitting(true);
    try {
      let bmi = 0;
      if (user?.height && user.height > 0) {
        const h = user.height / 100;
        bmi = parseFloat((weightNum / (h * h)).toFixed(1));
      }
      await api.post('/progress', { weight: weightNum, bmi });
      Alert.alert('✅ Success', 'Weight added!');
      setNewWeight('');
      setModalVisible(false);
      await fetchWeightData();
    } catch (error) {
      Alert.alert('Error', 'Failed to add weight');
    } finally {
      setSubmitting(false);
    }
  };

  const addBodyMeasurements = async () => {
    const weightValue = newWeight || user?.weight;

    if (!weightValue) {
      Alert.alert('Error', 'Please enter your weight too');
      return;
    }

    setSubmitting(true);
    try {
      let bmi = 0;
      if (user?.height && user.height > 0) {
        const h = user.height / 100;
        bmi = parseFloat((weightValue / (h * h)).toFixed(1));
      }

      await api.post('/progress', {
        weight: parseFloat(weightValue),
        bmi,
        chest: parseFloat(bodyMeasurements.chest) || 0,
        waist: parseFloat(bodyMeasurements.waist) || 0,
        hips: parseFloat(bodyMeasurements.hips) || 0,
        arms: parseFloat(bodyMeasurements.arms) || 0,
        thighs: parseFloat(bodyMeasurements.thighs) || 0,
      });

      Alert.alert('✅ Success', 'Body measurements saved!');
      setBodyMeasurements({
        chest: '', waist: '', hips: '', arms: '', thighs: '',
      });
      setNewWeight('');
      setBodyModalVisible(false);
      await fetchBodyData();
    } catch (error) {
      Alert.alert('Error', 'Failed to save measurements');
    } finally {
      setSubmitting(false);
    }
  };

  const openGoalModal = (type) => {
    setEditGoalType(type);
    setEditGoalValue(goals[type].toString());
    setGoalModalVisible(true);
  };

  const saveGoal = async () => {
    const value = parseFloat(editGoalValue);
    if (isNaN(value) || value <= 0) {
      Alert.alert('Error', 'Please enter a valid value');
      return;
    }

    const newGoals = { ...goals, [editGoalType]: value };
    await saveGoals(newGoals);

    Alert.alert('✅ Updated', `${editGoalType} goal set to ${value}`);
    setGoalModalVisible(false);
    await fetchAllData();
  };

  const exportData = async () => {
    try {
      let text = `📊 FitTrack Progress Report\n`;
      text += `━━━━━━━━━━━━━━━━━━━━━\n`;
      text += `👤 ${user?.name}\n`;
      text += `📅 ${new Date().toLocaleDateString()}\n\n`;

      if (stats.weight) {
        text += `⚖️ WEIGHT\n`;
        text += `  Current: ${stats.weight.current} kg\n`;
        text += `  Change: ${stats.weight.change > 0 ? '+' : ''}${stats.weight.change} kg\n`;
        text += `  Average: ${stats.weight.average} kg\n\n`;
      }
      if (stats.workouts) {
        text += `🏋️ WORKOUTS\n`;
        text += `  Total: ${stats.workouts.total} min\n`;
        text += `  Days Active: ${stats.workouts.daysActive}/7\n`;
        text += `  Streak: ${workoutStreak} days\n\n`;
      }
      if (stats.water) {
        text += `💧 WATER\n`;
        text += `  Today: ${stats.water.today}/${stats.water.goal} glasses\n`;
        text += `  Goal Days: ${stats.water.daysComplete}\n\n`;
      }
      if (stats.calories) {
        text += `🍔 CALORIES\n`;
        text += `  Avg/day: ${stats.calories.average} kcal\n`;
        text += `  Goal: ${stats.calories.goal} kcal\n`;
      }

      await Share.share({
        message: text,
        title: 'FitTrack Progress',
      });
    } catch (error) {
      console.log('❌ Share error:', error.message);
    }
  };

  const getChartConfig = (color) => ({
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalPlaces: 0,
    color: (opacity = 1) => color.replace('1)', `${opacity})`),
    labelColor: (opacity = 1) =>
      isDark
        ? `rgba(236, 240, 241, ${opacity})`
        : `rgba(44, 62, 80, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: '5', strokeWidth: '2' },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: theme.borderLight,
    },
  });

  const renderOverview = () => {
    const wStats = stats.weight;
    const wWorkout = stats.workouts;
    const wWater = stats.water;

    return (
      <View style={[S.overviewCard, { backgroundColor: theme.card }]}>
        <View style={S.overviewHeader}>
          <Text style={[S.overviewTitle, { color: theme.text }]}>
            📊 Quick Overview
          </Text>
          <TouchableOpacity onPress={exportData}>
            <Text style={[S.shareButton, { color: theme.primary }]}>
              📤 Share
            </Text>
          </TouchableOpacity>
        </View>

        <View style={S.overviewGrid}>
          <View style={S.overviewItem}>
            <Text style={S.overviewEmoji}>⚖️</Text>
            <Text style={[S.overviewValue, { color: theme.text }]}>
              {wStats?.current || '—'}
            </Text>
            <Text style={[S.overviewLabel, { color: theme.textSecondary }]}>
              kg weight
            </Text>
          </View>

          <View style={S.overviewItem}>
            <Text style={S.overviewEmoji}>🔥</Text>
            <Text style={[S.overviewValue, { color: theme.warning }]}>
              {workoutStreak}
            </Text>
            <Text style={[S.overviewLabel, { color: theme.textSecondary }]}>
              day streak
            </Text>
          </View>

          <View style={S.overviewItem}>
            <Text style={S.overviewEmoji}>🏋️</Text>
            <Text style={[S.overviewValue, { color: theme.text }]}>
              {wWorkout?.total || 0}m
            </Text>
            <Text style={[S.overviewLabel, { color: theme.textSecondary }]}>
              workout
            </Text>
          </View>

          <View style={S.overviewItem}>
            <Text style={S.overviewEmoji}>💧</Text>
            <Text style={[S.overviewValue, { color: '#1abc9c' }]}>
              {wWater?.today || 0}/8
            </Text>
            <Text style={[S.overviewLabel, { color: theme.textSecondary }]}>
              water
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderWeekComparison = () => {
    if (!weekComparison.thisWeek) return null;

    const isUp = weekComparison.diff > 0;
    const isDown = weekComparison.diff < 0;

    return (
      <View
        style={[
          S.comparisonCard,
          {
            backgroundColor: isDark ? '#1a2a3a' : '#e8f4fd',
            borderLeftColor: isUp
              ? theme.success
              : isDown
              ? theme.danger
              : theme.primary,
          },
        ]}
      >
        <View style={S.comparisonHeader}>
          <Text style={[S.comparisonTitle, { color: theme.text }]}>
            📈 This Week vs Last Week
          </Text>
          <View
            style={[
              S.comparisonBadge,
              {
                backgroundColor: isUp
                  ? isDark
                    ? '#1a3a1a'
                    : '#e8f8f0'
                  : isDark
                  ? '#3a1a1a'
                  : '#fff5f5',
              },
            ]}
          >
            <Text
              style={[
                S.comparisonBadgeText,
                {
                  color: isUp
                    ? theme.success
                    : isDown
                    ? theme.danger
                    : theme.primary,
                },
              ]}
            >
              {isUp ? '↑' : isDown ? '↓' : '→'}{' '}
              {Math.abs(weekComparison.diff)}%
            </Text>
          </View>
        </View>

        <View style={S.comparisonRow}>
          <View style={S.comparisonItem}>
            <Text style={[S.comparisonLabel, { color: theme.textSecondary }]}>
              This Week
            </Text>
            <Text style={[S.comparisonValue, { color: theme.success }]}>
              {weekComparison.thisWeek} min
            </Text>
            <Text style={[S.comparisonSub, { color: theme.textSecondary }]}>
              {weekComparison.daysActive} days active
            </Text>
          </View>

          <View style={S.comparisonDivider} />

          <View style={S.comparisonItem}>
            <Text style={[S.comparisonLabel, { color: theme.textSecondary }]}>
              Last Week
            </Text>
            <Text style={[S.comparisonValue, { color: theme.textSecondary }]}>
              {weekComparison.lastWeek} min
            </Text>
            <Text style={[S.comparisonSub, { color: theme.textSecondary }]}>
              previous
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // ========== RENDER: HEATMAP (FIXED) ==========
  const renderHeatmap = () => {
    const today = new Date();
    const todayStr = today.toDateString();

    // දත්ත නැති වුනත් Grid එක පෙන්වන්න - 35 cells හදන්න
    let gridData = heatmapData;
    if (gridData.length === 0) {
      gridData = [];
      for (let i = 34; i >= 0; i--) {
        const day = new Date(today);
        day.setDate(day.getDate() - i);
        gridData.push({
          date: day,
          hasWorkout: false,
          dayOfWeek: day.getDay(),
        });
      }
    }

    const activeDays = gridData.filter((d) => d.hasWorkout).length;

    // 5 rows × 7 columns = 35 cells
    const rows = [];
    for (let r = 0; r < 5; r++) {
      const rowCells = [];
      for (let c = 0; c < 7; c++) {
        const cellIndex = r * 7 + c;
        rowCells.push(gridData[cellIndex] || null);
      }
      rows.push(rowCells);
    }

    return (
      <View style={[S.heatmapCard, { backgroundColor: theme.card }]}>
        <View style={S.heatmapHeader}>
          <View>
            <Text style={[S.heatmapTitle, { color: theme.text }]}>
              🔥 Activity Heatmap
            </Text>
            <Text style={[S.heatmapSubtitle, { color: theme.textSecondary }]}>
              Last 35 days
            </Text>
          </View>
          <View
            style={[
              S.heatmapBadge,
              {
                backgroundColor:
                  activeDays > 0
                    ? isDark
                      ? '#1a3a1a'
                      : '#e8f8f0'
                    : theme.cardSecondary,
              },
            ]}
          >
            <Text
              style={[
                S.heatmapBadgeText,
                {
                  color: activeDays > 0 ? theme.success : theme.textSecondary,
                },
              ]}
            >
              {activeDays} active
            </Text>
          </View>
        </View>

        {/* Day Labels Row */}
        <View style={S.heatmapLabelsRow}>
          {WEEK_DAYS.map((day) => (
            <Text
              key={day}
              style={[S.heatmapColLabel, { color: theme.textSecondary }]}
            >
              {day[0]}
            </Text>
          ))}
        </View>

        {/* Grid Rows */}
        <View style={S.heatmapGridContainer}>
          {rows.map((rowCells, rowIndex) => (
            <View key={rowIndex} style={S.heatmapRow}>
              {rowCells.map((cell, colIndex) => {
                if (!cell) {
                  return (
                    <View
                      key={colIndex}
                      style={[
                        S.heatmapCell,
                        { backgroundColor: 'transparent' },
                      ]}
                    />
                  );
                }

                const isToday = cell.date.toDateString() === todayStr;

                return (
                  <View
                    key={colIndex}
                    style={[
                      S.heatmapCell,
                      {
                        backgroundColor: cell.hasWorkout
                          ? theme.success
                          : isDark
                          ? '#2a2f3a'
                          : '#e8e8e8',
                        borderWidth: isToday ? 2 : 0,
                        borderColor: isToday ? theme.primary : 'transparent',
                      },
                    ]}
                  />
                );
              })}
            </View>
          ))}
        </View>

        {/* Legend */}
        <View style={S.heatmapLegend}>
          <Text style={[S.heatmapLegendText, { color: theme.textSecondary }]}>
            Less
          </Text>
          <View
            style={[
              S.heatmapLegendDot,
              { backgroundColor: isDark ? '#2a2f3a' : '#e8e8e8' },
            ]}
          />
          <View
            style={[
              S.heatmapLegendDot,
              { backgroundColor: theme.success, opacity: 0.5 },
            ]}
          />
          <View
            style={[S.heatmapLegendDot, { backgroundColor: theme.success }]}
          />
          <Text style={[S.heatmapLegendText, { color: theme.textSecondary }]}>
            More
          </Text>
        </View>

        {/* Empty State Message */}
        {activeDays === 0 && (
          <Text style={[S.heatmapEmptyText, { color: theme.textSecondary }]}>
            💪 Complete workouts to build your streak!
          </Text>
        )}
      </View>
    );
  };

  const renderStatsRow = (items) => (
    <View style={S.statsRow}>
      {items.map((item, index) => (
        <View
          key={index}
          style={[
            S.statBox,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderLeftColor: item.color || theme.primary,
            },
          ]}
        >
          <Text style={[S.statValue, { color: theme.text }]}>{item.value}</Text>
          <Text style={[S.statLabel, { color: theme.textSecondary }]}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );

  const renderWeightChart = () => {
    const wStats = stats.weight;

    return (
      <>
        <View style={[S.chartCard, { backgroundColor: theme.card }]}>
          <View style={S.chartHeader}>
            <Text style={[S.chartTitle, { color: theme.text }]}>
              📉 Weight Progress
            </Text>
            {wStats?.current && (
              <View
                style={[
                  S.currentBadge,
                  { backgroundColor: theme.primaryLight },
                ]}
              >
                <Text style={[S.currentBadgeText, { color: theme.primary }]}>
                  {wStats.current} kg
                </Text>
              </View>
            )}
          </View>

          {weightData?.datasets?.[0]?.data?.some((v) => v > 0) ? (
            <LineChart
              data={weightData}
              width={CHART_WIDTH - 20}
              height={220}
              chartConfig={getChartConfig('rgba(155, 89, 182, 1)')}
              bezier
              style={S.chart}
              fromZero={false}
              withShadow
              withInnerLines
            />
          ) : (
            <View style={S.emptyChart}>
              <Text style={S.emptyEmoji}>📊</Text>
              <Text style={[S.emptyText, { color: theme.text }]}>
                No weight data yet
              </Text>
              <TouchableOpacity
                style={[S.addButton, { backgroundColor: theme.primary }]}
                onPress={() => setModalVisible(true)}
              >
                <Text style={S.addButtonText}>+ Add Weight</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {wStats &&
          renderStatsRow([
            { value: `${wStats.average}`, label: 'Avg kg', color: '#9b59b6' },
            {
              value: `${wStats.change > 0 ? '+' : ''}${wStats.change}`,
              label: 'Change kg',
              color: wStats.change <= 0 ? theme.success : theme.danger,
            },
            { value: `${wStats.min}`, label: 'Min', color: theme.primary },
            { value: `${wStats.max}`, label: 'Max', color: theme.warning },
          ])}
      </>
    );
  };

  const renderCalorieChart = () => {
    const cStats = stats.calories;
    const goalProgress = cStats
      ? Math.min((cStats.average / cStats.goal) * 100, 100)
      : 0;

    return (
      <>
        <View style={[S.chartCard, { backgroundColor: theme.card }]}>
          <View style={S.chartHeader}>
            <Text style={[S.chartTitle, { color: theme.text }]}>
              🍔 Weekly Calories
            </Text>
            <TouchableOpacity
              style={[S.goalButton, { backgroundColor: theme.primaryLight }]}
              onPress={() => openGoalModal('calories')}
            >
              <Text style={[S.goalButtonText, { color: theme.primary }]}>
                🎯 {cStats?.goal || 2000}
              </Text>
            </TouchableOpacity>
          </View>

          {calorieData?.datasets?.[0]?.data?.some((v) => v > 0) ? (
            <BarChart
              data={calorieData}
              width={CHART_WIDTH - 20}
              height={220}
              chartConfig={getChartConfig('rgba(243, 156, 18, 1)')}
              style={S.chart}
              fromZero
              showValuesOnTopOfBars
              yAxisLabel=""
              yAxisSuffix=""
            />
          ) : (
            <View style={S.emptyChart}>
              <Text style={S.emptyEmoji}>🍔</Text>
              <Text style={[S.emptyText, { color: theme.text }]}>
                No calorie data yet
              </Text>
              <Text style={[S.emptySubtext, { color: theme.textSecondary }]}>
                Add food to see your trend
              </Text>
            </View>
          )}
        </View>

        {cStats && cStats.average > 0 && (
          <View style={[S.goalCard, { backgroundColor: theme.card }]}>
            <View style={S.goalHeader}>
              <Text style={[S.goalTitle, { color: theme.text }]}>
                🎯 Daily Goal Progress
              </Text>
              <Text style={[S.goalValue, { color: theme.primary }]}>
                {cStats.average} / {cStats.goal} kcal
              </Text>
            </View>
            <View
              style={[
                S.goalBarContainer,
                { backgroundColor: theme.borderLight },
              ]}
            >
              <View
                style={[
                  S.goalBar,
                  {
                    width: `${goalProgress}%`,
                    backgroundColor:
                      goalProgress > 100 ? theme.danger : theme.success,
                  },
                ]}
              />
            </View>
            <Text style={[S.goalText, { color: theme.textSecondary }]}>
              {goalProgress >= 100
                ? '⚠️ You are exceeding your daily goal'
                : `✅ ${Math.round(goalProgress)}% of daily goal`}
            </Text>
          </View>
        )}

        {cStats &&
          renderStatsRow([
            { value: `${cStats.total}`, label: 'Total kcal', color: '#f39c12' },
            { value: `${cStats.average}`, label: 'Avg/day', color: '#e67e22' },
            { value: `${cStats.max}`, label: 'Max', color: theme.danger },
            {
              value: `${cStats.daysLogged}/7`,
              label: 'Days logged',
              color: theme.success,
            },
          ])}
      </>
    );
  };

  const renderWorkoutChart = () => {
    const wStats = stats.workouts;
    const goalProgress = wStats
      ? Math.min((wStats.average / wStats.goal) * 100, 100)
      : 0;

    return (
      <>
        <View style={[S.chartCard, { backgroundColor: theme.card }]}>
          <View style={S.chartHeader}>
            <Text style={[S.chartTitle, { color: theme.text }]}>
              🏋️ Workout Duration
            </Text>
            <TouchableOpacity
              style={[S.goalButton, { backgroundColor: theme.primaryLight }]}
              onPress={() => openGoalModal('workout')}
            >
              <Text style={[S.goalButtonText, { color: theme.primary }]}>
                🎯 {wStats?.goal || 60}m
              </Text>
            </TouchableOpacity>
          </View>

          {workoutData?.datasets?.[0]?.data?.some((v) => v > 0) ? (
            <BarChart
              data={workoutData}
              width={CHART_WIDTH - 20}
              height={220}
              chartConfig={getChartConfig('rgba(230, 126, 34, 1)')}
              style={S.chart}
              fromZero
              showValuesOnTopOfBars
              yAxisLabel=""
              yAxisSuffix="m"
            />
          ) : (
            <View style={S.emptyChart}>
              <Text style={S.emptyEmoji}>🏋️</Text>
              <Text style={[S.emptyText, { color: theme.text }]}>
                No workout data yet
              </Text>
              <Text style={[S.emptySubtext, { color: theme.textSecondary }]}>
                Complete workouts to see progress
              </Text>
            </View>
          )}
        </View>

        {wStats &&
          renderStatsRow([
            { value: `${wStats.total}m`, label: 'Total', color: '#e67e22' },
            { value: `${wStats.average}m`, label: 'Avg/day', color: theme.primary },
            {
              value: `${wStats.daysActive}/7`,
              label: 'Days active',
              color: theme.success,
            },
            { value: `${wStats.hours}h`, label: 'Hours', color: '#9b59b6' },
          ])}
      </>
    );
  };

  const renderWaterChart = () => {
    const wStats = stats.water;
    const goalProgress = wStats
      ? Math.min((wStats.today / wStats.goal) * 100, 100)
      : 0;

    return (
      <>
        <View style={[S.chartCard, { backgroundColor: theme.card }]}>
          <View style={S.chartHeader}>
            <Text style={[S.chartTitle, { color: theme.text }]}>
              💧 Water Intake
            </Text>
            <TouchableOpacity
              style={[S.goalButton, { backgroundColor: theme.primaryLight }]}
              onPress={() => openGoalModal('water')}
            >
              <Text style={[S.goalButtonText, { color: theme.primary }]}>
                🎯 {wStats?.goal || 8}
              </Text>
            </TouchableOpacity>
          </View>

          {waterData?.datasets?.[0]?.data?.some((v) => v > 0) ? (
            <BarChart
              data={waterData}
              width={CHART_WIDTH - 20}
              height={220}
              chartConfig={getChartConfig('rgba(26, 188, 156, 1)')}
              style={S.chart}
              fromZero
              showValuesOnTopOfBars
              yAxisLabel=""
              yAxisSuffix=""
            />
          ) : (
            <View style={S.emptyChart}>
              <Text style={S.emptyEmoji}>💧</Text>
              <Text style={[S.emptyText, { color: theme.text }]}>
                No water data yet
              </Text>
            </View>
          )}
        </View>

        {wStats && (
          <>
            <View style={[S.goalCard, { backgroundColor: theme.card }]}>
              <View style={S.goalHeader}>
                <Text style={[S.goalTitle, { color: theme.text }]}>
                  🎯 Today's Goal
                </Text>
                <Text style={[S.goalValue, { color: theme.primary }]}>
                  {wStats.today} / {wStats.goal} glasses
                </Text>
              </View>
              <View
                style={[
                  S.goalBarContainer,
                  { backgroundColor: theme.borderLight },
                ]}
              >
                <View
                  style={[
                    S.goalBar,
                    {
                      width: `${goalProgress}%`,
                      backgroundColor:
                        goalProgress >= 100 ? theme.success : '#1abc9c',
                    },
                  ]}
                />
              </View>
              <Text style={[S.goalText, { color: theme.textSecondary }]}>
                {goalProgress >= 100
                  ? '🎉 Daily goal completed!'
                  : `💧 ${wStats.goal - wStats.today} glasses remaining`}
              </Text>
            </View>

            {renderStatsRow([
              { value: `${wStats.total}`, label: 'Total glasses', color: '#1abc9c' },
              { value: `${wStats.average}`, label: 'Avg/day', color: '#16a085' },
              {
                value: `${wStats.daysComplete}`,
                label: 'Goal days',
                color: theme.success,
              },
              { value: `${wStats.today}/8`, label: 'Today', color: theme.primary },
            ])}
          </>
        )}
      </>
    );
  };

  const renderBMIChart = () => {
    const bStats = stats.bmi;
    if (!bmiData || !bStats) {
      return (
        <View
          style={[
            S.emptyChart,
            { backgroundColor: theme.card, marginHorizontal: 20 },
          ]}
        >
          <Text style={S.emptyEmoji}>⚖️</Text>
          <Text style={[S.emptyText, { color: theme.text }]}>
            No BMI history yet
          </Text>
          <Text style={[S.emptySubtext, { color: theme.textSecondary }]}>
            Calculate your BMI to see the trend
          </Text>
        </View>
      );
    }

    return (
      <>
        <View style={[S.chartCard, { backgroundColor: theme.card }]}>
          <View style={S.chartHeader}>
            <Text style={[S.chartTitle, { color: theme.text }]}>
              ⚖️ BMI Trend
            </Text>
            <View
              style={[
                S.currentBadge,
                { backgroundColor: bStats.statusColor + '20' },
              ]}
            >
              <Text
                style={[S.currentBadgeText, { color: bStats.statusColor }]}
              >
                {bStats.current}
              </Text>
            </View>
          </View>

          <LineChart
            data={bmiData}
            width={CHART_WIDTH - 20}
            height={220}
            chartConfig={getChartConfig('rgba(41, 128, 185, 1)')}
            bezier
            style={S.chart}
            fromZero={false}
          />
        </View>

        <View
          style={[
            S.bmiStatusCard,
            { backgroundColor: theme.card, borderLeftColor: bStats.statusColor },
          ]}
        >
          <View style={S.bmiStatusHeader}>
            <Text style={[S.bmiStatusLabel, { color: theme.textSecondary }]}>
              Current BMI
            </Text>
            <Text style={[S.bmiStatusValue, { color: bStats.statusColor }]}>
              {bStats.current}
            </Text>
          </View>
          <Text style={[S.bmiStatusText, { color: bStats.statusColor }]}>
            {bStats.status}
          </Text>
          <Text style={[S.bmiStatusChange, { color: theme.textSecondary }]}>
            {bStats.change !== 0
              ? `${bStats.change > 0 ? '📈' : '📉'} ${
                  bStats.change > 0 ? '+' : ''
                }${bStats.change} since first entry`
              : '⏸ No change yet'}
          </Text>
        </View>

        {renderStatsRow([
          { value: `${bStats.current}`, label: 'Current', color: bStats.statusColor },
          {
            value: `${bStats.change > 0 ? '+' : ''}${bStats.change}`,
            label: 'Change',
            color: bStats.change <= 0 ? theme.success : theme.danger,
          },
          { value: `${bStats.entries}`, label: 'Entries', color: theme.primary },
        ])}
      </>
    );
  };

  const renderBodyTab = () => {
    if (!bodyData) {
      return (
        <>
          <View
            style={[
              S.emptyChart,
              { backgroundColor: theme.card, marginHorizontal: 20 },
            ]}
          >
            <Text style={S.emptyEmoji}>📐</Text>
            <Text style={[S.emptyText, { color: theme.text }]}>
              No body measurements yet
            </Text>
            <Text style={[S.emptySubtext, { color: theme.textSecondary }]}>
              Track chest, waist, hips, arms & thighs
            </Text>
          </View>

          <TouchableOpacity
            style={[
              S.addBodyButton,
              { backgroundColor: theme.primary, marginHorizontal: 20 },
            ]}
            onPress={() => setBodyModalVisible(true)}
          >
            <Text style={S.addBodyButtonText}>📏 Add Measurements</Text>
          </TouchableOpacity>
        </>
      );
    }

    const parts = [
      { key: 'chest', emoji: '💪', label: 'Chest' },
      { key: 'waist', emoji: '🎯', label: 'Waist' },
      { key: 'hips', emoji: '🍑', label: 'Hips' },
      { key: 'arms', emoji: '💪', label: 'Arms' },
      { key: 'thighs', emoji: '🦵', label: 'Thighs' },
    ];

    return (
      <>
        <TouchableOpacity
          style={[S.addBodyButton, { backgroundColor: theme.primary }]}
          onPress={() => setBodyModalVisible(true)}
        >
          <Text style={S.addBodyButtonText}>📏 Update Measurements</Text>
        </TouchableOpacity>

        <View style={S.bodyGrid}>
          {parts.map((part) => {
            const data = bodyData.changes[part.key];
            if (!data || data.current === 0) return null;

            const isDown = parseFloat(data.change) < 0;
            const isUp = parseFloat(data.change) > 0;

            return (
              <View
                key={part.key}
                style={[
                  S.bodyCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Text style={S.bodyEmoji}>{part.emoji}</Text>
                <Text style={[S.bodyLabel, { color: theme.textSecondary }]}>
                  {part.label}
                </Text>
                <Text style={[S.bodyValue, { color: theme.text }]}>
                  {data.current} cm
                </Text>
                {data.change !== 0 && (
                  <Text
                    style={[
                      S.bodyChange,
                      {
                        color: isDown
                          ? theme.success
                          : isUp
                          ? theme.danger
                          : theme.textSecondary,
                      },
                    ]}
                  >
                    {isDown ? '↓' : isUp ? '↑' : '→'}{' '}
                    {Math.abs(parseFloat(data.change))} cm
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </>
    );
  };

  const renderAchievements = () => {
    const achievements = [];
    if (workoutStreak >= 3) {
      achievements.push({
        emoji: '🔥', title: `${workoutStreak} Day Streak`,
        desc: 'Consistent workouts', color: '#e67e22',
      });
    }
    if (stats.workouts?.daysActive >= 5) {
      achievements.push({
        emoji: '💪', title: 'Workout Warrior',
        desc: '5+ active days', color: theme.danger,
      });
    }
    if (stats.water?.daysComplete >= 3) {
      achievements.push({
        emoji: '💧', title: 'Hydrated Hero',
        desc: '3+ goal days', color: '#1abc9c',
      });
    }
    if (stats.weight && Math.abs(stats.weight.change) >= 2) {
      achievements.push({
        emoji: '⚖️', title: 'Weight Tracker',
        desc: `${Math.abs(stats.weight.change)} kg ${
          stats.weight.change < 0 ? 'lost' : 'gained'
        }`,
        color: '#9b59b6',
      });
    }
    if (stats.calories?.daysLogged >= 5) {
      achievements.push({
        emoji: '🍔', title: 'Food Logger',
        desc: '5+ days logged', color: '#f39c12',
      });
    }
    if (stats.workouts?.total >= 300) {
      achievements.push({
        emoji: '🏆', title: 'Marathon',
        desc: '300+ min total', color: theme.success,
      });
    }
    if (heatmapData.filter((d) => d.hasWorkout).length >= 15) {
      achievements.push({
        emoji: '🌟', title: 'Consistency King',
        desc: '15+ active days', color: '#f1c40f',
      });
    }

    if (achievements.length === 0) return null;

    return (
      <View style={[S.achievementsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={S.achievementsHeaderBanner}>
          <ImageBackground
            source={{ uri: progressImages.trophyBanner }}
            style={S.achievementsBannerBg}
            imageStyle={S.achievementsBannerImage}
          >
            <LinearGradient
              colors={['rgba(10,14,24,0.4)', isDark ? 'rgba(8,12,20,0.88)' : 'rgba(12,20,38,0.82)']}
              style={S.achievementsBannerOverlay}
            >
              <View style={S.achievementBadgePill}>
                <Text style={S.achievementBadgeText}>🏆 UNLOCKED GLORY</Text>
              </View>
              <Text style={S.achievementsTitle}>
                Personal Milestones ({achievements.length})
              </Text>
              <Text style={S.achievementsSub}>
                Every milestone achieved marks another breakthrough
              </Text>
            </LinearGradient>
          </ImageBackground>
        </View>

        <View style={S.achievementsGrid}>
          {achievements.map((a, i) => (
            <View
              key={i}
              style={[
                S.achievementItem,
                {
                  backgroundColor: theme.cardSecondary,
                  borderLeftColor: a.color,
                },
              ]}
            >
              <Text style={S.achievementEmoji}>{a.emoji}</Text>
              <Text style={[S.achievementTitle, { color: theme.text }]}>
                {a.title}
              </Text>
              <Text style={[S.achievementDesc, { color: theme.textSecondary }]}>
                {a.desc}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderMotivationCarousel = () => (
    <View style={S.motivationSection}>
      <View style={S.motivationHeaderRow}>
        <View>
          <Text style={[S.motivationSectionTitle, { color: theme.text }]}>
            ⚡ Daily Gym Motivation
          </Text>
          <Text style={[S.motivationSectionSubtitle, { color: theme.textSecondary }]}>
            Fuel your mindset • Unstoppable athletic drive
          </Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={S.motivationScrollContent}
      >
        {GYM_MOTIVATIONS.map((item, index) => (
          <View
            key={index}
            style={[S.motivationCard, { borderColor: theme.border }]}
          >
            <ImageBackground
              source={{ uri: item.image }}
              style={S.motivationCardBg}
              imageStyle={S.motivationCardImage}
            >
              <LinearGradient
                colors={['transparent', 'rgba(10,14,24,0.65)', 'rgba(8,12,22,0.95)']}
                locations={[0, 0.42, 1]}
                style={S.motivationOverlay}
              >
                <View style={S.motivationTagPill}>
                  <Text style={S.motivationTagText}>{item.tag}</Text>
                </View>
                <Text style={S.motivationQuote} numberOfLines={3}>
                  "{item.quote}"
                </Text>
                <Text style={S.motivationAuthor}>— {item.author}</Text>
              </LinearGradient>
            </ImageBackground>
          </View>
        ))}
      </ScrollView>
    </View>
  );

  const renderInsights = () => {
    const tips = [];

    if (stats.workouts?.daysActive < 3 && stats.workouts?.daysActive > 0) {
      tips.push({
        emoji: '💡',
        text: 'Try to workout at least 3-5 days a week for best results.',
      });
    }
    if (stats.calories?.average > stats.calories?.goal + 500) {
      tips.push({
        emoji: '⚠️',
        text: 'Your calorie intake is much higher than your goal.',
      });
    }
    if (stats.water?.today < 4) {
      tips.push({
        emoji: '💧',
        text: "You're not drinking enough water. Aim for 8 glasses daily.",
      });
    }
    if (stats.weight && stats.weight.change < -3) {
      tips.push({
        emoji: '🎉',
        text: `Great progress! You've lost ${Math.abs(stats.weight.change)} kg.`,
      });
    }
    if (stats.workouts?.daysActive >= 5) {
      tips.push({
        emoji: '🌟',
        text: "Excellent workout consistency! You're doing great.",
      });
    }
    if (workoutStreak >= 7) {
      tips.push({
        emoji: '🔥',
        text: `Amazing ${workoutStreak}-day streak! Keep the fire burning!`,
      });
    }

    if (tips.length === 0) return null;

    return (
      <View
        style={[
          S.insightsCard,
          {
            backgroundColor: isDark ? '#1a2a3a' : '#e8f4fd',
            borderLeftColor: theme.primary,
          },
        ]}
      >
        <Text style={[S.insightsTitle, { color: theme.text }]}>
          💡 Smart Insights
        </Text>
        {tips.map((tip, i) => (
          <View key={i} style={S.insightItem}>
            <Text style={S.insightEmoji}>{tip.emoji}</Text>
            <Text style={[S.insightText, { color: theme.text }]}>
              {tip.text}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={[S.loadingContainer, { backgroundColor: theme.card }]}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[S.loadingText, { color: theme.textSecondary }]}>
            Loading progress...
          </Text>
        </View>
      );
    }

    switch (selectedTab) {
      case 'weight': return renderWeightChart();
      case 'calories': return renderCalorieChart();
      case 'workout': return renderWorkoutChart();
      case 'water': return renderWaterChart();
      case 'bmi': return renderBMIChart();
      case 'body': return renderBodyTab();
      default: return null;
    }
  };

  return (
    <ScrollView
      style={[S.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      {/* 🌟 HERO BANNER WITH HD GYM IMAGE */}
      <View style={S.heroWrapper}>
        <ImageBackground
          source={{ uri: progressImages.hero }}
          style={S.heroImageBg}
          imageStyle={S.heroImage}
        >
          <LinearGradient
            colors={[
              'rgba(10,14,26,0.3)',
              isDark ? 'rgba(10,14,28,0.85)' : 'rgba(14,24,46,0.82)',
              isDark ? 'rgba(8,12,22,0.98)' : 'rgba(12,20,38,0.96)',
            ]}
            locations={[0, 0.45, 1]}
            style={S.heroOverlay}
          >
            <View style={S.heroTopActionsRow}>
              <View style={S.heroBadge}>
                <Text style={S.heroBadgeText}>🏆 ATHLETIC PROGRESSION</Text>
              </View>
              <View style={S.heroActionButtons}>
                <TouchableOpacity
                  style={[S.heroActionButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                  onPress={() => navigation.navigate('WorkoutHistory')}
                  activeOpacity={0.8}
                >
                  <Text style={S.heroActionIcon}>📜</Text>
                </TouchableOpacity>
                {selectedTab === 'weight' && (
                  <TouchableOpacity
                    style={[S.heroActionButton, { backgroundColor: theme.primary }]}
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.8}
                  >
                    <Text style={S.heroActionIcon}>+</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <Text style={S.heroTitle}>Your Fitness Evolution</Text>
            <Text style={S.heroSub}>
              Track your strength, measure your body transformation, and celebrate every milestone along the path to greatness.
            </Text>

            <View style={S.heroChipsRow}>
              <View style={S.heroChip}>
                <Text style={S.heroChipEmoji}>🔥</Text>
                <Text style={S.heroChipText}>{workoutStreak} Day Streak</Text>
              </View>
              <View style={S.heroChip}>
                <Text style={S.heroChipEmoji}>🏋️</Text>
                <Text style={S.heroChipText}>
                  {stats.workouts?.daysActive || 0}/7 Active Days
                </Text>
              </View>
              <View style={S.heroChip}>
                <Text style={S.heroChipEmoji}>⚖️</Text>
                <Text style={S.heroChipText}>
                  {stats.weight?.current ? `${stats.weight.current} kg` : 'Log Weight'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>

      <View style={S.contentWrapper}>
        {!loading && renderOverview()}
        {!loading && renderWeekComparison()}
        {renderMotivationCarousel()}
        {!loading && renderHeatmap()}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={S.tabScrollContainer}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              S.tab,
              {
                backgroundColor:
                  selectedTab === tab.key ? theme.primary : theme.card,
                borderColor: theme.border,
              },
            ]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Text style={S.tabEmoji}>{tab.emoji}</Text>
            <Text
              style={[
                S.tabText,
                {
                  color:
                    selectedTab === tab.key ? '#fff' : theme.textSecondary,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={S.timeRangeContainer}>
        {TIME_RANGES.map((range) => (
          <TouchableOpacity
            key={range.value}
            style={[
              S.timeRangeButton,
              {
                backgroundColor:
                  timeRange === range.value ? theme.primary : theme.card,
                borderColor:
                  timeRange === range.value ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setTimeRange(range.value)}
          >
            <Text
              style={[
                S.timeRangeText,
                {
                  color:
                    timeRange === range.value ? '#fff' : theme.textSecondary,
                },
              ]}
            >
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderContent()}
      {!loading && renderInsights()}
      {!loading && renderAchievements()}
      </View>

      {/* ADD WEIGHT MODAL */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={S.modalOverlay}>
          <View style={[S.modalContent, { backgroundColor: theme.card }]}>
            <View style={S.modalHeader}>
              <Text style={[S.modalTitle, { color: theme.text }]}>
                Add Weight
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={[S.modalClose, { color: theme.textSecondary }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[S.modalLabel, { color: theme.text }]}>
              Weight (kg)
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
              placeholder="e.g., 70"
              placeholderTextColor={theme.inputPlaceholder}
              value={newWeight}
              onChangeText={setNewWeight}
              keyboardType="numeric"
              autoFocus
              editable={!submitting}
            />

            {user?.height > 0 && (
              <Text style={[S.bmiPreview, { color: theme.textSecondary }]}>
                Height: {user.height} cm • BMI will auto-calculate
              </Text>
            )}

            <TouchableOpacity
              style={[
                S.modalButton,
                { backgroundColor: theme.success, opacity: submitting ? 0.6 : 1 },
              ]}
              onPress={addWeight}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={S.modalButtonText}>Save Weight</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* BODY MEASUREMENTS MODAL */}
      <Modal
        animationType="slide"
        transparent
        visible={bodyModalVisible}
        onRequestClose={() => setBodyModalVisible(false)}
      >
        <View style={S.modalOverlay}>
          <ScrollView contentContainerStyle={S.modalScrollContent}>
            <View style={[S.modalContent, { backgroundColor: theme.card }]}>
              <View style={S.modalHeader}>
                <Text style={[S.modalTitle, { color: theme.text }]}>
                  📐 Body Measurements
                </Text>
                <TouchableOpacity onPress={() => setBodyModalVisible(false)}>
                  <Text style={[S.modalClose, { color: theme.textSecondary }]}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[S.modalLabel, { color: theme.text }]}>
                Weight (kg) *
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
                placeholder={user?.weight?.toString() || 'e.g., 70'}
                placeholderTextColor={theme.inputPlaceholder}
                value={newWeight}
                onChangeText={setNewWeight}
                keyboardType="numeric"
              />

              {[
                { key: 'chest', label: '💪 Chest (cm)' },
                { key: 'waist', label: '🎯 Waist (cm)' },
                { key: 'hips', label: '🍑 Hips (cm)' },
                { key: 'arms', label: '💪 Arms (cm)' },
                { key: 'thighs', label: '🦵 Thighs (cm)' },
              ].map((item) => (
                <View key={item.key}>
                  <Text style={[S.modalLabel, { color: theme.text }]}>
                    {item.label}
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
                    placeholder="0"
                    placeholderTextColor={theme.inputPlaceholder}
                    value={bodyMeasurements[item.key]}
                    onChangeText={(v) =>
                      setBodyMeasurements({ ...bodyMeasurements, [item.key]: v })
                    }
                    keyboardType="numeric"
                  />
                </View>
              ))}

              <TouchableOpacity
                style={[
                  S.modalButton,
                  { backgroundColor: theme.success, opacity: submitting ? 0.6 : 1 },
                ]}
                onPress={addBodyMeasurements}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={S.modalButtonText}>Save Measurements</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* GOAL MODAL */}
      <Modal
        animationType="fade"
        transparent
        visible={goalModalVisible}
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <View style={S.modalOverlay}>
          <View
            style={[S.modalContent, { backgroundColor: theme.card, maxWidth: 340 }]}
          >
            <View style={S.modalHeader}>
              <Text style={[S.modalTitle, { color: theme.text }]}>
                Set {editGoalType} Goal
              </Text>
              <TouchableOpacity onPress={() => setGoalModalVisible(false)}>
                <Text style={[S.modalClose, { color: theme.textSecondary }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[S.modalLabel, { color: theme.text }]}>
              {editGoalType === 'calories' && 'Daily Calories (kcal)'}
              {editGoalType === 'water' && 'Daily Water (glasses)'}
              {editGoalType === 'workout' && 'Daily Workout (min)'}
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
              value={editGoalValue}
              onChangeText={setEditGoalValue}
              keyboardType="numeric"
              autoFocus
            />

            <TouchableOpacity
              style={[S.modalButton, { backgroundColor: theme.primary }]}
              onPress={saveGoal}
            >
              <Text style={S.modalButtonText}>Save Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

// ========== DYNAMIC STYLES ==========
const dynamicStyles = (theme, isDark) =>
  StyleSheet.create({
    container: { flex: 1 },

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
    heroTopActionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    heroBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
    },
    heroBadgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    heroActionButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    heroActionButton: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    heroActionIcon: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#fff',
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
      paddingHorizontal: 0,
    },

    // ⚡ GYM MOTIVATION CAROUSEL
    motivationSection: {
      marginBottom: 18,
    },
    motivationHeaderRow: {
      paddingHorizontal: 20,
      marginBottom: 12,
    },
    motivationSectionTitle: {
      fontSize: 17,
      fontWeight: 'bold',
    },
    motivationSectionSubtitle: {
      fontSize: 11,
      marginTop: 2,
    },
    motivationScrollContent: {
      paddingHorizontal: 20,
      gap: 12,
    },
    motivationCard: {
      width: 260,
      height: 155,
      borderRadius: 18,
      overflow: 'hidden',
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 3,
    },
    motivationCardBg: {
      width: '100%',
      height: '100%',
    },
    motivationCardImage: {
      borderRadius: 18,
    },
    motivationOverlay: {
      flex: 1,
      padding: 14,
      justifyContent: 'flex-end',
    },
    motivationTagPill: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,107,53,0.85)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      marginBottom: 6,
    },
    motivationTagText: {
      color: '#fff',
      fontSize: 9,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    motivationQuote: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
      lineHeight: 16,
      marginBottom: 4,
    },
    motivationAuthor: {
      color: 'rgba(255,255,255,0.75)',
      fontSize: 10,
      fontStyle: 'italic',
    },

    // Achievements Banner
    achievementsHeaderBanner: {
      borderRadius: 14,
      overflow: 'hidden',
      marginBottom: 14,
    },
    achievementsBannerBg: {
      width: '100%',
    },
    achievementsBannerImage: {
      borderRadius: 14,
    },
    achievementsBannerOverlay: {
      padding: 14,
    },
    achievementBadgePill: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0.25)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      marginBottom: 6,
    },
    achievementBadgeText: {
      color: '#fff',
      fontSize: 9,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    achievementsSub: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 11,
      marginTop: 2,
    },

    // Overview
    overviewCard: {
      marginHorizontal: 20,
      borderRadius: 20,
      padding: 16,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 3,
    },
    overviewHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    overviewTitle: { fontSize: 15, fontWeight: 'bold' },
    shareButton: { fontSize: 13, fontWeight: '600' },
    overviewGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    overviewItem: { flex: 1, alignItems: 'center' },
    overviewEmoji: { fontSize: 22, marginBottom: 4 },
    overviewValue: { fontSize: 18, fontWeight: 'bold' },
    overviewLabel: { fontSize: 10, marginTop: 2 },

    // Week Comparison
    comparisonCard: {
      marginHorizontal: 20,
      borderRadius: 16,
      padding: 16,
      marginBottom: 15,
      borderLeftWidth: 5,
    },
    comparisonHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    comparisonTitle: { fontSize: 14, fontWeight: 'bold' },
    comparisonBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    comparisonBadgeText: { fontSize: 12, fontWeight: 'bold' },
    comparisonRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    comparisonItem: { flex: 1, alignItems: 'center' },
    comparisonDivider: {
      width: 1,
      height: 40,
      backgroundColor: 'rgba(128,128,128,0.3)',
    },
    comparisonLabel: { fontSize: 11 },
    comparisonValue: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
    comparisonSub: { fontSize: 10, marginTop: 2 },

    // ========== HEATMAP - FIXED STYLES ==========
    heatmapCard: {
      marginHorizontal: 20,
      borderRadius: 16,
      padding: 16,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 3,
    },
    heatmapHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    heatmapTitle: { fontSize: 15, fontWeight: 'bold' },
    heatmapSubtitle: { fontSize: 11, marginTop: 2 },
    heatmapBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 10,
    },
    heatmapBadgeText: { fontSize: 11, fontWeight: 'bold' },

    // Day labels row (Mon, Tue, etc.)
    heatmapLabelsRow: {
      flexDirection: 'row',
      marginBottom: 6,
      paddingHorizontal: 0,
    },
    heatmapColLabel: {
      flex: 1,
      fontSize: 10,
      fontWeight: '600',
      textAlign: 'center',
    },

    // Grid container
    heatmapGridContainer: {
      gap: 4,
    },
    heatmapRow: {
      flexDirection: 'row',
      gap: 4,
    },
    heatmapCell: {
      flex: 1,
      height: 28,
      borderRadius: 5,
    },

    // Legend
    heatmapLegend: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 14,
      gap: 4,
    },
    heatmapLegendText: { fontSize: 10, marginHorizontal: 4 },
    heatmapLegendDot: {
      width: 14,
      height: 14,
      borderRadius: 4,
    },
    heatmapEmptyText: {
      fontSize: 12,
      textAlign: 'center',
      marginTop: 12,
      fontStyle: 'italic',
    },

    // Tabs
    tabScrollContainer: {
      paddingHorizontal: 20,
      paddingBottom: 8,
      gap: 8,
      paddingTop: 4,
    },
    tab: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 12,
      alignItems: 'center',
      minWidth: 68,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    tabEmoji: { fontSize: 18 },
    tabText: { fontSize: 10, fontWeight: '600', marginTop: 2 },

    // Time Range
    timeRangeContainer: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginTop: 12,
      marginBottom: 16,
      gap: 8,
    },
    timeRangeButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    timeRangeText: { fontSize: 13, fontWeight: '600' },

    // Loading
    loadingContainer: {
      height: 300,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 16,
      marginHorizontal: 20,
    },
    loadingText: { marginTop: 12, fontSize: 16 },

    // Chart
    chartCard: {
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 20,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 3,
    },
    chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    chartTitle: { fontSize: 16, fontWeight: 'bold' },
    currentBadge: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 12,
    },
    currentBadgeText: { fontSize: 13, fontWeight: 'bold' },
    goalButton: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 10,
    },
    goalButtonText: { fontSize: 12, fontWeight: 'bold' },
    chart: { borderRadius: 16, marginLeft: -10 },

    // Empty
    emptyChart: {
      padding: 40,
      alignItems: 'center',
      borderRadius: 16,
      marginHorizontal: 20,
      marginBottom: 15,
    },
    emptyEmoji: { fontSize: 50, marginBottom: 8 },
    emptyText: { fontSize: 16, fontWeight: 'bold' },
    emptySubtext: { fontSize: 13, marginTop: 4, textAlign: 'center' },
    addButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      marginTop: 16,
    },
    addButtonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

    // Stats Row
    statsRow: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      gap: 8,
      marginBottom: 15,
    },
    statBox: {
      flex: 1,
      borderRadius: 12,
      padding: 12,
      borderLeftWidth: 4,
      borderWidth: 1,
    },
    statValue: { fontSize: 18, fontWeight: 'bold' },
    statLabel: { fontSize: 10, marginTop: 2 },

    // Goal Card
    goalCard: {
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 20,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 3,
    },
    goalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    goalTitle: { fontSize: 15, fontWeight: 'bold' },
    goalValue: { fontSize: 14, fontWeight: '600' },
    goalBarContainer: {
      height: 12,
      borderRadius: 6,
      overflow: 'hidden',
      marginBottom: 8,
    },
    goalBar: { height: '100%', borderRadius: 6 },
    goalText: {
      fontSize: 12,
      textAlign: 'center',
      fontWeight: '600',
    },

    // BMI
    bmiStatusCard: {
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 20,
      marginBottom: 15,
      borderLeftWidth: 5,
    },
    bmiStatusHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    bmiStatusLabel: { fontSize: 13 },
    bmiStatusValue: { fontSize: 32, fontWeight: 'bold' },
    bmiStatusText: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
    bmiStatusChange: { fontSize: 13 },

    // Body
    addBodyButton: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    addBodyButtonText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: 'bold',
    },
    bodyGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 20,
      gap: 10,
    },
    bodyCard: {
      width: '48%',
      borderRadius: 14,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 3,
    },
    bodyEmoji: { fontSize: 28, marginBottom: 6 },
    bodyLabel: { fontSize: 12 },
    bodyValue: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
    bodyChange: { fontSize: 12, fontWeight: '600', marginTop: 4 },

    // Insights
    insightsCard: {
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 20,
      marginBottom: 15,
      borderLeftWidth: 5,
    },
    insightsTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 12 },
    insightItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 10,
    },
    insightEmoji: { fontSize: 20, marginRight: 10 },
    insightText: { flex: 1, fontSize: 13, lineHeight: 20 },

    // Achievements
    achievementsCard: {
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 20,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 3,
    },
    achievementsTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 14 },
    achievementsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    achievementItem: {
      flex: 1,
      minWidth: '45%',
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      borderLeftWidth: 4,
    },
    achievementEmoji: { fontSize: 28, marginBottom: 4 },
    achievementTitle: {
      fontSize: 12,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    achievementDesc: {
      fontSize: 10,
      textAlign: 'center',
      marginTop: 2,
    },

    // Modals
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalScrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingVertical: 40,
    },
    modalContent: {
      borderRadius: 20,
      padding: 24,
      width: '90%',
      maxWidth: 450,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    modalClose: { fontSize: 22 },
    modalLabel: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 6,
      marginTop: 8,
    },
    modalInput: {
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 15,
      marginBottom: 8,
    },
    bmiPreview: {
      fontSize: 13,
      marginBottom: 16,
      fontStyle: 'italic',
    },
    modalButton: {
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 12,
    },
    modalButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  });

export default ProgressScreen;