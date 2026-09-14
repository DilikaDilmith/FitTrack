import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
  TextInput,
  Image,
  ImageBackground,
  Dimensions,
} from 'react-native';
import Alert from '../../components/FitAlert';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { SAFE_TOP_PADDING, waterImages } from '../../utils/theme';
import { userStorage } from '../../utils/userStorage';

const { width } = Dimensions.get('window');

// 🍋 HEALTHY HYDRATING FOODS & INFUSIONS WITH HD IMAGES & CALORIES
const HYDRATING_BEVERAGES = [
  {
    name: 'Pure Spring Water',
    volume: '250 ml',
    hydration: '100% Water',
    calories: '0 kcal',
    emoji: '💧',
    image: waterImages.pureWater,
    benefit: 'Optimal cellular detox & zero calories',
  },
  {
    name: 'Lemon Mint Detox',
    volume: '250 ml',
    hydration: '99% Water',
    calories: '5 kcal',
    emoji: '🍋',
    image: waterImages.lemonWater,
    benefit: 'Alkalizing citrus & digestive comfort',
  },
  {
    name: 'Cucumber Lime Cooler',
    volume: '250 ml',
    hydration: '98% Water',
    calories: '8 kcal',
    emoji: '🥒',
    image: waterImages.cucumberWater,
    benefit: 'Anti-inflammatory silica & cooling hydration',
  },
  {
    name: 'Fresh Coconut Water',
    volume: '250 ml',
    hydration: '95% Water',
    calories: '45 kcal',
    emoji: '🥥',
    image: waterImages.coconutWater,
    benefit: 'Natural potassium & fast electrolyte restore',
  },
  {
    name: 'Juicy Watermelon Splash',
    volume: '250 ml',
    hydration: '92% Water',
    calories: '32 kcal',
    emoji: '🍉',
    image: waterImages.watermelon,
    benefit: 'Rich in lycopene & L-citrulline muscle recovery',
  },
  {
    name: 'Wild Berry Infusion',
    volume: '250 ml',
    hydration: '96% Water',
    calories: '15 kcal',
    emoji: '🫐',
    image: waterImages.berryWater,
    benefit: 'Anthocyanin antioxidants & cellular health',
  },
  {
    name: 'Iced Green Tea Cooler',
    volume: '250 ml',
    hydration: '99% Water',
    calories: '2 kcal',
    emoji: '🍵',
    image: waterImages.greenTea,
    benefit: 'EGCG polyphenols & natural calorie burner',
  },
  {
    name: 'Citrus Vitamin C Splash',
    volume: '250 ml',
    hydration: '90% Water',
    calories: '42 kcal',
    emoji: '🍊',
    image: waterImages.citrusSplash,
    benefit: 'Immunity defense & refreshing hydration',
  },
];

const WaterScreen = () => {
  const { theme, isDark } = useTheme();
  const [glasses, setGlasses] = useState(0);
  const [lastDrinkTime, setLastDrinkTime] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showReminder, setShowReminder] = useState(false);
  const [reminderInterval, setReminderInterval] = useState(2 * 60 * 60 * 1000);
  const [reminderActive, setReminderActive] = useState(true);
  const [intervalModalVisible, setIntervalModalVisible] = useState(false);
  const [customHours, setCustomHours] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');

  const goal = 8;
  const glassVolume = 250; // ml per glass
  const totalTargetMl = goal * glassVolume; // 2000 ml

  const bannerAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const S = dynamicStyles(theme, isDark);

  const presetIntervals = [
    { label: '30 min', value: 30 * 60 * 1000 },
    { label: '1 hour', value: 60 * 60 * 1000 },
    { label: '1.5 hours', value: 90 * 60 * 1000 },
    { label: '2 hours', value: 120 * 60 * 1000 },
    { label: '3 hours', value: 180 * 60 * 1000 },
    { label: '4 hours', value: 240 * 60 * 1000 },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      updateTimeRemaining();
    }, 1000);
    return () => clearInterval(timer);
  }, [lastDrinkTime, reminderInterval, reminderActive]);

  const updateTimeRemaining = () => {
    if (!reminderActive) {
      setShowReminder(false);
      setTimeRemaining(0);
      pulseAnim.setValue(1);
      bannerAnim.setValue(0);
      return;
    }

    if (!lastDrinkTime) {
      setShowReminder(true);
      setTimeRemaining(0);
      return;
    }

    const now = Date.now();
    const elapsed = now - lastDrinkTime;
    const remaining = reminderInterval - elapsed;

    if (remaining <= 0) {
      setTimeRemaining(0);
      if (!showReminder) {
        setShowReminder(true);
        startPulseAnimation();
      }
    } else {
      setTimeRemaining(remaining);
      if (showReminder) {
        setShowReminder(false);
        pulseAnim.setValue(1);
        bannerAnim.setValue(0);
      }
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(bannerAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const loadData = async () => {
    try {
      const todayStr = new Date().toDateString();
      const savedDate = await userStorage.getItem('waterDate');
      const savedGlasses = await userStorage.getItem('waterGlasses');
      const savedLastDrink = await userStorage.getItem('lastDrinkTime');
      const savedInterval = await userStorage.getItem('reminderInterval');
      const savedActive = await userStorage.getItem('reminderActive');

      if (savedInterval) setReminderInterval(parseInt(savedInterval));
      if (savedActive !== null) setReminderActive(savedActive === 'true');

      if (savedDate !== todayStr) {
        setGlasses(0);
        setLastDrinkTime(null);
        await userStorage.setItem('waterDate', todayStr);
        await userStorage.setItem('waterGlasses', '0');
        await userStorage.removeItem('lastDrinkTime');
        return;
      }

      if (savedGlasses) setGlasses(parseInt(savedGlasses));
      if (savedLastDrink) setLastDrinkTime(parseInt(savedLastDrink));
    } catch (error) {
      console.log('❌ Load data error:', error);
    }
  };

  const saveData = async (newGlasses, newLastDrink) => {
    try {
      await userStorage.setItem('waterGlasses', newGlasses.toString());
      await userStorage.setItem('waterDate', new Date().toDateString());
      if (newLastDrink) {
        await userStorage.setItem('lastDrinkTime', newLastDrink.toString());
      }
    } catch (error) {
      console.log('❌ Save data error:', error);
    }
  };

  const toggleReminderActive = async () => {
    const newValue = !reminderActive;
    setReminderActive(newValue);
    await userStorage.setItem('reminderActive', newValue.toString());

    if (newValue) {
      if (lastDrinkTime) {
        const now = Date.now();
        const elapsed = now - lastDrinkTime;
        const remaining = reminderInterval - elapsed;
        setTimeRemaining(remaining > 0 ? remaining : 0);
        if (remaining <= 0) {
          setShowReminder(true);
          startPulseAnimation();
        }
      }
      Alert.alert('▶️ Reminder Started', 'You will be notified on schedule.');
    } else {
      setShowReminder(false);
      pulseAnim.setValue(1);
      bannerAnim.setValue(0);
      Alert.alert(
        '⏸️ Reminder Paused',
        'Next reminder paused. Tap "Start" whenever you are ready.'
      );
    }
  };

  const addGlass = (amount = 1, beverageName = null) => {
    if (glasses < goal) {
      const newCount = Math.min(glasses + amount, goal);
      const now = Date.now();
      setGlasses(newCount);
      setLastDrinkTime(now);
      setShowReminder(false);
      bannerAnim.setValue(0);
      pulseAnim.setValue(1);
      saveData(newCount, now);

      if (!reminderActive) {
        setReminderActive(true);
        userStorage.setItem('reminderActive', 'true');
      }

      const drinkText = beverageName ? `${beverageName} (${amount * glassVolume}ml)` : `${amount * glassVolume}ml water`;

      if (newCount === goal) {
        Alert.alert('🎉 Hydration Goal Reached!', `Outstanding! You drank ${drinkText} and hit your 2,000 ml daily goal!`);
      } else {
        Alert.alert(
          '💧 Hydration Logged!',
          `Logged ${drinkText}. Current: ${newCount * glassVolume} ml / ${totalTargetMl} ml.`
        );
      }
    } else {
      Alert.alert('💪 Hydration Hero!', `You've already conquered your daily ${totalTargetMl} ml goal! Keep sipping for refreshment.`);
    }
  };

  const removeGlass = () => {
    if (glasses > 0) {
      const newCount = glasses - 1;
      setGlasses(newCount);
      saveData(newCount, lastDrinkTime);
    }
  };

  const resetWater = () => {
    Alert.alert(
      'Reset Daily Hydration',
      'Reset today’s logged water count back to 0 ml?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setGlasses(0);
            setLastDrinkTime(null);
            setShowReminder(false);
            bannerAnim.setValue(0);
            pulseAnim.setValue(1);
            await userStorage.setItem('waterGlasses', '0');
            await userStorage.removeItem('lastDrinkTime');
          },
        },
      ]
    );
  };

  const setIntervalTime = async (ms) => {
    try {
      setReminderInterval(ms);
      await userStorage.setItem('reminderInterval', ms.toString());
      setIntervalModalVisible(false);

      if (lastDrinkTime && reminderActive) {
        const now = Date.now();
        const elapsed = now - lastDrinkTime;
        const remaining = ms - elapsed;

        if (remaining > 0) {
          setTimeRemaining(remaining);
          setShowReminder(false);
          bannerAnim.setValue(0);
          pulseAnim.setValue(1);
        } else {
          setShowReminder(true);
          startPulseAnimation();
        }
      }

      Alert.alert('✅ Reminder Updated', `Interval set to every ${formatInterval(ms)}.`);
    } catch (error) {
      console.log('❌ Set interval error:', error);
    }
  };

  const setCustomInterval = () => {
    const hours = parseInt(customHours) || 0;
    const minutes = parseInt(customMinutes) || 0;

    if (hours === 0 && minutes === 0) {
      Alert.alert('Error', 'Please enter a valid time');
      return;
    }

    const totalMs = (hours * 60 + minutes) * 60 * 1000;
    if (totalMs < 5 * 60 * 1000) {
      Alert.alert('Error', 'Minimum reminder time is 5 minutes');
      return;
    }
    if (totalMs > 12 * 60 * 60 * 1000) {
      Alert.alert('Error', 'Maximum reminder time is 12 hours');
      return;
    }

    setCustomHours('');
    setCustomMinutes('');
    setIntervalTime(totalMs);
  };

  const formatTime = (ms) => {
    if (ms <= 0) return '00:00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatInterval = (ms) => {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours === 0) return `${minutes} min`;
    if (minutes === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    return `${hours}h ${minutes}m`;
  };

  const getLastDrinkTime = () => {
    if (!lastDrinkTime) return 'Not yet today';
    const d = new Date(lastDrinkTime);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const progress = (glasses / goal) * 100;
  const currentMl = glasses * glassVolume;
  const remainingMl = Math.max(totalTargetMl - currentMl, 0);

  const timeProgress =
    lastDrinkTime && reminderActive
      ? Math.min(
          ((reminderInterval - timeRemaining) / reminderInterval) * 100,
          100
        )
      : 0;

  return (
    <ScrollView
      style={[S.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      {/* ═══════════════════════════════════════════════════ */}
      {/* 🌟 HERO BANNER WITH HD WATER IMAGE                  */}
      {/* ═══════════════════════════════════════════════════ */}
      <View style={S.heroWrapper}>
        <ImageBackground
          source={{ uri: waterImages.hero }}
          style={S.heroImageBg}
          imageStyle={S.heroImage}
        >
          <LinearGradient
            colors={[
              'rgba(10,20,38,0.3)',
              isDark ? 'rgba(10,18,34,0.86)' : 'rgba(12,28,52,0.84)',
              isDark ? 'rgba(8,14,26,0.98)' : 'rgba(15,35,65,0.96)',
            ]}
            locations={[0, 0.45, 1]}
            style={S.heroOverlay}
          >
            <View style={S.heroBadge}>
              <Text style={S.heroBadgeText}>💧 HYDRATION & METABOLISM</Text>
            </View>
            <Text style={S.heroTitle}>Water & Vitality Tracker</Text>
            <Text style={S.heroSub}>
              Drink pure water & nutrient-rich infusions to fuel your metabolism, boost skin clarity, and sustain peak energy.
            </Text>

            <View style={S.heroChipsRow}>
              <View style={S.heroChip}>
                <Text style={S.heroChipEmoji}>🎯</Text>
                <Text style={S.heroChipText}>Goal: {totalTargetMl} ml</Text>
              </View>
              <View style={S.heroChip}>
                <Text style={S.heroChipEmoji}>💧</Text>
                <Text style={S.heroChipText}>Consumed: {currentMl} ml</Text>
              </View>
              <View style={S.heroChip}>
                <Text style={S.heroChipEmoji}>⚡</Text>
                <Text style={S.heroChipText}>
                  {remainingMl > 0 ? `${remainingMl} ml to go` : 'Goal reached!'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>

      <View style={S.contentWrapper}>
        {/* ═══════════════════════════════════════════════════ */}
        {/* 🚨 PULSING REMINDER BANNER                          */}
        {/* ═══════════════════════════════════════════════════ */}
        {showReminder && reminderActive && (
          <Animated.View
            style={[
              S.reminderBanner,
              {
                opacity: bannerAnim,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['#FF5252', '#E53935']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={S.reminderBannerGradient}
            >
              <Text style={S.reminderBannerIcon}>💧</Text>
              <View style={{ flex: 1 }}>
                <Text style={S.reminderBannerTitle}>Time to Drink Water!</Text>
                <Text style={S.reminderBannerText}>
                  It's been {formatInterval(reminderInterval)}. Rehydrate your body now! 💪
                </Text>
              </View>
              <TouchableOpacity
                style={S.reminderQuickDrinkBtn}
                onPress={() => addGlass(1)}
                activeOpacity={0.85}
              >
                <Text style={S.reminderQuickDrinkText}>+ Log</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animated.View>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* 🌊 DAILY HYDRATION GOAL CARD                       */}
        {/* ═══════════════════════════════════════════════════ */}
        <View style={[S.progressCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={S.cardHeaderRow}>
            <View>
              <Text style={[S.cardHeading, { color: theme.text }]}>Today's Water Intake</Text>
              <Text style={[S.cardSubheading, { color: theme.textSecondary }]}>
                Standard: 8 glasses (250 ml each)
              </Text>
            </View>
            <View
              style={[
                S.progressPctBadge,
                {
                  backgroundColor:
                    progress >= 100
                      ? isDark ? 'rgba(0,230,118,0.2)' : '#E8F8F0'
                      : isDark ? 'rgba(46,134,222,0.2)' : '#EBF4FD',
                },
              ]}
            >
              <Text
                style={[
                  S.progressPctText,
                  { color: progress >= 100 ? '#00E676' : '#2E86DE' },
                ]}
              >
                {Math.min(Math.round(progress), 100)}%
              </Text>
            </View>
          </View>

          {/* Volume Typography */}
          <View style={S.volumeRow}>
            <Text style={[S.volumeMainText, { color: theme.primary }]}>
              {currentMl} <Text style={S.volumeUnit}>ml</Text>
            </Text>
            <Text style={[S.volumeDividerText, { color: theme.textSecondary }]}>
              / {totalTargetMl} ml
            </Text>
          </View>

          {/* Multi-Color Progress Wave Bar */}
          <View
            style={[
              S.progressBarContainer,
              { backgroundColor: theme.borderLight },
            ]}
          >
            <LinearGradient
              colors={
                progress >= 100
                  ? ['#00E676', '#00C853']
                  : ['#4ECDC4', '#2E86DE']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[
                S.progressBar,
                { width: `${Math.min(progress, 100)}%` },
              ]}
            />
          </View>

          <View style={S.volumeMetaRow}>
            <Text style={[S.volumeMetaText, { color: theme.textSecondary }]}>
              {glasses} of {goal} glasses completed
            </Text>
            <Text style={[S.volumeRemainingText, { color: remainingMl > 0 ? theme.primary : '#00E676' }]}>
              {remainingMl > 0 ? `⚡ ${remainingMl} ml left` : '🎉 Goal Complete!'}
            </Text>
          </View>

          {/* Interactive Cups Grid */}
          <View style={S.cupsGridContainer}>
            {Array.from({ length: goal }).map((_, index) => {
              const isFilled = index < glasses;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    S.cupItem,
                    {
                      backgroundColor: isFilled
                        ? isDark ? 'rgba(46,134,222,0.2)' : '#EAF2FB'
                        : theme.cardSecondary,
                      borderColor: isFilled ? '#2E86DE' : theme.border,
                    },
                  ]}
                  onPress={() => {
                    if (isFilled && index === glasses - 1) {
                      removeGlass();
                    } else if (!isFilled) {
                      addGlass(1);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={S.cupEmoji}>{isFilled ? '💧' : '⚪'}</Text>
                  <Text
                    style={[
                      S.cupLabel,
                      { color: isFilled ? '#2E86DE' : theme.textSecondary },
                    ]}
                  >
                    {isFilled ? '250ml' : `${index + 1}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Fast Quick Action Buttons */}
          <View style={S.quickActionsGrid}>
            <TouchableOpacity
              style={S.quickActionMainBtn}
              onPress={() => addGlass(1)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#2E86DE', '#1B6FC4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={S.quickActionMainGradient}
              >
                <Text style={S.quickActionMainText}>+ 1 Glass (250 ml)</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[S.quickActionSecondaryBtn, { backgroundColor: theme.cardSecondary, borderColor: theme.border }]}
              onPress={() => addGlass(2, 'Water Bottle')}
              activeOpacity={0.8}
            >
              <Text style={[S.quickActionSecondaryText, { color: theme.text }]}>
                🍾 +500 ml Bottle
              </Text>
            </TouchableOpacity>
          </View>

          <View style={S.miniControlsRow}>
            <TouchableOpacity
              style={[S.miniControlBtn, { backgroundColor: theme.cardSecondary }]}
              onPress={removeGlass}
              disabled={glasses === 0}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  S.miniControlText,
                  { color: glasses === 0 ? theme.textSecondary : theme.warning },
                ]}
              >
                − Remove 1 Glass
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[S.miniControlBtn, { backgroundColor: theme.cardSecondary }]}
              onPress={resetWater}
              activeOpacity={0.7}
            >
              <Text style={[S.miniControlText, { color: theme.danger }]}>
                ↻ Reset Today
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════ */}
        {/* ⏰ SMART HYDRATION REMINDER & TIMER CARD            */}
        {/* ═══════════════════════════════════════════════════ */}
        <View
          style={[
            S.timerCard,
            {
              backgroundColor: reminderActive
                ? theme.card
                : theme.cardSecondary,
              borderColor: reminderActive ? theme.border : theme.textSecondary,
              borderStyle: reminderActive ? 'solid' : 'dashed',
            },
          ]}
        >
          <View style={S.timerHeaderRow}>
            <View>
              <Text style={[S.timerLabel, { color: theme.textSecondary }]}>
                ⏰ Next Hydration Countdown
              </Text>
              <Text style={[S.timerSub, { color: theme.textSecondary }]}>
                Interval: every {formatInterval(reminderInterval)}
              </Text>
            </View>
            <View
              style={[
                S.statusBadge,
                {
                  backgroundColor: reminderActive
                    ? isDark ? 'rgba(0,230,118,0.18)' : '#E8F8F0'
                    : isDark ? 'rgba(255,82,82,0.18)' : '#FFEBEE',
                },
              ]}
            >
              <Text
                style={[
                  S.statusBadgeText,
                  {
                    color: reminderActive ? '#00C853' : theme.danger,
                  },
                ]}
              >
                {reminderActive ? '● ACTIVE' : '⏸ PAUSED'}
              </Text>
            </View>
          </View>

          <Text
            style={[
              S.timerValue,
              {
                color: !reminderActive
                  ? theme.textSecondary
                  : showReminder
                  ? theme.danger
                  : theme.primary,
                fontSize: !reminderActive ? 26 : showReminder ? 24 : 40,
              },
            ]}
          >
            {!reminderActive
              ? 'PAUSED'
              : showReminder
              ? 'TIME TO DRINK! 💧'
              : formatTime(timeRemaining)}
          </Text>

          {/* Time Progress Bar */}
          <View
            style={[
              S.timerProgressContainer,
              { backgroundColor: theme.borderLight },
            ]}
          >
            <View
              style={[
                S.timerProgressBar,
                {
                  width: `${timeProgress}%`,
                  backgroundColor: !reminderActive
                    ? theme.textSecondary
                    : showReminder
                    ? theme.danger
                    : '#2E86DE',
                },
              ]}
            />
          </View>

          <View style={S.timerFooterInfo}>
            <Text style={[S.lastDrinkText, { color: theme.textSecondary }]}>
              Last logged drink:{' '}
              <Text style={[S.lastDrinkValue, { color: theme.text }]}>
                {getLastDrinkTime()}
              </Text>
            </Text>
          </View>

          {/* Reminder actions */}
          <View style={S.timerButtonsRow}>
            <TouchableOpacity
              style={[
                S.intervalPickerBtn,
                { backgroundColor: theme.cardSecondary, borderColor: theme.border },
              ]}
              onPress={() => setIntervalModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={S.intervalPickerIcon}>🔔</Text>
              <Text style={[S.intervalPickerText, { color: theme.text }]}>
                Change Interval
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                S.toggleReminderBtn,
                {
                  backgroundColor: reminderActive
                    ? isDark ? 'rgba(255,82,82,0.15)' : '#FFF5F5'
                    : isDark ? 'rgba(0,230,118,0.15)' : '#F0FBF5',
                  borderColor: reminderActive ? theme.danger : '#00C853',
                },
              ]}
              onPress={toggleReminderActive}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  S.toggleReminderText,
                  { color: reminderActive ? theme.danger : '#00C853' },
                ]}
              >
                {reminderActive ? '⏸ Pause Reminder' : '▶️ Resume Reminder'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════ */}
        {/* 🍋 HYDRATING BEVERAGES & CALORIE INFUSIONS CAROUSEL */}
        {/* ═══════════════════════════════════════════════════ */}
        <View style={S.beveragesSection}>
          <View style={S.sectionHeaderRow}>
            <View>
              <Text style={[S.sectionTitle, { color: theme.text }]}>
                🍋 Hydrating Foods & Infusions
              </Text>
              <Text style={[S.sectionSubtitle, { color: theme.textSecondary }]}>
                High-water content drinks & foods with calorie counts
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={S.beveragesScrollContent}
          >
            {HYDRATING_BEVERAGES.map((bev, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  S.beverageCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
                onPress={() => addGlass(1, bev.name)}
                activeOpacity={0.85}
              >
                <View style={S.beverageImageWrap}>
                  <Image source={{ uri: bev.image }} style={S.beverageImage} />
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.65)']}
                    style={S.beverageImageGradient}
                  />
                  <View style={S.beverageEmojiBadge}>
                    <Text style={S.beverageEmojiText}>{bev.emoji}</Text>
                  </View>
                  <View style={S.beverageCalPill}>
                    <Text style={S.beverageCalText}>{bev.calories}</Text>
                  </View>
                  <View style={S.beverageWaterPill}>
                    <Text style={S.beverageWaterText}>{bev.hydration}</Text>
                  </View>
                </View>

                <View style={S.beverageContent}>
                  <Text
                    style={[S.beverageName, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {bev.name}
                  </Text>
                  <Text
                    style={[S.beverageBenefit, { color: theme.textSecondary }]}
                    numberOfLines={2}
                  >
                    {bev.benefit}
                  </Text>

                  <View style={[S.beverageAddBtn, { backgroundColor: '#2E86DE' }]}>
                    <Text style={S.beverageAddBtnText}>+ Log 250ml</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ═══════════════════════════════════════════════════ */}
        {/* 🔥 METABOLISM & CALORIE BURN BANNER                 */}
        {/* ═══════════════════════════════════════════════════ */}
        <View style={S.metabolismCardWrapper}>
          <ImageBackground
            source={{ uri: waterImages.metabolismTip }}
            style={S.metabolismCardBg}
            imageStyle={S.metabolismCardImage}
          >
            <LinearGradient
              colors={[
                'rgba(15,22,35,0.4)',
                isDark ? 'rgba(10,16,28,0.92)' : 'rgba(14,26,48,0.88)',
              ]}
              style={S.metabolismOverlay}
            >
              <View style={S.metabolismBadge}>
                <Text style={S.metabolismBadgeText}>🔥 WATER & CALORIE BURN</Text>
              </View>
              <Text style={S.metabolismTitle}>The Hydration-Metabolism Link</Text>
              <Text style={S.metabolismDesc}>
                Drinking 500ml of cold water stimulates water-induced thermogenesis, elevating your resting metabolic rate by up to 30% for 60–90 minutes. Adequate hydration prevents false hunger cues and supports optimal fat oxidation.
              </Text>

              <View style={S.metabolismFactsRow}>
                <View style={S.metabolismFactItem}>
                  <Text style={S.metabolismFactNum}>+30%</Text>
                  <Text style={S.metabolismFactLabel}>Metabolic Boost</Text>
                </View>
                <View style={S.metabolismFactDivider} />
                <View style={S.metabolismFactItem}>
                  <Text style={S.metabolismFactNum}>0 kcal</Text>
                  <Text style={S.metabolismFactLabel}>Pure Spring Water</Text>
                </View>
                <View style={S.metabolismFactDivider} />
                <View style={S.metabolismFactItem}>
                  <Text style={S.metabolismFactNum}>2,000ml</Text>
                  <Text style={S.metabolismFactLabel}>Daily Baseline</Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>
      </View>

      {/* ═══════════════════════════════════════════════════ */}
      {/* 🔔 INTERVAL REMINDER MODAL                          */}
      {/* ═══════════════════════════════════════════════════ */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={intervalModalVisible}
        onRequestClose={() => setIntervalModalVisible(false)}
      >
        <View style={S.modalOverlay}>
          <View style={[S.modalContent, { backgroundColor: theme.card }]}>
            <View style={S.modalHeader}>
              <View>
                <Text style={[S.modalTitle, { color: theme.text }]}>
                  🔔 Hydration Frequency
                </Text>
                <Text style={[S.modalSubtitle, { color: theme.textSecondary }]}>
                  Choose how often you want gentle water alerts
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIntervalModalVisible(false)}
                style={[S.modalCloseBtn, { backgroundColor: theme.cardSecondary }]}
              >
                <Text style={[S.modalClose, { color: theme.textSecondary }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <View style={S.presetContainer}>
              {presetIntervals.map((preset) => {
                const isSelected = reminderInterval === preset.value;
                return (
                  <TouchableOpacity
                    key={preset.label}
                    style={[
                      S.presetButton,
                      {
                        backgroundColor: isSelected
                          ? '#2E86DE'
                          : theme.cardSecondary,
                        borderColor: isSelected ? '#2E86DE' : theme.border,
                      },
                    ]}
                    onPress={() => setIntervalTime(preset.value)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        S.presetText,
                        {
                          color: isSelected ? '#fff' : theme.text,
                          fontWeight: isSelected ? 'bold' : '600',
                        },
                      ]}
                    >
                      {preset.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={S.dividerContainer}>
              <View
                style={[S.divider, { backgroundColor: theme.border }]}
              />
              <Text style={[S.dividerText, { color: theme.textSecondary }]}>
                OR CUSTOM TIME
              </Text>
              <View
                style={[S.divider, { backgroundColor: theme.border }]}
              />
            </View>

            <View style={S.customInputRow}>
              <View style={S.customInputContainer}>
                <Text style={[S.customLabel, { color: theme.text }]}>
                  Hours
                </Text>
                <TextInput
                  style={[
                    S.customInput,
                    {
                      backgroundColor: theme.inputBackground,
                      color: theme.text,
                      borderColor: theme.inputBorder,
                    },
                  ]}
                  placeholder="1"
                  placeholderTextColor={theme.inputPlaceholder}
                  value={customHours}
                  onChangeText={setCustomHours}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
              <View style={S.customInputContainer}>
                <Text style={[S.customLabel, { color: theme.text }]}>
                  Minutes
                </Text>
                <TextInput
                  style={[
                    S.customInput,
                    {
                      backgroundColor: theme.inputBackground,
                      color: theme.text,
                      borderColor: theme.inputBorder,
                    },
                  ]}
                  placeholder="30"
                  placeholderTextColor={theme.inputPlaceholder}
                  value={customMinutes}
                  onChangeText={setCustomMinutes}
                  keyboardType="numeric"
                  maxLength={2}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[S.customSetButton, { backgroundColor: '#2E86DE' }]}
              onPress={setCustomInterval}
              activeOpacity={0.85}
            >
              <Text style={S.customSetButtonText}>Set Custom Frequency</Text>
            </TouchableOpacity>

            <Text style={[S.modalNote, { color: theme.textSecondary }]}>
              ℹ️ Minimum: 5 minutes • Maximum: 12 hours
            </Text>
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

    // 🚨 PULSE REMINDER BANNER
    reminderBanner: {
      borderRadius: 18,
      overflow: 'hidden',
      marginBottom: 16,
      shadowColor: '#E53935',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 6,
    },
    reminderBannerGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    reminderBannerIcon: {
      fontSize: 32,
      marginRight: 12,
    },
    reminderBannerTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#fff',
    },
    reminderBannerText: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.92)',
      marginTop: 2,
    },
    reminderQuickDrinkBtn: {
      backgroundColor: '#fff',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 10,
      marginLeft: 10,
    },
    reminderQuickDrinkText: {
      color: '#E53935',
      fontSize: 12,
      fontWeight: 'bold',
    },

    // 🌊 DAILY GOAL PROGRESS CARD
    progressCard: {
      borderRadius: 20,
      borderWidth: 1,
      padding: 18,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 3,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    cardHeading: {
      fontSize: 17,
      fontWeight: 'bold',
    },
    cardSubheading: {
      fontSize: 11,
      marginTop: 1,
    },
    progressPctBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    progressPctText: {
      fontSize: 13,
      fontWeight: 'bold',
    },
    volumeRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginVertical: 4,
    },
    volumeMainText: {
      fontSize: 36,
      fontWeight: '800',
    },
    volumeUnit: {
      fontSize: 18,
      fontWeight: '600',
    },
    volumeDividerText: {
      fontSize: 15,
      fontWeight: '500',
      marginLeft: 8,
    },
    progressBarContainer: {
      width: '100%',
      height: 10,
      borderRadius: 5,
      overflow: 'hidden',
      marginTop: 10,
      marginBottom: 8,
    },
    progressBar: {
      height: '100%',
      borderRadius: 5,
    },
    volumeMetaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    volumeMetaText: {
      fontSize: 11,
      fontWeight: '500',
    },
    volumeRemainingText: {
      fontSize: 11,
      fontWeight: 'bold',
    },

    // Cups Grid
    cupsGridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    cupItem: {
      width: (width - 32 - 36 - 24) / 4,
      aspectRatio: 1,
      borderRadius: 14,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 6,
    },
    cupEmoji: {
      fontSize: 22,
    },
    cupLabel: {
      fontSize: 10,
      fontWeight: 'bold',
      marginTop: 3,
    },

    // Quick Actions
    quickActionsGrid: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 10,
    },
    quickActionMainBtn: {
      flex: 1.5,
      borderRadius: 14,
      overflow: 'hidden',
    },
    quickActionMainGradient: {
      paddingVertical: 13,
      alignItems: 'center',
    },
    quickActionMainText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
    },
    quickActionSecondaryBtn: {
      flex: 1,
      borderRadius: 14,
      borderWidth: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 13,
    },
    quickActionSecondaryText: {
      fontSize: 12,
      fontWeight: 'bold',
    },

    miniControlsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    miniControlBtn: {
      flex: 1,
      paddingVertical: 9,
      borderRadius: 10,
      alignItems: 'center',
    },
    miniControlText: {
      fontSize: 11,
      fontWeight: '600',
    },

    // ⏰ SMART HYDRATION TIMER CARD
    timerCard: {
      borderRadius: 20,
      borderWidth: 1,
      padding: 18,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 5,
      elevation: 2,
    },
    timerHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    timerLabel: {
      fontSize: 15,
      fontWeight: 'bold',
    },
    timerSub: {
      fontSize: 11,
      marginTop: 2,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
    },
    statusBadgeText: {
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },
    timerValue: {
      fontWeight: '800',
      fontVariant: ['tabular-nums'],
      letterSpacing: 1.5,
      marginVertical: 4,
      textAlign: 'center',
    },
    timerProgressContainer: {
      width: '100%',
      height: 8,
      borderRadius: 4,
      overflow: 'hidden',
      marginTop: 8,
      marginBottom: 8,
    },
    timerProgressBar: {
      height: '100%',
      borderRadius: 4,
    },
    timerFooterInfo: {
      alignItems: 'center',
      marginBottom: 14,
    },
    lastDrinkText: {
      fontSize: 12,
    },
    lastDrinkValue: {
      fontWeight: 'bold',
    },
    timerButtonsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    intervalPickerBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      gap: 6,
    },
    intervalPickerIcon: {
      fontSize: 15,
    },
    intervalPickerText: {
      fontSize: 12,
      fontWeight: '600',
    },
    toggleReminderBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toggleReminderText: {
      fontSize: 12,
      fontWeight: 'bold',
    },

    // 🍋 HYDRATING BEVERAGES CAROUSEL
    beveragesSection: {
      marginBottom: 18,
    },
    sectionHeaderRow: {
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
    beveragesScrollContent: {
      gap: 12,
      paddingRight: 6,
    },
    beverageCard: {
      width: 155,
      borderRadius: 16,
      borderWidth: 1,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    beverageImageWrap: {
      width: '100%',
      height: 100,
      position: 'relative',
    },
    beverageImage: {
      width: '100%',
      height: '100%',
    },
    beverageImageGradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 50,
    },
    beverageEmojiBadge: {
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
    beverageEmojiText: {
      fontSize: 14,
    },
    beverageCalPill: {
      position: 'absolute',
      top: 6,
      right: 6,
      backgroundColor: 'rgba(0,0,0,0.7)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    beverageCalText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
    },
    beverageWaterPill: {
      position: 'absolute',
      bottom: 6,
      left: 6,
      backgroundColor: 'rgba(46,134,222,0.85)',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 6,
    },
    beverageWaterText: {
      color: '#fff',
      fontSize: 9,
      fontWeight: 'bold',
    },
    beverageContent: {
      padding: 10,
    },
    beverageName: {
      fontSize: 13,
      fontWeight: 'bold',
      marginBottom: 3,
    },
    beverageBenefit: {
      fontSize: 10,
      lineHeight: 14,
      marginBottom: 8,
      minHeight: 28,
    },
    beverageAddBtn: {
      borderRadius: 8,
      paddingVertical: 6,
      alignItems: 'center',
    },
    beverageAddBtnText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: 'bold',
    },

    // 🔥 METABOLISM TIP CARD
    metabolismCardWrapper: {
      borderRadius: 20,
      overflow: 'hidden',
      marginBottom: 16,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
    metabolismCardBg: {
      width: '100%',
    },
    metabolismCardImage: {
      borderRadius: 20,
    },
    metabolismOverlay: {
      padding: 18,
    },
    metabolismBadge: {
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0.2)',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      marginBottom: 8,
    },
    metabolismBadgeText: {
      color: '#fff',
      fontSize: 9,
      fontWeight: 'bold',
      letterSpacing: 0.8,
    },
    metabolismTitle: {
      color: '#fff',
      fontSize: 17,
      fontWeight: 'bold',
      marginBottom: 6,
    },
    metabolismDesc: {
      color: 'rgba(255,255,255,0.85)',
      fontSize: 12,
      lineHeight: 18,
      marginBottom: 14,
    },
    metabolismFactsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 8,
    },
    metabolismFactItem: {
      alignItems: 'center',
    },
    metabolismFactNum: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
    },
    metabolismFactLabel: {
      color: 'rgba(255,255,255,0.75)',
      fontSize: 10,
      marginTop: 1,
    },
    metabolismFactDivider: {
      width: 1,
      height: 20,
      backgroundColor: 'rgba(255,255,255,0.2)',
    },

    // 🔔 MODAL STYLES
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
      maxWidth: 400,
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
    modalSubtitle: {
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
    presetContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 8,
    },
    presetButton: {
      width: '48%',
      paddingVertical: 13,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: 'center',
    },
    presetText: {
      fontSize: 13,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 16,
    },
    divider: {
      flex: 1,
      height: 1,
    },
    dividerText: {
      marginHorizontal: 10,
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    customInputRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 14,
    },
    customInputContainer: {
      flex: 1,
    },
    customLabel: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: 4,
    },
    customInput: {
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 15,
      textAlign: 'center',
    },
    customSetButton: {
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
    },
    customSetButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
    },
    modalNote: {
      fontSize: 11,
      textAlign: 'center',
      marginTop: 12,
      fontStyle: 'italic',
    },
  });

export default WaterScreen;