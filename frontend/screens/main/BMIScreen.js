import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  ImageBackground,
} from 'react-native';
import Alert from '../../components/FitAlert';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { userStorage } from '../../utils/userStorage';
import { useTheme } from '../../context/ThemeContext';
import { SAFE_TOP_PADDING } from '../../utils/theme';

const { width } = Dimensions.get('window');

const CATEGORY_CARDS = [
  {
    title: 'Underweight',
    range: '< 18.5',
    color: '#3498DB',
    bgBadge: 'rgba(52, 152, 219, 0.18)',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=90&fit=crop',
    tip: 'Build strength with nutrient-dense meals & protein.',
  },
  {
    title: 'Normal Weight',
    range: '18.5 – 24.9',
    color: '#00E676',
    bgBadge: 'rgba(0, 230, 118, 0.18)',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=90&fit=crop',
    tip: 'Optimal health! Maintain balanced diet & daily exercise.',
  },
  {
    title: 'Overweight',
    range: '25.0 – 29.9',
    color: '#FF9800',
    bgBadge: 'rgba(255, 152, 0, 0.18)',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&q=90&fit=crop',
    tip: 'Focus on 30 min daily cardio and calorie control.',
  },
  {
    title: 'Obese',
    range: '≥ 30.0',
    color: '#F44336',
    bgBadge: 'rgba(244, 67, 54, 0.18)',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=90&fit=crop',
    tip: 'Consult a health professional for a custom plan.',
  },
];

const BMIScreen = () => {
  const { theme, isDark } = useTheme();
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [bmiResult, setBmiResult] = useState(null);
  const [history, setHistory] = useState([]);

  const S = dynamicStyles(theme, isDark);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await userStorage.getItem('bmiHistory');
      if (data) setHistory(JSON.parse(data));
    } catch (error) {
      console.log('❌ Load history error:', error);
    }
  };

  const saveHistory = async (newHistory) => {
    try {
      await userStorage.setItem('bmiHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.log('❌ Save history error:', error);
    }
  };

  const getBMICategory = (bmi) => {
    if (bmi < 16) {
      return {
        status: 'Severely Underweight',
        color: '#c0392b',
        emoji: '🚨',
        bg: isDark ? '#3a1a1a' : '#fadbd8',
        tip: 'Your BMI is critically low. Please consult a doctor immediately.',
      };
    } else if (bmi < 18.5) {
      return {
        status: 'Underweight',
        color: '#3498db',
        emoji: '⚠️',
        bg: isDark ? '#1a2a3a' : '#e8f4fd',
        tip: 'Increase calorie intake with healthy foods like nuts, avocados, and lean protein.',
      };
    } else if (bmi < 25) {
      return {
        status: 'Normal Weight',
        color: '#00E676',
        emoji: '✅',
        bg: isDark ? '#1a3a1a' : '#e8f8f0',
        tip: 'Fantastic! You are in the optimal zone. Maintain with balanced nutrition and workouts.',
      };
    } else if (bmi < 30) {
      return {
        status: 'Overweight',
        color: '#FF9800',
        emoji: '⚠️',
        bg: isDark ? '#3a2a1a' : '#fff3e0',
        tip: 'Focus on portion control and aim for 30–45 minutes of moderate aerobic exercise daily.',
      };
    } else if (bmi < 35) {
      return {
        status: 'Obese Class I',
        color: '#e74c3c',
        emoji: '🚨',
        bg: isDark ? '#3a1a1a' : '#fadbd8',
        tip: 'Start with 20–30 min daily walking and cut refined sugars to protect metabolic health.',
      };
    } else if (bmi < 40) {
      return {
        status: 'Obese Class II',
        color: '#c0392b',
        emoji: '🚨',
        bg: isDark ? '#3a1a1a' : '#fadbd8',
        tip: 'Medical supervision is recommended to design an appropriate nutrition and activity plan.',
      };
    } else {
      return {
        status: 'Obese Class III',
        color: '#8b0000',
        emoji: '🚨',
        bg: isDark ? '#4a0a0a' : '#f5b7b1',
        tip: 'Critical health category. We strongly advise speaking with a healthcare specialist.',
      };
    }
  };

  const estimateBodyFat = (bmi, ageVal, genderVal) => {
    if (!ageVal || !bmi) return null;
    const ageNum = parseInt(ageVal);
    if (isNaN(ageNum)) return null;
    const genderFactor = genderVal === 'male' ? 1 : 0;
    const bf = 1.2 * bmi + 0.23 * ageNum - 10.8 * genderFactor - 5.4;
    return Math.max(0, bf).toFixed(1);
  };

  const getHealthyWeightRange = (heightCm) => {
    const h = parseFloat(heightCm) / 100;
    if (!h || isNaN(h)) return null;
    const min = (18.5 * h * h).toFixed(1);
    const max = (24.9 * h * h).toFixed(1);
    return { min, max };
  };

  const calculateBMI = () => {
    if (height.trim() === '' || weight.trim() === '') {
      Alert.alert('Error', 'Please enter both height and weight');
      return;
    }
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    if (isNaN(heightNum) || isNaN(weightNum) || heightNum <= 0 || weightNum <= 0) {
      Alert.alert('Error', 'Please enter valid numbers');
      return;
    }
    if (heightNum < 50 || heightNum > 250) {
      Alert.alert('Error', 'Height must be between 50cm and 250cm');
      return;
    }
    if (weightNum < 20 || weightNum > 300) {
      Alert.alert('Error', 'Weight must be between 20kg and 300kg');
      return;
    }

    const heightInMeters = heightNum / 100;
    const bmi = weightNum / (heightInMeters * heightInMeters);
    const roundedBMI = parseFloat(bmi.toFixed(1));
    const category = getBMICategory(roundedBMI);
    const bodyFat = estimateBodyFat(roundedBMI, age, gender);
    const healthyRange = getHealthyWeightRange(heightNum);

    let weightRecommendation = null;
    if (healthyRange) {
      if (weightNum < parseFloat(healthyRange.min)) {
        const gain = (parseFloat(healthyRange.min) - weightNum).toFixed(1);
        weightRecommendation = {
          type: 'gain',
          amount: gain,
          message: `Gain at least ${gain} kg to enter the healthy weight range`,
        };
      } else if (weightNum > parseFloat(healthyRange.max)) {
        const lose = (weightNum - parseFloat(healthyRange.max)).toFixed(1);
        weightRecommendation = {
          type: 'lose',
          amount: lose,
          message: `Lose at least ${lose} kg to enter the healthy weight range`,
        };
      } else {
        weightRecommendation = {
          type: 'maintain',
          message: '✅ You are currently in the optimal healthy weight range!',
        };
      }
    }

    const result = {
      bmi: roundedBMI,
      status: category.status,
      color: category.color,
      emoji: category.emoji,
      bg: category.bg,
      tip: category.tip,
      height: heightNum,
      weight: weightNum,
      age: age ? parseInt(age) : null,
      gender,
      bodyFat,
      healthyRange,
      weightRecommendation,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      timestamp: Date.now(),
    };

    setBmiResult(result);
    const newHistory = [result, ...history].slice(0, 20);
    setHistory(newHistory);
    saveHistory(newHistory);
  };

  const clearFields = () => {
    setHeight('');
    setWeight('');
    setAge('');
    setBmiResult(null);
  };

  const deleteHistoryItem = (timestamp) => {
    Alert.alert('Delete Record', 'Remove this BMI record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = history.filter((h) => h.timestamp !== timestamp);
          setHistory(updated);
          await saveHistory(updated);
        },
      },
    ]);
  };

  const clearAllHistory = () => {
    Alert.alert('Clear All History', 'Delete all BMI records?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All',
        style: 'destructive',
        onPress: async () => {
          setHistory([]);
          await userStorage.removeItem('bmiHistory');
        },
      },
    ]);
  };

  const renderBMIScale = () => {
    if (!bmiResult) return null;
    const bmi = bmiResult.bmi;
    const minBMI = 15;
    const maxBMI = 40;
    const clamped = Math.min(Math.max(bmi, minBMI), maxBMI);
    const position = ((clamped - minBMI) / (maxBMI - minBMI)) * 100;

    return (
      <View style={[S.scaleCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={S.scaleHeaderRow}>
          <Text style={[S.scaleTitle, { color: theme.text }]}>📊 Visual BMI Range</Text>
          <View style={[S.scaleValueBadge, { backgroundColor: bmiResult.color }]}>
            <Text style={S.scaleValueBadgeText}>Your BMI: {bmi}</Text>
          </View>
        </View>

        <View style={S.scaleBarContainer}>
          <View style={S.scaleBar}>
            <View style={[S.scaleSegment, { flex: 3.5, backgroundColor: '#3498db' }]} />
            <View style={[S.scaleSegment, { flex: 6.4, backgroundColor: '#00E676' }]} />
            <View style={[S.scaleSegment, { flex: 5.1, backgroundColor: '#FF9800' }]} />
            <View style={[S.scaleSegment, { flex: 10, backgroundColor: '#F44336' }]} />
          </View>

          <View
            style={[
              S.scaleMarker,
              { left: `${Math.min(Math.max(position, 4), 96)}%`, transform: [{ translateX: -14 }] },
            ]}
          >
            <View style={[S.scaleMarkerBubble, { backgroundColor: bmiResult.color }]}>
              <Text style={S.scaleMarkerText}>{bmi}</Text>
            </View>
            <View style={[S.scaleMarkerArrow, { borderTopColor: bmiResult.color }]} />
          </View>
        </View>

        <View style={S.scaleLabels}>
          <Text style={[S.scaleLabelText, { color: theme.textSecondary }]}>15.0</Text>
          <Text style={[S.scaleLabelText, { color: theme.textSecondary }]}>18.5</Text>
          <Text style={[S.scaleLabelText, { color: theme.textSecondary }]}>25.0</Text>
          <Text style={[S.scaleLabelText, { color: theme.textSecondary }]}>30.0</Text>
          <Text style={[S.scaleLabelText, { color: theme.textSecondary }]}>40.0</Text>
        </View>

        <View style={[S.legendContainer, { borderTopColor: theme.borderLight }]}>
          <View style={S.legendItem}>
            <View style={[S.legendDot, { backgroundColor: '#3498db' }]} />
            <Text style={[S.legendText, { color: theme.textSecondary }]}>Under (&lt;18.5)</Text>
          </View>
          <View style={S.legendItem}>
            <View style={[S.legendDot, { backgroundColor: '#00E676' }]} />
            <Text style={[S.legendText, { color: theme.textSecondary }]}>Healthy (18.5-25)</Text>
          </View>
          <View style={S.legendItem}>
            <View style={[S.legendDot, { backgroundColor: '#FF9800' }]} />
            <Text style={[S.legendText, { color: theme.textSecondary }]}>Over (25-30)</Text>
          </View>
          <View style={S.legendItem}>
            <View style={[S.legendDot, { backgroundColor: '#F44336' }]} />
            <Text style={[S.legendText, { color: theme.textSecondary }]}>Obese (30+)</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={[S.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      {/* ═══════════════════════════════════════════════════ */}
      {/* 🌟 HERO BANNER WITH HD IMAGE                        */}
      {/* ═══════════════════════════════════════════════════ */}
      <View style={S.heroWrapper}>
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&q=95&fit=crop' }}
          style={S.heroImageBg}
          imageStyle={S.heroImage}
        >
          <LinearGradient
            colors={[
              'rgba(10,14,26,0.35)',
              isDark ? 'rgba(10,14,26,0.85)' : 'rgba(15,25,50,0.82)',
              isDark ? 'rgba(15,20,25,0.98)' : 'rgba(20,32,64,0.95)',
            ]}
            locations={[0, 0.5, 1]}
            style={S.heroOverlay}
          >
            <View style={S.heroBadge}>
              <Text style={S.heroBadgeText}>⚖️ HEALTH ANALYTICS</Text>
            </View>
            <Text style={S.heroTitle}>Smart BMI Calculator</Text>
            <Text style={S.heroSub}>
              Evaluate your body mass index, body fat %, and discover your optimal weight zone.
            </Text>

            <View style={S.heroChipsRow}>
              <View style={S.heroChip}>
                <Text style={S.heroChipEmoji}>💚</Text>
                <Text style={S.heroChipText}>Optimal: 18.5 – 24.9</Text>
              </View>
              <View style={S.heroChip}>
                <Text style={S.heroChipEmoji}>🔥</Text>
                <Text style={S.heroChipText}>Est. Body Fat</Text>
              </View>
              <View style={S.heroChip}>
                <Text style={S.heroChipEmoji}>🎯</Text>
                <Text style={S.heroChipText}>Ideal Target</Text>
              </View>
            </View>
          </LinearGradient>
        </ImageBackground>
      </View>

      <View style={S.contentWrapper}>
        {/* ═══════════════════════════════════════════════════ */}
        {/* ⚙️ SIMPLE & USER-FRIENDLY INPUT CARD                */}
        {/* ═══════════════════════════════════════════════════ */}
        <View style={[S.inputCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={S.cardHeaderRow}>
            <View>
              <Text style={[S.cardHeading, { color: theme.text }]}>Enter Your Details</Text>
              <Text style={[S.cardSubheading, { color: theme.textSecondary }]}>
                Quick & simple health calculation
              </Text>
            </View>
            {(height !== '' || weight !== '' || age !== '') && (
              <TouchableOpacity
                onPress={clearFields}
                style={[S.quickResetBtn, { backgroundColor: isDark ? '#232936' : '#f1f4f9' }]}
                activeOpacity={0.7}
              >
                <Text style={[S.quickResetText, { color: theme.textSecondary }]}>Reset</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Gender Selector */}
          <Text style={[S.fieldLabel, { color: theme.textSecondary }]}>Gender</Text>
          <View style={S.genderRow}>
            <TouchableOpacity
              style={[
                S.genderButton,
                gender === 'male'
                  ? { backgroundColor: theme.primary, borderColor: theme.primary }
                  : { backgroundColor: theme.cardSecondary, borderColor: theme.border },
              ]}
              onPress={() => setGender('male')}
              activeOpacity={0.8}
            >
              <Text style={S.genderEmoji}>👨</Text>
              <Text
                style={[
                  S.genderText,
                  { color: gender === 'male' ? '#fff' : theme.text },
                ]}
              >
                Male
              </Text>
              {gender === 'male' && <Text style={S.genderCheck}>✓</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                S.genderButton,
                gender === 'female'
                  ? { backgroundColor: '#E056FD', borderColor: '#E056FD' }
                  : { backgroundColor: theme.cardSecondary, borderColor: theme.border },
              ]}
              onPress={() => setGender('female')}
              activeOpacity={0.8}
            >
              <Text style={S.genderEmoji}>👩</Text>
              <Text
                style={[
                  S.genderText,
                  { color: gender === 'female' ? '#fff' : theme.text },
                ]}
              >
                Female
              </Text>
              {gender === 'female' && <Text style={S.genderCheck}>✓</Text>}
            </TouchableOpacity>
          </View>

          {/* Height & Weight 2-Column Row */}
          <View style={S.twoColRow}>
            {/* Height Column */}
            <View style={S.colItem}>
              <Text style={[S.fieldLabel, { color: theme.textSecondary }]}>📏 Height</Text>
              <View
                style={[
                  S.inputBox,
                  { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
                ]}
              >
                <TextInput
                  style={[S.textInputClean, { color: theme.text }]}
                  placeholder="170"
                  placeholderTextColor={theme.inputPlaceholder}
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="numeric"
                  maxLength={3}
                />
                <Text style={[S.inputUnitText, { color: theme.textSecondary }]}>cm</Text>
              </View>
            </View>

            {/* Weight Column */}
            <View style={S.colItem}>
              <Text style={[S.fieldLabel, { color: theme.textSecondary }]}>⚖️ Weight</Text>
              <View
                style={[
                  S.inputBox,
                  { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
                ]}
              >
                <TextInput
                  style={[S.textInputClean, { color: theme.text }]}
                  placeholder="70"
                  placeholderTextColor={theme.inputPlaceholder}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  maxLength={5}
                />
                <Text style={[S.inputUnitText, { color: theme.textSecondary }]}>kg</Text>
              </View>
            </View>
          </View>

          {/* Age (Optional) */}
          <View style={S.fieldGroupSingle}>
            <Text style={[S.fieldLabel, { color: theme.textSecondary }]}>🎂 Age (Optional for body fat %)</Text>
            <View
              style={[
                S.inputBox,
                { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder },
              ]}
            >
              <TextInput
                style={[S.textInputClean, { color: theme.text }]}
                placeholder="e.g. 25"
                placeholderTextColor={theme.inputPlaceholder}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                maxLength={3}
              />
              <Text style={[S.inputUnitText, { color: theme.textSecondary }]}>years</Text>
            </View>
          </View>

          {/* Calculate Button */}
          <TouchableOpacity
            style={S.calculateButton}
            onPress={calculateBMI}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#6C5CE7', '#5B4DD1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={S.calculateGradient}
            >
              <Text style={S.calculateButtonText}>⚡ Calculate BMI</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ═══════════════════════════════════════════════════ */}
        {/* 🏆 BMI RESULT DISPLAY                               */}
        {/* ═══════════════════════════════════════════════════ */}
        {bmiResult && (
          <View style={S.resultSection}>
            <View
              style={[
                S.resultHeroCard,
                {
                  borderColor: bmiResult.color,
                  backgroundColor: bmiResult.bg,
                },
              ]}
            >
              <View style={[S.resultPillBadge, { backgroundColor: bmiResult.color }]}>
                <Text style={S.resultPillBadgeText}>YOUR RESULT</Text>
              </View>

              <Text style={S.resultEmojiBig}>{bmiResult.emoji}</Text>
              <Text style={[S.resultBMINumber, { color: bmiResult.color }]}>
                {bmiResult.bmi}
              </Text>
              <Text style={[S.resultStatusTitle, { color: bmiResult.color }]}>
                {bmiResult.status}
              </Text>

              {/* Stats Ribbon */}
              <View
                style={[
                  S.statsRibbon,
                  {
                    backgroundColor: isDark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.7)',
                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  },
                ]}
              >
                <View style={S.ribbonItem}>
                  <Text style={[S.ribbonLabel, { color: theme.textSecondary }]}>Height</Text>
                  <Text style={[S.ribbonValue, { color: theme.text }]}>{bmiResult.height} <Text style={S.ribbonUnit}>cm</Text></Text>
                </View>
                <View style={[S.ribbonDivider, { backgroundColor: theme.border }]} />
                <View style={S.ribbonItem}>
                  <Text style={[S.ribbonLabel, { color: theme.textSecondary }]}>Weight</Text>
                  <Text style={[S.ribbonValue, { color: theme.text }]}>{bmiResult.weight} <Text style={S.ribbonUnit}>kg</Text></Text>
                </View>
                {bmiResult.bodyFat && (
                  <>
                    <View style={[S.ribbonDivider, { backgroundColor: theme.border }]} />
                    <View style={S.ribbonItem}>
                      <Text style={[S.ribbonLabel, { color: theme.textSecondary }]}>Body Fat</Text>
                      <Text style={[S.ribbonValue, { color: theme.text }]}>{bmiResult.bodyFat}%</Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Visual Gauge Scale */}
            {renderBMIScale()}

            {/* Healthy Weight Range Target */}
            {bmiResult.healthyRange && (
              <View style={[S.healthyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={S.healthyHeader}>
                  <Text style={[S.healthyTitle, { color: theme.text }]}>📏 Ideal Weight Target</Text>
                  <Text style={[S.healthyBadge, { color: theme.primary, backgroundColor: theme.primaryLight }]}>
                    Height: {bmiResult.height}cm
                  </Text>
                </View>

                <View style={S.rangeContainer}>
                  <View
                    style={[
                      S.rangeItem,
                      { backgroundColor: isDark ? '#162130' : '#f0f7ff', borderColor: theme.border },
                    ]}
                  >
                    <Text style={[S.rangeLabel, { color: theme.textSecondary }]}>Minimum Healthy</Text>
                    <Text style={[S.rangeValue, { color: theme.primary }]}>
                      {bmiResult.healthyRange.min} <Text style={S.rangeUnit}>kg</Text>
                    </Text>
                  </View>

                  <View style={S.rangeSeparator}>
                    <Text style={[S.rangeArrowText, { color: theme.textSecondary }]}>↔</Text>
                  </View>

                  <View
                    style={[
                      S.rangeItem,
                      { backgroundColor: isDark ? '#162130' : '#f0f7ff', borderColor: theme.border },
                    ]}
                  >
                    <Text style={[S.rangeLabel, { color: theme.textSecondary }]}>Maximum Healthy</Text>
                    <Text style={[S.rangeValue, { color: theme.primary }]}>
                      {bmiResult.healthyRange.max} <Text style={S.rangeUnit}>kg</Text>
                    </Text>
                  </View>
                </View>

                {bmiResult.weightRecommendation && (
                  <View
                    style={[
                      S.recommendationBox,
                      {
                        backgroundColor: isDark ? '#1e2838' : '#f8fafc',
                        borderLeftColor:
                          bmiResult.weightRecommendation.type === 'maintain'
                            ? '#00E676'
                            : bmiResult.weightRecommendation.type === 'lose'
                            ? '#F44336'
                            : '#FF9800',
                      },
                    ]}
                  >
                    <Text style={[S.recommendationMsg, { color: theme.text }]}>
                      {bmiResult.weightRecommendation.message}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Personalized Advice Tip */}
            <View
              style={[
                S.tipCard,
                {
                  backgroundColor: isDark ? '#262215' : '#fff9e6',
                  borderLeftColor: '#FFC107',
                },
              ]}
            >
              <Text style={[S.tipTitle, { color: theme.text }]}>💡 Personalized Health Tip</Text>
              <Text style={[S.tipText, { color: theme.textSecondary }]}>{bmiResult.tip}</Text>
            </View>
          </View>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* 💡 WHY MEASURE YOUR BMI (HD IMAGE CARD)            */}
        {/* ═══════════════════════════════════════════════════ */}
        {!bmiResult && (
          <View style={S.whyCard}>
            <ImageBackground
              source={{ uri: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1000&q=95&fit=crop' }}
              style={S.whyImageBg}
              imageStyle={{ borderRadius: 20 }}
            >
              <LinearGradient
                colors={['rgba(15,20,30,0.55)', isDark ? 'rgba(15,20,30,0.92)' : 'rgba(20,32,60,0.90)']}
                style={S.whyOverlay}
              >
                <Text style={S.whyTitle}>💡 Why Measure Your BMI?</Text>
                <View style={S.whyList}>
                  <View style={S.whyItemRow}>
                    <Text style={S.whyBullet}>✦</Text>
                    <Text style={S.whyItemText}>
                      <Text style={S.whyBold}>Baseline Indicator:</Text> Quickly assesses weight categories linked to cardiovascular health.
                    </Text>
                  </View>
                  <View style={S.whyItemRow}>
                    <Text style={S.whyBullet}>✦</Text>
                    <Text style={S.whyItemText}>
                      <Text style={S.whyBold}>Goal Guidance:</Text> Identifies the precise kilogram target to achieve your healthiest body.
                    </Text>
                  </View>
                  <View style={S.whyItemRow}>
                    <Text style={S.whyBullet}>✦</Text>
                    <Text style={S.whyItemText}>
                      <Text style={S.whyBold}>Track Progress:</Text> Monitor long-term trends alongside your workouts and nutrition.
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </View>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* 📚 BMI CATEGORIES WITH HD VISUALS                   */}
        {/* ═══════════════════════════════════════════════════ */}
        <View style={S.categorySectionHeader}>
          <Text style={[S.sectionTitle, { color: theme.text }]}>📚 BMI Categories</Text>
          <Text style={[S.sectionSub, { color: theme.textSecondary }]}>World Health Organization Reference</Text>
        </View>

        <View style={S.categoryGrid}>
          {CATEGORY_CARDS.map((cat) => (
            <View
              key={cat.title}
              style={[
                S.categoryCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <ImageBackground
                source={{ uri: cat.image }}
                style={S.catImageBg}
                imageStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
              >
                <LinearGradient
                  colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.75)']}
                  style={S.catImageGradient}
                >
                  <View style={[S.catRangePill, { backgroundColor: cat.color }]}>
                    <Text style={S.catRangePillText}>{cat.range}</Text>
                  </View>
                </LinearGradient>
              </ImageBackground>

              <View style={S.catCardContent}>
                <Text style={[S.catTitle, { color: cat.color }]}>{cat.title}</Text>
                <Text style={[S.catTip, { color: theme.textSecondary }]}>{cat.tip}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ═══════════════════════════════════════════════════ */}
        {/* 📊 HISTORY SECTION                                  */}
        {/* ═══════════════════════════════════════════════════ */}
        {history.length > 0 && (
          <View style={[S.historyCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={S.historyHeader}>
              <View>
                <Text style={[S.historyTitle, { color: theme.text }]}>
                  📜 Recent Records ({history.length})
                </Text>
                <Text style={[S.historySub, { color: theme.textSecondary }]}>
                  Your past BMI logs
                </Text>
              </View>
              <TouchableOpacity onPress={clearAllHistory}>
                <Text style={[S.clearHistoryText, { color: theme.danger }]}>Clear All</Text>
              </TouchableOpacity>
            </View>

            {history.map((item) => (
              <View
                key={item.timestamp}
                style={[S.historyItem, { borderBottomColor: theme.borderLight }]}
              >
                <View style={[S.historyDot, { backgroundColor: item.color }]} />
                <View style={S.historyInfo}>
                  <View style={S.historyRow}>
                    <Text style={[S.historyBMI, { color: theme.text }]}>{item.bmi}</Text>
                    <View style={[S.historyStatusPill, { backgroundColor: item.color + '25' }]}>
                      <Text style={[S.historyStatusText, { color: item.color }]}>{item.status}</Text>
                    </View>
                  </View>
                  <Text style={[S.historyMeta, { color: theme.textSecondary }]}>
                    {item.weight} kg • {item.height} cm • {item.date}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => deleteHistoryItem(item.timestamp)}
                  style={S.historyDelete}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={[S.historyDeleteText, { color: theme.danger }]}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

// ========== DYNAMIC STYLES ==========
const dynamicStyles = (theme, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },

    // 🌟 HERO
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

    // ⚙️ INPUT CARD (Simplified & User-Friendly)
    inputCard: {
      borderRadius: 20,
      padding: 18,
      borderWidth: 1,
      marginBottom: 18,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 5,
    },
    cardHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 14,
    },
    cardHeading: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    cardSubheading: {
      fontSize: 12,
      marginTop: 2,
    },
    quickResetBtn: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
    },
    quickResetText: {
      fontSize: 12,
      fontWeight: '600',
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 6,
    },
    genderRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 14,
    },
    genderButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 11,
      borderRadius: 12,
      borderWidth: 1.5,
      gap: 6,
    },
    genderEmoji: { fontSize: 16 },
    genderText: { fontSize: 13.5, fontWeight: 'bold' },
    genderCheck: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

    twoColRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 14,
    },
    colItem: {
      flex: 1,
    },
    fieldGroupSingle: {
      marginBottom: 16,
    },
    inputBox: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 14,
      height: 48,
    },
    textInputClean: {
      flex: 1,
      height: 48,
      fontSize: 16,
      fontWeight: 'bold',
    },
    inputUnitText: {
      fontSize: 13,
      fontWeight: '600',
      marginLeft: 6,
    },

    calculateButton: {
      borderRadius: 14,
      overflow: 'hidden',
      elevation: 4,
      shadowColor: '#6C5CE7',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
    },
    calculateGradient: {
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    calculateButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },

    // 🏆 RESULT SECTION
    resultSection: {
      marginBottom: 20,
    },
    resultHeroCard: {
      borderRadius: 22,
      padding: 22,
      alignItems: 'center',
      borderWidth: 2,
      marginBottom: 16,
      elevation: 4,
    },
    resultPillBadge: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 20,
      marginBottom: 8,
    },
    resultPillBadgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    resultEmojiBig: {
      fontSize: 48,
      marginBottom: 4,
    },
    resultBMINumber: {
      fontSize: 56,
      fontWeight: '900',
      letterSpacing: -1,
    },
    resultStatusTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      marginTop: 2,
      marginBottom: 14,
    },
    statsRibbon: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 16,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderWidth: 1,
      width: '100%',
      justifyContent: 'space-around',
    },
    ribbonItem: {
      alignItems: 'center',
    },
    ribbonLabel: {
      fontSize: 11,
      fontWeight: '600',
      marginBottom: 2,
    },
    ribbonValue: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    ribbonUnit: {
      fontSize: 11,
      fontWeight: 'normal',
    },
    ribbonDivider: {
      width: 1,
      height: 28,
    },

    // 📊 SCALE
    scaleCard: {
      borderRadius: 20,
      padding: 18,
      borderWidth: 1,
      marginBottom: 16,
      elevation: 2,
    },
    scaleHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 18,
    },
    scaleTitle: {
      fontSize: 15,
      fontWeight: 'bold',
    },
    scaleValueBadge: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 12,
    },
    scaleValueBadgeText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: 'bold',
    },
    scaleBarContainer: {
      position: 'relative',
      paddingTop: 36,
      marginBottom: 8,
    },
    scaleBar: {
      flexDirection: 'row',
      height: 14,
      borderRadius: 7,
      overflow: 'hidden',
    },
    scaleSegment: { height: '100%' },
    scaleMarker: {
      position: 'absolute',
      top: 0,
      alignItems: 'center',
    },
    scaleMarkerBubble: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    scaleMarkerText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: 'bold',
    },
    scaleMarkerArrow: {
      width: 0,
      height: 0,
      borderLeftWidth: 5,
      borderRightWidth: 5,
      borderTopWidth: 6,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
    },
    scaleLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 4,
    },
    scaleLabelText: {
      fontSize: 10,
      fontWeight: '600',
    },
    legendContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      gap: 6,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 4,
    },
    legendText: {
      fontSize: 11,
      fontWeight: '500',
    },

    // 📏 HEALTHY TARGET CARD
    healthyCard: {
      borderRadius: 20,
      padding: 18,
      borderWidth: 1,
      marginBottom: 16,
      elevation: 2,
    },
    healthyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    healthyTitle: {
      fontSize: 15,
      fontWeight: 'bold',
    },
    healthyBadge: {
      fontSize: 11,
      fontWeight: 'bold',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
    },
    rangeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    rangeItem: {
      flex: 1,
      borderRadius: 14,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
    },
    rangeLabel: {
      fontSize: 11,
      marginBottom: 2,
    },
    rangeValue: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    rangeUnit: {
      fontSize: 12,
      fontWeight: 'normal',
    },
    rangeSeparator: {
      paddingHorizontal: 8,
    },
    rangeArrowText: {
      fontSize: 18,
    },
    recommendationBox: {
      marginTop: 14,
      padding: 12,
      borderRadius: 12,
      borderLeftWidth: 4,
    },
    recommendationMsg: {
      fontSize: 13,
      fontWeight: '600',
      lineHeight: 18,
    },

    // 💡 TIP
    tipCard: {
      borderRadius: 18,
      padding: 16,
      borderLeftWidth: 4,
      marginBottom: 16,
    },
    tipTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    tipText: {
      fontSize: 13,
      lineHeight: 18,
    },

    // 💡 WHY CARD
    whyCard: {
      borderRadius: 20,
      overflow: 'hidden',
      marginBottom: 20,
      elevation: 3,
    },
    whyImageBg: {
      borderRadius: 20,
    },
    whyOverlay: {
      padding: 20,
      borderRadius: 20,
    },
    whyTitle: {
      color: '#fff',
      fontSize: 17,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    whyList: {
      gap: 10,
    },
    whyItemRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    whyBullet: {
      color: '#6C5CE7',
      fontSize: 12,
      marginTop: 2,
    },
    whyItemText: {
      flex: 1,
      color: 'rgba(255,255,255,0.9)',
      fontSize: 13,
      lineHeight: 18,
    },
    whyBold: {
      fontWeight: 'bold',
      color: '#fff',
    },

    // 📚 CATEGORY CARDS
    categorySectionHeader: {
      marginBottom: 12,
      marginTop: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    sectionSub: {
      fontSize: 12,
      marginTop: 2,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 20,
    },
    categoryCard: {
      width: (width - 44) / 2,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      elevation: 2,
    },
    catImageBg: {
      height: 90,
    },
    catImageGradient: {
      flex: 1,
      padding: 8,
      justifyContent: 'flex-end',
    },
    catRangePill: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    catRangePillText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: 'bold',
    },
    catCardContent: {
      padding: 10,
    },
    catTitle: {
      fontSize: 13,
      fontWeight: 'bold',
      marginBottom: 3,
    },
    catTip: {
      fontSize: 11,
      lineHeight: 15,
    },

    // 📜 HISTORY
    historyCard: {
      borderRadius: 20,
      padding: 18,
      borderWidth: 1,
      marginBottom: 20,
      elevation: 2,
    },
    historyHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    historyTitle: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    historySub: {
      fontSize: 12,
      marginTop: 2,
    },
    clearHistoryText: {
      fontSize: 12,
      fontWeight: 'bold',
    },
    historyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
    },
    historyDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: 10,
    },
    historyInfo: {
      flex: 1,
    },
    historyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    historyBMI: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    historyStatusPill: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    historyStatusText: {
      fontSize: 11,
      fontWeight: 'bold',
    },
    historyMeta: {
      fontSize: 11,
      marginTop: 4,
    },
    historyDelete: {
      padding: 8,
    },
    historyDeleteText: {
      fontSize: 14,
      fontWeight: 'bold',
    },
  });

export default BMIScreen;