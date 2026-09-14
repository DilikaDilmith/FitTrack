// ============================================
// 🎨 FITTRACK COLOR SYSTEM - ENHANCED
// ============================================
import { Platform, StatusBar } from 'react-native';

export const STATUS_BAR_HEIGHT =
  Platform.OS === 'android' ? Math.max(StatusBar.currentHeight || 0, 32) : 44;
export const SAFE_TOP_PADDING = STATUS_BAR_HEIGHT + 14;

// ⭐ CATEGORY COLORS - Fitness Workouts
export const categoryColors = {
  Chest: {
    primary: '#FF6B6B',
    gradient: ['#FF6B6B', '#EE5A52'],
    light: '#FFE5E5',
    emoji: '🏋️',
  },
  Arms: {
    primary: '#4ECDC4',
    gradient: ['#4ECDC4', '#3DBDB5'],
    light: '#E0F7F5',
    emoji: '💪',
  },
  Legs: {
    primary: '#95E1D3',
    gradient: ['#95E1D3', '#7DD0C0'],
    light: '#E5F9F4',
    emoji: '🦵',
  },
  Abs: {
    primary: '#F38181',
    gradient: ['#F38181', '#E56B6B'],
    light: '#FCE5E5',
    emoji: '🔥',
  },
  Cardio: {
    primary: '#FFA07A',
    gradient: ['#FFA07A', '#FF8B5A'],
    light: '#FFEDE0',
    emoji: '🏃',
  },
  Yoga: {
    primary: '#A8E6CF',
    gradient: ['#A8E6CF', '#8FD9BD'],
    light: '#E5F8F0',
    emoji: '🧘',
  },
  Back: {
    primary: '#667EEA',
    gradient: ['#667EEA', '#5568D3'],
    light: '#E5E9FA',
    emoji: '🔙',
  },
  Shoulders: {
    primary: '#F093FB',
    gradient: ['#F093FB', '#E07FE8'],
    light: '#FAE5FB',
    emoji: '🎯',
  },
  Glutes: {
    primary: '#FFA07A',
    gradient: ['#FFA07A', '#FF8B5A'],
    light: '#FFEDE0',
    emoji: '🍑',
  },
};

// ⭐ CHART COLORS - Progress
export const chartColors = {
  weight: '#9B59B6',
  calories: '#F39C12',
  workout: '#E67E22',
  water: '#1ABC9C',
  bmi: '#3498DB',
};

// ⭐ BMI STATUS COLORS
export const bmiColors = {
  severeUnderweight: '#C0392B',
  underweight: '#E67E22',
  normal: '#27AE60',
  overweight: '#E67E22',
  obese1: '#E74C3C',
  obese2: '#C0392B',
  obese3: '#8B0000',
};

// ⭐ MEAL COLORS
export const mealColors = {
  Breakfast: '#F39C12',
  Lunch: '#3498DB',
  Dinner: '#9B59B6',
  Snack: '#E74C3C',
};

// ============================================
// 🌞 LIGHT THEME - ENERGY BLUE + ORANGE
// ============================================
export const lightTheme = {
  mode: 'light',

  // 🎨 PRIMARY - Energy Blue
  primary: '#2E86DE',
  primaryDark: '#1B6FC4',
  primaryLight: '#E3F2FD',
  primaryGradient: ['#2E86DE', '#1B6FC4'],

  // 🎨 ACCENT - Motivational Orange
  accent: '#FF6B35',
  accentDark: '#E85A24',
  accentLight: '#FFF3E0',
  accentGradient: ['#FF6B35', '#E85A24'],

  // 🎨 SECONDARY - Purple
  secondary: '#6C5CE7',
  secondaryLight: '#EEE9FF',
  secondaryGradient: ['#6C5CE7', '#5B4DD1'],

  // 📊 STATUS Colors
  success: '#00C853',
  successLight: '#E8F5E9',
  successGradient: ['#00C853', '#00A844'],

  warning: '#FFC107',
  warningLight: '#FFF8E1',
  warningGradient: ['#FFC107', '#FFA000'],

  danger: '#F44336',
  dangerLight: '#FFEBEE',
  dangerGradient: ['#F44336', '#E53935'],

  info: '#2196F3',
  infoLight: '#E3F2FD',

  // 🎨 BACKGROUNDS
  background: '#F8FAFC',
  backgroundSecondary: '#F1F5F9',
  card: '#FFFFFF',
  cardSecondary: '#F8FAFC',
  cardElevated: '#FFFFFF',

  // 🎨 TEXT
  text: '#1E293B',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  textInverse: '#FFFFFF',

  // 🎨 BORDERS
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderDark: '#CBD5E1',

  // 🎨 INPUTS
  inputBackground: '#F8FAFC',
  inputBorder: '#CBD5E1',
  inputPlaceholder: '#94A3B8',

  // 🎨 HEADER
  headerGradient: ['#2E86DE', '#1B6FC4'],

  // 🎨 TAB BAR
  tabBarActive: '#2E86DE',
  tabBarInactive: '#94A3B8',
  tabBarBg: '#FFFFFF',

  // 🎨 OVERLAY
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // 🎨 SHADOW
  shadow: '#000000',
  shadowLight: 'rgba(0, 0, 0, 0.05)',
  shadowMedium: 'rgba(0, 0, 0, 0.1)',
  shadowHeavy: 'rgba(0, 0, 0, 0.15)',

  // 🎨 GLASS EFFECT
  glass: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',

  // 🎨 SPECIAL
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  fire: '#FF6B35',
  water: '#00B4D8',
  heart: '#FF4B6E',
};

// ============================================
// 🌙 DARK THEME - MODERN DARK
// ============================================
export const darkTheme = {
  mode: 'dark',

  // 🎨 PRIMARY - Bright Blue
  primary: '#4A9EFF',
  primaryDark: '#2E86DE',
  primaryLight: '#1A3A5C',
  primaryGradient: ['#4A9EFF', '#2E86DE'],

  // 🎨 ACCENT - Vibrant Orange
  accent: '#FF8B5A',
  accentDark: '#FF6B35',
  accentLight: '#3A2015',
  accentGradient: ['#FF8B5A', '#FF6B35'],

  // 🎨 SECONDARY - Purple
  secondary: '#A29BFE',
  secondaryLight: '#2A1F5C',
  secondaryGradient: ['#A29BFE', '#6C5CE7'],

  // 📊 STATUS Colors
  success: '#00E676',
  successLight: '#1A3A1A',
  successGradient: ['#00E676', '#00C853'],

  warning: '#FFD54F',
  warningLight: '#3A301A',
  warningGradient: ['#FFD54F', '#FFC107'],

  danger: '#FF5252',
  dangerLight: '#3A1A1A',
  dangerGradient: ['#FF5252', '#F44336'],

  info: '#64B5F6',
  infoLight: '#1A2A3A',

  // 🎨 BACKGROUNDS
  background: '#0F1419',
  backgroundSecondary: '#151B24',
  card: '#1A1F2E',
  cardSecondary: '#232936',
  cardElevated: '#252D3D',

  // 🎨 TEXT
  text: '#ECF0F1',
  textSecondary: '#95A5A6',
  textLight: '#7F8C8D',
  textInverse: '#0F1419',

  // 🎨 BORDERS
  border: '#2C3E50',
  borderLight: '#1E2530',
  borderDark: '#3D5062',

  // 🎨 INPUTS
  inputBackground: '#232936',
  inputBorder: '#2C3E50',
  inputPlaceholder: '#7F8C8D',

  // 🎨 HEADER
  headerGradient: ['#1A3A5C', '#0F1419'],

  // 🎨 TAB BAR
  tabBarActive: '#4A9EFF',
  tabBarInactive: '#7F8C8D',
  tabBarBg: '#1A1F2E',

  // 🎨 OVERLAY
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',

  // 🎨 SHADOW
  shadow: '#000000',
  shadowLight: 'rgba(0, 0, 0, 0.3)',
  shadowMedium: 'rgba(0, 0, 0, 0.4)',
  shadowHeavy: 'rgba(0, 0, 0, 0.5)',

  // 🎨 GLASS EFFECT
  glass: 'rgba(26, 31, 46, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',

  // 🎨 SPECIAL
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  fire: '#FF8B5A',
  water: '#00E5FF',
  heart: '#FF6B9D',
};

// ============================================
// 📐 SPACING SYSTEM (8px Grid)
// ============================================
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// ============================================
// 🔘 BORDER RADIUS
// ============================================
export const radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

// ============================================
// 🌫️ SHADOW PRESETS
// ============================================
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
};

// ============================================
// 🖼️ FITNESS IMAGES - HD Quality (Unsplash)
// ============================================
export const fitnessImages = {
  // Hero Backgrounds - Ultra HD
  heroGymGuy: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1200&q=95&fit=crop',
  heroGym: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=95&fit=crop',
  heroYoga: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&q=95&fit=crop',
  heroRunning: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&q=95&fit=crop',
  heroWater: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=1200&q=95&fit=crop',
  heroHealthy: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=95&fit=crop',
  heroPower: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=1200&q=95&fit=crop',
  heroAthlete: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=1200&q=95&fit=crop',
  heroSunrise: 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=1200&q=95&fit=crop',

  // Category Images - HD
  chest: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=90&fit=crop',
  arms: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=90&fit=crop',
  legs: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=800&q=90&fit=crop',
  abs: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=90&fit=crop',
  cardio: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=90&fit=crop',
  yoga: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=90&fit=crop',
  back: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?w=800&q=90&fit=crop',
  shoulders: 'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=800&q=90&fit=crop',

  // Motivation - HD
  motivation1: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=1200&q=95&fit=crop',
  motivation2: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=95&fit=crop',
  motivation3: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=1200&q=95&fit=crop',

  // Water & Nutrition - HD
  waterGlass: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=800&q=90&fit=crop',
  waterSplash: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800&q=90&fit=crop',
  healthyFood: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=90&fit=crop',
  salad: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=90&fit=crop',
  fruits: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=90&fit=crop',

  // Achievement & Progress - HD
  trophy: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&q=90&fit=crop',
  progress: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=90&fit=crop',
  bmi: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=90&fit=crop',

  // Home Screen Sections
  homeWorkout: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=1200&q=95&fit=crop',
  homeNutrition: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=95&fit=crop',
  homeHydration: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=1200&q=95&fit=crop',
};

// ============================================
// 🥗 FOOD & CALORIE IMAGES - HD Quality
// ============================================
export const mealImages = {
  Breakfast: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=90&fit=crop',
  Lunch: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=90&fit=crop',
  Dinner: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=90&fit=crop',
  Snack: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40?w=800&q=90&fit=crop',
};

export const foodImages = {
  hero: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=95&fit=crop',
  heroAlt: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=95&fit=crop',
  emptyPlate: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=800&q=90&fit=crop',
  nutritionTip: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=90&fit=crop',
  // Food presets HD thumbnails
  rice: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=400&q=85&fit=crop',
  chicken: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=85&fit=crop',
  egg: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=85&fit=crop',
  banana: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=85&fit=crop',
  apple: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=85&fit=crop',
  bread: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=85&fit=crop',
  milk: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=85&fit=crop',
  yogurt: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=85&fit=crop',
  salmon: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=85&fit=crop',
  salad: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=85&fit=crop',
  avocado: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&q=85&fit=crop',
  shake: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&q=85&fit=crop',
};

// ============================================
// 💧 WATER & HYDRATION IMAGES - HD Quality
// ============================================
export const waterImages = {
  hero: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=1200&q=95&fit=crop',
  lemonWater: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&q=90&fit=crop',
  cucumberWater: 'https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?w=600&q=90&fit=crop',
  watermelon: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=600&q=90&fit=crop',
  coconutWater: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=600&q=90&fit=crop',
  berryWater: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&q=90&fit=crop',
  greenTea: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=90&fit=crop',
  citrusSplash: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&q=90&fit=crop',
  pureWater: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=600&q=90&fit=crop',
  metabolismTip: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=95&fit=crop',
};

// ============================================
// 🏆 PROGRESS & GYM MOTIVATION IMAGES - HD Quality
// ============================================
export const progressImages = {
  hero: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&q=95&fit=crop',
  trophyBanner: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&q=90&fit=crop',
  deadlift: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=90&fit=crop',
  physique: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=90&fit=crop',
  athleteFocus: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800&q=90&fit=crop',
  runnerSpeed: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=90&fit=crop',
  gritDetermination: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=90&fit=crop',
  bodybuilding: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=90&fit=crop',
  recoveryYoga: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&q=90&fit=crop',
};

// ============================================
// 🎨 GRADIENT PRESETS
// ============================================
export const gradients = {
  blue: ['#2E86DE', '#1B6FC4'],
  orange: ['#FF6B35', '#E85A24'],
  purple: ['#6C5CE7', '#5B4DD1'],
  green: ['#00C853', '#00A844'],
  red: ['#F44336', '#E53935'],
  pink: ['#F093FB', '#E07FE8'],
  teal: ['#1ABC9C', '#16A085'],
  dark: ['#2C3E50', '#1A252F'],
  sunset: ['#FF6B35', '#F093FB'],
  ocean: ['#2E86DE', '#4ECDC4'],
  fire: ['#FF6B35', '#FFC107'],
  night: ['#0F1419', '#1A1F2E'],
};