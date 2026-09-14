import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Alert from '../../components/FitAlert';
import { useFocusEffect } from '@react-navigation/native';
import { userStorage } from '../../utils/userStorage';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { SAFE_TOP_PADDING } from '../../utils/theme';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const FILTERS = [
  { key: 'all', label: 'All Time' },
  { key: 'month', label: 'This Month' },
  { key: 'week', label: 'This Week' },
];

const WorkoutHistoryScreen = ({ navigation }) => {
  const { theme, isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filter, setFilter] = useState('month');
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    streak: 0,
    mostActiveDay: '-',
  });

  const S = dynamicStyles(theme, isDark);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  // ========== LOAD HISTORY ==========
  const loadHistory = async () => {
    try {
      setLoading(true);

      // Local history from AsyncStorage
      const localData = await userStorage.getItem('workoutHistory');
      const localHistory = localData ? JSON.parse(localData) : [];

      // Backend history (workouts saved)
      let backendHistory = [];
      try {
        const response = await api.get('/workouts');
        backendHistory = response.data.map((w) => ({
          id: w._id,
          exerciseName: w.workoutName,
          category: w.category,
          date: w.date,
          time: new Date(w.date).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          duration: w.duration,
          fromBackend: true,
        }));
      } catch (error) {
        console.log('❌ Backend history error:', error.message);
      }

      // Merge and dedupe
      const merged = [...localHistory, ...backendHistory];
      const seen = new Set();
      const unique = merged.filter((item) => {
        const key = `${item.exerciseName}_${new Date(item.date).toDateString()}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      // Sort by date (newest first)
      unique.sort((a, b) => new Date(b.date) - new Date(a.date));

      setHistory(unique);
      calculateStats(unique);
    } catch (error) {
      console.log('❌ Load history error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // ========== CALCULATE STATS ==========
  const calculateStats = (historyData) => {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total
    const total = historyData.length;

    // This Month
    const thisMonth = historyData.filter(
      (h) => new Date(h.date) >= currentMonthStart
    ).length;

    // Streak (consecutive days from today)
    const dates = new Set();
    historyData.forEach((h) => {
      dates.add(new Date(h.date).toDateString());
    });

    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() - i);
      if (dates.has(checkDate.toDateString())) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Most Active Day of Week
    const dayCount = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    historyData.forEach((h) => {
      const d = new Date(h.date);
      const dayName = WEEKDAYS[d.getDay()];
      dayCount[dayName]++;
    });

    let mostActiveDay = '-';
    let maxCount = 0;
    Object.keys(dayCount).forEach((day) => {
      if (dayCount[day] > maxCount) {
        maxCount = dayCount[day];
        mostActiveDay = day;
      }
    });

    setStats({ total, thisMonth, streak, mostActiveDay });
  };

  // ========== CALENDAR HELPERS ==========
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isSameDay = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const getWorkoutsForDate = (date) => {
    return history.filter((h) => {
      const hDate = new Date(h.date);
      return isSameDay(hDate, date);
    });
  };

  const isToday = (date) => isSameDay(date, new Date());

  // ========== MONTH NAVIGATION ==========
  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    if (next <= new Date()) {
      setCurrentMonth(next);
    }
  };

  const canGoNext = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    return next <= new Date();
  };

  // ========== RENDER CALENDAR ==========
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const today = new Date();

    const cells = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      cells.push({ type: 'empty', key: `empty-${i}` });
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const workouts = getWorkoutsForDate(cellDate);
      const isFuture = cellDate > today;
      const isSelected = isSameDay(cellDate, selectedDate);
      const isCurrentDay = isToday(cellDate);

      cells.push({
        type: 'day',
        key: `day-${day}`,
        day,
        date: cellDate,
        hasWorkout: workouts.length > 0,
        workoutCount: workouts.length,
        isFuture,
        isSelected,
        isToday: isCurrentDay,
      });
    }

    return (
      <View style={S.calendarContainer}>
        {/* Weekday Headers */}
        <View style={S.weekdayRow}>
          {WEEKDAYS.map((day) => (
            <View key={day} style={S.weekdayCell}>
              <Text style={[S.weekdayText, { color: theme.textSecondary }]}>
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Days Grid */}
        <View style={S.daysGrid}>
          {cells.map((cell) => {
            if (cell.type === 'empty') {
              return <View key={cell.key} style={S.dayCell} />;
            }

            return (
              <TouchableOpacity
                key={cell.key}
                style={[
                  S.dayCell,
                  cell.isSelected && {
                    backgroundColor: theme.primary,
                    borderRadius: 12,
                  },
                  cell.isToday && !cell.isSelected && {
                    borderWidth: 2,
                    borderColor: theme.primary,
                    borderRadius: 12,
                  },
                ]}
                onPress={() => !cell.isFuture && setSelectedDate(cell.date)}
                disabled={cell.isFuture}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    S.dayText,
                    {
                      color: cell.isSelected
                        ? '#fff'
                        : cell.isFuture
                        ? theme.textLight
                        : theme.text,
                      fontWeight:
                        cell.isToday || cell.isSelected ? 'bold' : '500',
                    },
                  ]}
                >
                  {cell.day}
                </Text>

                {/* Workout Indicator */}
                {cell.hasWorkout && (
                  <View
                    style={[
                      S.workoutDot,
                      {
                        backgroundColor: cell.isSelected
                          ? '#fff'
                          : theme.success,
                        width: cell.workoutCount > 1 ? 6 : 5,
                        height: cell.workoutCount > 1 ? 6 : 5,
                      },
                    ]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  // ========== RENDER DAY DETAIL ==========
  const renderDayDetail = () => {
    const dayWorkouts = getWorkoutsForDate(selectedDate);
    const isSelectedToday = isToday(selectedDate);

    const dateLabel = isSelectedToday
      ? 'Today'
      : selectedDate.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
        });

    return (
      <View style={S.dayDetailContainer}>
        <View style={S.dayDetailHeader}>
          <Text style={[S.dayDetailTitle, { color: theme.text }]}>
            {dateLabel}
          </Text>
          <View
            style={[
              S.dayDetailBadge,
              {
                backgroundColor:
                  dayWorkouts.length > 0
                    ? isDark
                      ? '#1a3a1a'
                      : '#e8f8f0'
                    : theme.cardSecondary,
              },
            ]}
          >
            <Text
              style={[
                S.dayDetailBadgeText,
                {
                  color:
                    dayWorkouts.length > 0
                      ? theme.success
                      : theme.textSecondary,
                },
              ]}
            >
              {dayWorkouts.length > 0
                ? `${dayWorkouts.length} workout${
                    dayWorkouts.length > 1 ? 's' : ''
                  }`
                : 'No workouts'}
            </Text>
          </View>
        </View>

        {dayWorkouts.length === 0 ? (
          <View style={[S.emptyDay, { backgroundColor: theme.card }]}>
            <Text style={S.emptyDayEmoji}>💤</Text>
            <Text style={[S.emptyDayText, { color: theme.text }]}>
              No workouts on this day
            </Text>
            <Text style={[S.emptyDaySubtext, { color: theme.textSecondary }]}>
              Rest days are important too!
            </Text>
          </View>
        ) : (
          dayWorkouts.map((workout, index) => (
            <View
              key={workout.id || `${workout.exerciseName}-${index}`}
              style={[
                S.workoutItem,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <View
                style={[
                  S.workoutIconContainer,
                  {
                    backgroundColor:
                      workout.fromBackend
                        ? isDark
                          ? '#3a1a1a'
                          : '#fff5f5'
                        : isDark
                        ? '#1a2a3a'
                        : '#e8f4fd',
                  },
                ]}
              >
                <Text style={S.workoutIcon}>
                  {workout.fromBackend ? '💪' : '✅'}
                </Text>
              </View>

              <View style={S.workoutInfo}>
                <Text style={[S.workoutName, { color: theme.text }]}>
                  {workout.exerciseName}
                </Text>
                <View style={S.workoutMetaRow}>
                  {workout.category && (
                    <Text
                      style={[
                        S.workoutMeta,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {workout.category}
                    </Text>
                  )}
                  {workout.time && (
                    <Text
                      style={[
                        S.workoutMeta,
                        { color: theme.textSecondary },
                      ]}
                    >
                      • {workout.time}
                    </Text>
                  )}
                </View>
              </View>

              {workout.duration > 0 && (
                <View
                  style={[
                    S.durationBadge,
                    { backgroundColor: theme.cardSecondary },
                  ]}
                >
                  <Text
                    style={[S.durationText, { color: theme.textSecondary }]}
                  >
                    {workout.duration}m
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>
    );
  };

  // ========== RENDER ==========
  if (loading) {
    return (
      <View style={[S.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[S.loadingText, { color: theme.textSecondary }]}>
          Loading history...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[S.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={S.header}>
        <TouchableOpacity
          style={[S.backButton, { backgroundColor: theme.card }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[S.backText, { color: theme.primary }]}>← Back</Text>
        </TouchableOpacity>
        <View style={S.headerTitleContainer}>
          <Text style={[S.headerTitle, { color: theme.text }]}>
            📜 Workout History
          </Text>
          <Text style={[S.headerSubtitle, { color: theme.textSecondary }]}>
            Track your fitness journey
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={S.statsGrid}>
        <View
          style={[
            S.statBox,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderLeftColor: '#e74c3c',
            },
          ]}
        >
          <Text style={S.statEmoji}>🏋️</Text>
          <Text style={[S.statValue, { color: theme.text }]}>
            {stats.total}
          </Text>
          <Text style={[S.statLabel, { color: theme.textSecondary }]}>
            Total Workouts
          </Text>
        </View>

        <View
          style={[
            S.statBox,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderLeftColor: '#3498db',
            },
          ]}
        >
          <Text style={S.statEmoji}>📅</Text>
          <Text style={[S.statValue, { color: theme.text }]}>
            {stats.thisMonth}
          </Text>
          <Text style={[S.statLabel, { color: theme.textSecondary }]}>
            This Month
          </Text>
        </View>

        <View
          style={[
            S.statBox,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderLeftColor: '#f39c12',
            },
          ]}
        >
          <Text style={S.statEmoji}>🔥</Text>
          <Text style={[S.statValue, { color: theme.text }]}>
            {stats.streak}
          </Text>
          <Text style={[S.statLabel, { color: theme.textSecondary }]}>
            Day Streak
          </Text>
        </View>

        <View
          style={[
            S.statBox,
            {
              backgroundColor: theme.card,
              borderColor: theme.border,
              borderLeftColor: '#27ae60',
            },
          ]}
        >
          <Text style={S.statEmoji}>⭐</Text>
          <Text style={[S.statValue, { color: theme.text }]}>
            {stats.mostActiveDay}
          </Text>
          <Text style={[S.statLabel, { color: theme.textSecondary }]}>
            Most Active
          </Text>
        </View>
      </View>

      {/* Calendar Card */}
      <View style={[S.calendarCard, { backgroundColor: theme.card }]}>
        {/* Month Navigation */}
        <View style={S.monthNav}>
          <TouchableOpacity
            style={[S.navButton, { backgroundColor: theme.cardSecondary }]}
            onPress={goToPrevMonth}
          >
            <Text style={[S.navButtonText, { color: theme.primary }]}>‹</Text>
          </TouchableOpacity>

          <View style={S.monthLabelContainer}>
            <Text style={[S.monthLabel, { color: theme.text }]}>
              {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </Text>
          </View>

          <TouchableOpacity
            style={[
              S.navButton,
              {
                backgroundColor: theme.cardSecondary,
                opacity: canGoNext() ? 1 : 0.4,
              },
            ]}
            onPress={goToNextMonth}
            disabled={!canGoNext()}
          >
            <Text style={[S.navButtonText, { color: theme.primary }]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Grid */}
        {renderCalendar()}

        {/* Legend */}
        <View style={[S.legend, { borderTopColor: theme.borderLight }]}>
          <View style={S.legendItem}>
            <View
              style={[S.legendDot, { backgroundColor: theme.success }]}
            />
            <Text style={[S.legendText, { color: theme.textSecondary }]}>
              Workout day
            </Text>
          </View>
          <View style={S.legendItem}>
            <View
              style={[
                S.legendDotToday,
                { borderColor: theme.primary },
              ]}
            />
            <Text style={[S.legendText, { color: theme.textSecondary }]}>
              Today
            </Text>
          </View>
        </View>
      </View>

      {/* Day Detail */}
      {renderDayDetail()}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

// ========== DYNAMIC STYLES ==========
const dynamicStyles = (theme, isDark) =>
  StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: { marginTop: 12, fontSize: 15 },

    // Header
    header: {
      paddingHorizontal: 20,
      paddingTop: SAFE_TOP_PADDING,
      marginBottom: 16,
    },
    backButton: {
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      marginBottom: 12,
    },
    backText: { fontSize: 14, fontWeight: '600' },
    headerTitleContainer: {},
    headerTitle: { fontSize: 28, fontWeight: 'bold' },
    headerSubtitle: { fontSize: 15, marginTop: 4 },

    // Stats Grid
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 20,
      gap: 10,
      marginBottom: 20,
    },
    statBox: {
      width: '48%',
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderLeftWidth: 4,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 3,
    },
    statEmoji: { fontSize: 24, marginBottom: 4 },
    statValue: { fontSize: 22, fontWeight: 'bold' },
    statLabel: { fontSize: 11, marginTop: 4, textAlign: 'center' },

    // Calendar Card
    calendarCard: {
      marginHorizontal: 20,
      borderRadius: 20,
      padding: 16,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 3,
    },
    monthNav: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    navButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    navButtonText: { fontSize: 24, fontWeight: 'bold' },
    monthLabelContainer: { flex: 1, alignItems: 'center' },
    monthLabel: { fontSize: 18, fontWeight: 'bold' },

    calendarContainer: {},
    weekdayRow: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    weekdayCell: {
      flex: 1,
      alignItems: 'center',
    },
    weekdayText: {
      fontSize: 12,
      fontWeight: '600',
    },

    daysGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      width: '14.28%',
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 4,
      position: 'relative',
    },
    dayText: { fontSize: 14 },
    workoutDot: {
      position: 'absolute',
      bottom: 4,
      borderRadius: 3,
    },

    // Legend
    legend: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 16,
      paddingTop: 12,
      borderTopWidth: 1,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center' },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    legendDotToday: {
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 2,
      marginRight: 6,
    },
    legendText: { fontSize: 11 },

    // Day Detail
    dayDetailContainer: {
      paddingHorizontal: 20,
    },
    dayDetailHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    dayDetailTitle: { fontSize: 18, fontWeight: 'bold' },
    dayDetailBadge: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 10,
    },
    dayDetailBadgeText: { fontSize: 12, fontWeight: 'bold' },

    emptyDay: {
      borderRadius: 16,
      padding: 30,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 3,
    },
    emptyDayEmoji: { fontSize: 50, marginBottom: 8 },
    emptyDayText: { fontSize: 16, fontWeight: 'bold' },
    emptyDaySubtext: { fontSize: 13, marginTop: 4 },

    workoutItem: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
      elevation: 2,
    },
    workoutIconContainer: {
      width: 46,
      height: 46,
      borderRadius: 23,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    workoutIcon: { fontSize: 22 },
    workoutInfo: { flex: 1 },
    workoutName: { fontSize: 15, fontWeight: '600' },
    workoutMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    workoutMeta: { fontSize: 12 },
    durationBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    durationText: { fontSize: 12, fontWeight: 'bold' },
  });

export default WorkoutHistoryScreen;