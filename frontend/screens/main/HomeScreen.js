import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Image,
  ImageBackground,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { userStorage } from '../../utils/userStorage';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { fitnessImages, gradients, categoryColors, STATUS_BAR_HEIGHT, SAFE_TOP_PADDING } from '../../utils/theme';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { theme, isDark } = useTheme();
  const [greeting, setGreeting] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [motivationalQuote, setMotivationalQuote] = useState('');
  const [loading, setLoading] = useState(true);

  const [waterGlasses, setWaterGlasses] = useState(0);
  const [caloriesToday, setCaloriesToday] = useState(0);
  const [workoutMinutes, setWorkoutMinutes] = useState(0);

  const WATER_GOAL = 8;
  const CALORIE_GOAL = 2000;
  const WORKOUT_GOAL = 60;

  const quotes = [
    '"The only bad workout is the one that didn\'t happen."',
    '"Push yourself, because no one else is going to do it for you."',
    '"Success starts with self-discipline."',
    '"Your only limit is you."',
    '"Dream big. Work hard. Stay focused."',
  ];

  const loadAllData = async () => {
    try {
      await Promise.all([
        loadWaterData(),
        loadCaloriesData(),
        loadWorkoutData(),
      ]);
    } catch (error) {
      console.log('❌ Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWaterData = async () => {
    try {
      const savedDate = await userStorage.getItem('waterDate');
      const savedGlasses = await userStorage.getItem('waterGlasses');
      const todayStr = new Date().toDateString();
      if (savedDate !== todayStr) {
        setWaterGlasses(0);
        return;
      }
      setWaterGlasses(savedGlasses ? parseInt(savedGlasses) : 0);
    } catch (error) {
      console.log('❌ Water error:', error);
    }
  };

  const loadCaloriesData = async () => {
    try {
      const response = await api.get('/foods/today');
      const total = response.data.reduce((sum, item) => sum + item.calories, 0);
      setCaloriesToday(total);
    } catch (error) {
      setCaloriesToday(0);
    }
  };

  const loadWorkoutData = async () => {
    try {
      const response = await api.get('/workouts');
      const todayStr = new Date().toDateString();
      const todayWorkouts = response.data.filter((w) => {
        const wDate = new Date(w.date).toDateString();
        return wDate === todayStr;
      });
      const totalMinutes = todayWorkouts.reduce(
        (sum, w) => sum + (w.duration || 0),
        0
      );
      setWorkoutMinutes(totalMinutes);
    } catch (error) {
      setWorkoutMinutes(0);
    }
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const now = new Date();
    const options = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };
    setCurrentDate(now.toLocaleDateString('en-US', options));

    const randomIndex = Math.floor(Math.random() * quotes.length);
    setMotivationalQuote(quotes[randomIndex]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [])
  );

  const getGreetingEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅';
    if (hour < 17) return '☀️';
    return '🌙';
  };

  const isWaterChallengeComplete = waterGlasses >= WATER_GOAL;
  const waterProgress = Math.min((waterGlasses / WATER_GOAL) * 100, 100);
  const caloriesProgress = Math.min((caloriesToday / CALORIE_GOAL) * 100, 100);
  const workoutProgress = Math.min((workoutMinutes / WORKOUT_GOAL) * 100, 100);

  const ringCircumference = 2 * Math.PI * 30;

  return (
    <View style={[styles.rootContainer, { backgroundColor: isDark ? '#0A0E1A' : '#F0F4FF' }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* ═══════════════════════════════════════════════════ */}
        {/* 🏆 HERO HEADER - Ultra HD Gym, Immersive Card     */}
        {/* ═══════════════════════════════════════════════════ */}
        <View style={styles.heroContainer}>
          <ImageBackground
            source={{ uri: fitnessImages.heroGymGuy }}
            style={styles.heroImage}
            imageStyle={styles.heroImageStyle}
            resizeMode="cover"
          >
            <LinearGradient
              colors={[
                'rgba(0,0,0,0.18)',
                isDark ? 'rgba(10,14,26,0.58)' : 'rgba(15,23,42,0.58)',
                isDark ? 'rgba(10,14,26,0.96)' : 'rgba(15,23,42,0.92)',
              ]}
              locations={[0, 0.42, 1]}
              style={styles.heroGradient}
            >
              {/* Top bar */}
              <View style={[styles.heroTopBar, { marginTop: SAFE_TOP_PADDING }]}>
                <View style={styles.heroTextCol}>
                  <View style={styles.greetingPill}>
                    <Text style={styles.greetingEmoji}>{getGreetingEmoji()}</Text>
                    <Text style={styles.heroGreeting}>{greeting}</Text>
                    <View style={styles.greetingDot} />
                    <Text style={styles.heroGreetingTag}>FITTRACK</Text>
                  </View>
                  <Text style={styles.heroName}>{user?.name || 'Athlete'}</Text>
                  <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={13} color="rgba(255,255,255,0.75)" style={{ marginRight: 5 }} />
                    <Text style={styles.heroDate}>{currentDate}</Text>
                  </View>
                </View>

                {/* Avatar */}
                <TouchableOpacity
                  onPress={() => navigation.navigate('Settings')}
                  style={styles.avatarWrapper}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#FF6B35', '#F093FB', '#2E86DE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.avatarGlowRing}
                  >
                    {user?.profilePicture ? (
                      <Image
                        source={{ uri: user.profilePicture }}
                        style={styles.avatarImage}
                      />
                    ) : (
                      <LinearGradient
                        colors={['#6C5CE7', '#a29bfe']}
                        style={styles.avatarGradient}
                      >
                        <Text style={styles.avatarText}>
                          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </Text>
                      </LinearGradient>
                    )}
                  </LinearGradient>
                  <View style={styles.avatarOnlineDot} />
                </TouchableOpacity>
              </View>

              {/* Motivation Card with Quick Start CTA */}
              <TouchableOpacity
                style={styles.quoteBox}
                activeOpacity={0.88}
                onPress={() => navigation.navigate('Workout')}
              >
                <View style={styles.quoteTopRow}>
                  <View style={styles.quoteBadgeRow}>
                    <Ionicons name="sparkles" size={13} color="#FFD700" />
                    <Text style={styles.quoteBadgeText}>DAILY FOCUS</Text>
                  </View>
                  <LinearGradient
                    colors={['#FF6B35', '#E85A24']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.quoteCtaBtn}
                  >
                    <Text style={styles.quoteCtaText}>Start</Text>
                    <Ionicons name="play" size={10} color="#FFFFFF" style={{ marginLeft: 3 }} />
                  </LinearGradient>
                </View>
                <Text style={styles.quoteText} numberOfLines={2}>
                  {motivationalQuote}
                </Text>
              </TouchableOpacity>

              {/* Floating Live Metric Rings */}
              {!loading && (
                <View style={styles.ringStatsRow}>
                  {/* Workout */}
                  <TouchableOpacity
                    style={styles.ringStat}
                    onPress={() => navigation.navigate('Workout')}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.ringOuter, { borderColor: 'rgba(255,107,53,0.3)' }]}>
                      <LinearGradient
                        colors={['rgba(255,107,53,0.25)', 'rgba(255,107,53,0.08)']}
                        style={styles.ringInnerGrad}
                      >
                        <Ionicons name="barbell-outline" size={15} color="#FF6B35" />
                        <Text style={styles.ringValue}>{workoutMinutes}</Text>
                        <Text style={styles.ringUnit}>min</Text>
                      </LinearGradient>
                    </View>
                    <Text style={styles.ringLabel}>Workout</Text>
                    <View style={styles.ringProgressBar}>
                      <LinearGradient
                        colors={['#FF8B5A', '#FF6B35']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                          styles.ringProgressFill,
                          { width: `${Math.min(workoutProgress, 100)}%` },
                        ]}
                      />
                    </View>
                  </TouchableOpacity>

                  <View style={styles.ringDivider} />

                  {/* Calories */}
                  <TouchableOpacity
                    style={styles.ringStat}
                    onPress={() => navigation.navigate('Calories')}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.ringOuter, { borderColor: 'rgba(240,147,251,0.3)' }]}>
                      <LinearGradient
                        colors={['rgba(240,147,251,0.25)', 'rgba(240,147,251,0.08)']}
                        style={styles.ringInnerGrad}
                      >
                        <Ionicons name="flame-outline" size={15} color="#F093FB" />
                        <Text style={styles.ringValue}>{caloriesToday}</Text>
                        <Text style={styles.ringUnit}>kcal</Text>
                      </LinearGradient>
                    </View>
                    <Text style={styles.ringLabel}>Calories</Text>
                    <View style={styles.ringProgressBar}>
                      <LinearGradient
                        colors={['#F093FB', '#E07FE8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                          styles.ringProgressFill,
                          { width: `${Math.min(caloriesProgress, 100)}%` },
                        ]}
                      />
                    </View>
                  </TouchableOpacity>

                  <View style={styles.ringDivider} />

                  {/* Water */}
                  <TouchableOpacity
                    style={styles.ringStat}
                    onPress={() => navigation.navigate('Water')}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.ringOuter, { borderColor: 'rgba(0,229,255,0.3)' }]}>
                      <LinearGradient
                        colors={['rgba(0,229,255,0.25)', 'rgba(0,229,255,0.08)']}
                        style={styles.ringInnerGrad}
                      >
                        <Ionicons name="water-outline" size={15} color="#00E5FF" />
                        <Text style={styles.ringValue}>{waterGlasses}</Text>
                        <Text style={styles.ringUnit}>/ 8</Text>
                      </LinearGradient>
                    </View>
                    <Text style={styles.ringLabel}>Water</Text>
                    <View style={styles.ringProgressBar}>
                      <LinearGradient
                        colors={['#00E5FF', '#00B4D8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                          styles.ringProgressFill,
                          { width: `${Math.min(waterProgress, 100)}%` },
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </LinearGradient>
          </ImageBackground>
        </View>

        {/* ═══════════════════════════════════════════════════ */}
        {/* ⚡ QUICK ACTIONS - Premium 2x2 Grid                */}
        {/* ═══════════════════════════════════════════════════ */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>⚡ Quick Actions</Text>
          </View>

          <View style={styles.actionsGrid}>
            {/* Workout */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Workout')}
              activeOpacity={0.88}
            >
              <ImageBackground
                source={{ uri: fitnessImages.heroGym }}
                style={styles.actionBg}
                imageStyle={styles.actionBgImage}
              >
                <LinearGradient
                  colors={['rgba(255,107,53,0.15)', 'rgba(255,107,53,0.85)']}
                  style={styles.actionOverlay}
                >
                  <Text style={styles.actionEmoji}>🏋️</Text>
                  <Text style={styles.actionLabel}>Workout</Text>
                  <Text style={styles.actionSub}>Start training</Text>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>

            {/* Nutrition */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Calories')}
              activeOpacity={0.88}
            >
              <ImageBackground
                source={{ uri: fitnessImages.homeNutrition }}
                style={styles.actionBg}
                imageStyle={styles.actionBgImage}
              >
                <LinearGradient
                  colors={['rgba(240,147,251,0.15)', 'rgba(240,147,251,0.85)']}
                  style={styles.actionOverlay}
                >
                  <Text style={styles.actionEmoji}>🍎</Text>
                  <Text style={styles.actionLabel}>Nutrition</Text>
                  <Text style={styles.actionSub}>Log your meals</Text>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>

            {/* Water */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Water')}
              activeOpacity={0.88}
            >
              <ImageBackground
                source={{ uri: fitnessImages.homeHydration }}
                style={styles.actionBg}
                imageStyle={styles.actionBgImage}
              >
                <LinearGradient
                  colors={['rgba(0,229,255,0.15)', 'rgba(0,150,200,0.85)']}
                  style={styles.actionOverlay}
                >
                  <Text style={styles.actionEmoji}>💧</Text>
                  <Text style={styles.actionLabel}>Hydration</Text>
                  <Text style={styles.actionSub}>Track water</Text>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>

            {/* Progress */}
            <TouchableOpacity
              style={styles.actionCard}
              onPress={() => navigation.navigate('Progress')}
              activeOpacity={0.88}
            >
              <ImageBackground
                source={{ uri: fitnessImages.heroAthlete }}
                style={styles.actionBg}
                imageStyle={styles.actionBgImage}
              >
                <LinearGradient
                  colors={['rgba(108,92,231,0.15)', 'rgba(108,92,231,0.85)']}
                  style={styles.actionOverlay}
                >
                  <Text style={styles.actionEmoji}>📊</Text>
                  <Text style={styles.actionLabel}>Progress</Text>
                  <Text style={styles.actionSub}>View stats</Text>
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════ */}
        {/* 🏆 DAILY CHALLENGE                                 */}
        {/* ═══════════════════════════════════════════════════ */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>🏆 Daily Challenge</Text>
            <View
              style={[
                styles.badgePill,
                { backgroundColor: isWaterChallengeComplete ? '#00C853' : theme.primary },
              ]}
            >
              <Text style={styles.badgePillText}>
                {isWaterChallengeComplete ? '✅ Done' : 'Active'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Water')}
          >
            <LinearGradient
              colors={isWaterChallengeComplete ? ['#00C853', '#00E676'] : ['#0066FF', '#00B4D8']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.challengeCard}
            >
              {/* Background watermark image */}
              <Image
                source={{ uri: fitnessImages.homeHydration }}
                style={styles.challengeBgImg}
                blurRadius={8}
              />
              <View style={styles.challengeContent}>
                <View style={styles.challengeTop}>
                  <View style={styles.challengeLeft}>
                    <Text style={styles.challengeEmoji}>
                      {isWaterChallengeComplete ? '🏆' : '💧'}
                    </Text>
                    <View>
                      <Text style={styles.challengeTitle}>Water Challenge</Text>
                      <Text style={styles.challengeSub}>
                        {isWaterChallengeComplete
                          ? 'Challenge Complete! 🎉'
                          : `${waterGlasses} of ${WATER_GOAL} glasses done`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.challengeStatusBadge}>
                    <Text style={styles.challengeStatusText}>
                      {isWaterChallengeComplete ? 'DONE' : 'GO!'}
                    </Text>
                  </View>
                </View>

                {/* Progress track */}
                <View style={styles.glassTrack}>
                  {Array.from({ length: WATER_GOAL }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.glassSegment,
                        {
                          backgroundColor:
                            i < waterGlasses
                              ? 'rgba(255,255,255,0.95)'
                              : 'rgba(255,255,255,0.25)',
                        },
                      ]}
                    />
                  ))}
                </View>

                <View style={styles.challengeBottom}>
                  <Text style={styles.challengeCountText}>
                    <Text style={styles.challengeCountBig}>{waterGlasses}</Text>
                    <Text style={styles.challengeCountSmall}> / {WATER_GOAL} glasses</Text>
                  </Text>
                  <View style={styles.challengeArrow}>
                    <Text style={styles.challengeArrowText}>
                      {isWaterChallengeComplete ? '✅ Great job!' : 'Tap to add →'}
                    </Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ═══════════════════════════════════════════════════ */}
        {/* 🔥 TODAY'S PROGRESS                                */}
        {/* ═══════════════════════════════════════════════════ */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>🔥 Today's Progress</Text>

          {/* Calories */}
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={() => navigation.navigate('Calories')}
            style={[
              styles.progressCard,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E8EEFF',
              },
            ]}
          >
            <View style={styles.progressCardInner}>
              <LinearGradient
                colors={caloriesProgress >= 100 ? gradients.red : ['#F093FB', '#f5576c']}
                style={styles.progressIconCircle}
              >
                <Text style={styles.progressIcon}>🍔</Text>
              </LinearGradient>
              <View style={styles.progressInfo}>
                <Text style={[styles.progressName, { color: theme.text }]}>Calories</Text>
                <Text style={[styles.progressDetail, { color: theme.textSecondary }]}>
                  {caloriesToday} / {CALORIE_GOAL} kcal
                </Text>
                <View style={[styles.progressTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#EEF0FF' }]}>
                  <LinearGradient
                    colors={caloriesProgress >= 100 ? gradients.red : ['#F093FB', '#f5576c']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressFill, { width: `${caloriesProgress}%` }]}
                  />
                </View>
              </View>
              <Text style={[styles.progressPct, { color: caloriesProgress >= 100 ? '#F44336' : '#F093FB' }]}>
                {Math.round(caloriesProgress)}%
              </Text>
            </View>
          </TouchableOpacity>

          {/* Water + Workout side-by-side */}
          <View style={styles.dualCardRow}>
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() => navigation.navigate('Water')}
              style={[
                styles.dualCard,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E8EEFF',
                },
              ]}
            >
              <LinearGradient
                colors={['#00E5FF', '#0099CC']}
                style={styles.dualCardIcon}
              >
                <Text style={styles.dualCardEmoji}>💧</Text>
              </LinearGradient>
              <Text style={[styles.dualCardLabel, { color: theme.textSecondary }]}>Water</Text>
              <Text style={[styles.dualCardValue, { color: isWaterChallengeComplete ? '#00C853' : theme.text }]}>
                {waterGlasses}/{WATER_GOAL}
              </Text>
              <View style={[styles.dualTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E0F7FF' }]}>
                <View
                  style={[
                    styles.dualFill,
                    {
                      width: `${waterProgress}%`,
                      backgroundColor: isWaterChallengeComplete ? '#00C853' : '#00B4D8',
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() => navigation.navigate('Workout')}
              style={[
                styles.dualCard,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E8EEFF',
                },
              ]}
            >
              <LinearGradient
                colors={['#FF6B35', '#E85A24']}
                style={styles.dualCardIcon}
              >
                <Text style={styles.dualCardEmoji}>🏋️</Text>
              </LinearGradient>
              <Text style={[styles.dualCardLabel, { color: theme.textSecondary }]}>Workout</Text>
              <Text style={[styles.dualCardValue, { color: theme.text }]}>
                {workoutMinutes}m
              </Text>
              <View style={[styles.dualTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#FFF0E8' }]}>
                <View
                  style={[
                    styles.dualFill,
                    {
                      width: `${workoutProgress}%`,
                      backgroundColor: '#FF6B35',
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══════════════════════════════════════════════════ */}
        {/* 💪 MOTIVATION BANNER                              */}
        {/* ═══════════════════════════════════════════════════ */}
        <View style={styles.sectionWrap}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Workout')}
          >
            <ImageBackground
              source={{ uri: fitnessImages.motivation2 }}
              style={styles.motivationCard}
              imageStyle={styles.motivationImage}
            >
              <LinearGradient
                colors={['rgba(108,92,231,0.1)', 'rgba(108,92,231,0.92)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.motivationOverlay}
              >
                <View style={styles.motivationLeft}>
                  <Text style={styles.motivationEmoji}>💪</Text>
                  <View>
                    <Text style={styles.motivationTitle}>Ready to crush it?</Text>
                    <Text style={styles.motivationSub}>Start your workout now →</Text>
                  </View>
                </View>
                <View style={styles.motivationChip}>
                  <Text style={styles.motivationChipText}>LET'S GO</Text>
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        </View>

        {/* ═══════════════════════════════════════════════════ */}
        {/* 🥗 FEATURED SECTIONS with HD images               */}
        {/* ═══════════════════════════════════════════════════ */}
        <View style={styles.sectionWrap}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>🌟 Explore</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
            {[
              {
                label: 'BMI Check',
                sub: 'Know your health index',
                emoji: '⚖️',
                screen: 'BMI',
                image: fitnessImages.heroSunrise,
                color: '#667EEA',
              },
              {
                label: 'Meal Log',
                sub: 'Track macros & calories',
                emoji: '🥗',
                screen: 'Calories',
                image: fitnessImages.healthyFood,
                color: '#F093FB',
              },
              {
                label: 'History',
                sub: 'Your workout archive',
                emoji: '📅',
                screen: 'WorkoutHistory',
                image: fitnessImages.heroAthlete,
                color: '#FF6B35',
              },
              {
                label: 'Profile',
                sub: 'Goals & settings',
                emoji: '👤',
                screen: 'Settings',
                image: fitnessImages.heroRunning,
                color: '#00E5FF',
              },
            ].map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.featuredCard}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.88}
              >
                <ImageBackground
                  source={{ uri: item.image }}
                  style={styles.featuredBg}
                  imageStyle={styles.featuredBgImg}
                >
                  <LinearGradient
                    colors={[`${item.color}22`, `${item.color}DD`]}
                    style={styles.featuredOverlay}
                  >
                    <Text style={styles.featuredEmoji}>{item.emoji}</Text>
                    <Text style={styles.featuredLabel}>{item.label}</Text>
                    <Text style={styles.featuredSub}>{item.sub}</Text>
                  </LinearGradient>
                </ImageBackground>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },

  // ─── HERO ─────────────────────────────────────────────
  heroContainer: {
    width: '100%',
    minHeight: 410,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  heroImage: {
    flex: 1,
  },
  heroImageStyle: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroGradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 22,
    justifyContent: 'space-between',
  },
  heroTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  greetingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  greetingEmoji: {
    fontSize: 13,
    marginRight: 5,
  },
  heroGreeting: {
    fontSize: 12.5,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  greetingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginHorizontal: 6,
  },
  heroGreetingTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 0.8,
  },
  heroName: {
    fontSize: 29,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  heroDate: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarGlowRing: {
    padding: 2.5,
    borderRadius: 30,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  avatarOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#00E676',
    borderWidth: 2.5,
    borderColor: '#0A0E1A',
  },

  // Quote
  quoteBox: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  quoteTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quoteBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quoteBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 0.8,
  },
  quoteText: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.92)',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  quoteCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 3,
  },
  quoteCtaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Ring stats
  ringStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.11)',
    borderRadius: 22,
    borderWidth: 1.2,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 14,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  ringStat: {
    alignItems: 'center',
    flex: 1,
  },
  ringOuter: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1.5,
    overflow: 'hidden',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  ringInnerGrad: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  ringValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 1,
    lineHeight: 16,
  },
  ringUnit: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    lineHeight: 11,
  },
  ringLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '700',
    marginBottom: 5,
    letterSpacing: 0.2,
  },
  ringProgressBar: {
    width: 58,
    height: 4.5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  ringProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  ringDivider: {
    width: 1,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },

  // ─── SECTIONS ─────────────────────────────────────────
  sectionWrap: {
    paddingHorizontal: 18,
    marginTop: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  badgePill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgePillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },

  // ─── ACTIONS GRID ────────────────────────────────────
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: (width - 48) / 2,
    height: 130,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  actionBg: {
    flex: 1,
  },
  actionBgImage: {
    borderRadius: 20,
  },
  actionOverlay: {
    flex: 1,
    padding: 14,
    justifyContent: 'flex-end',
  },
  actionEmoji: {
    fontSize: 26,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.2,
  },
  actionSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 1,
  },

  // ─── CHALLENGE CARD ──────────────────────────────────
  challengeCard: {
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#0066FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  challengeBgImg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.12,
  },
  challengeContent: {
    padding: 20,
  },
  challengeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  challengeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  challengeEmoji: { fontSize: 36, marginRight: 12 },
  challengeTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  challengeSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  challengeStatusBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  challengeStatusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  glassTrack: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 14,
  },
  glassSegment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  challengeBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  challengeCountText: { flexDirection: 'row' },
  challengeCountBig: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  challengeCountSmall: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  challengeArrow: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  challengeArrowText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // ─── PROGRESS CARDS ──────────────────────────────────
  progressCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  progressCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressIcon: { fontSize: 22 },
  progressInfo: { flex: 1 },
  progressName: { fontSize: 15, fontWeight: '700' },
  progressDetail: { fontSize: 12, marginTop: 1 },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: { height: '100%', borderRadius: 3 },
  progressPct: { fontSize: 15, fontWeight: '800' },

  dualCardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dualCard: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  dualCardIcon: {
    width: 44,
    height: 44,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  dualCardEmoji: { fontSize: 22 },
  dualCardLabel: { fontSize: 12, fontWeight: '600' },
  dualCardValue: { fontSize: 20, fontWeight: '800', marginTop: 2 },
  dualTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 8,
  },
  dualFill: { height: '100%', borderRadius: 3 },

  // ─── MOTIVATION BANNER ───────────────────────────────
  motivationCard: {
    height: 120,
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  motivationImage: { borderRadius: 22 },
  motivationOverlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  motivationLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  motivationEmoji: { fontSize: 34 },
  motivationTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  motivationSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  motivationChip: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  motivationChipText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 1,
  },

  // ─── FEATURED HORIZONTAL SCROLL ──────────────────────
  featuredScroll: {
    marginLeft: -18,
    paddingLeft: 18,
  },
  featuredCard: {
    width: 140,
    height: 185,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  featuredBg: { flex: 1 },
  featuredBgImg: { borderRadius: 20 },
  featuredOverlay: {
    flex: 1,
    padding: 14,
    justifyContent: 'flex-end',
  },
  featuredEmoji: { fontSize: 28, marginBottom: 6 },
  featuredLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.2,
  },
  featuredSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
});

export default HomeScreen;