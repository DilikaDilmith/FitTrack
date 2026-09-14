import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import Alert from '../../components/FitAlert';
import { useFocusEffect } from '@react-navigation/native';
import { userStorage } from '../../utils/userStorage';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';
import { SAFE_TOP_PADDING } from '../../utils/theme';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateUser } = useAuth();
  const { theme, isDark } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [fitnessGoal, setFitnessGoal] = useState('Maintain Weight');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [stats, setStats] = useState({
    workouts: 0,
    water: 0,
    calories: 0,
    bmi: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);

  const S = dynamicStyles(theme, isDark);

  const goals = ['Lose Weight', 'Maintain Weight', 'Gain Muscle'];

  useEffect(() => {
    if (user) {
      setAge(user.age?.toString() || '');
      setHeight(user.height?.toString() || '');
      setWeight(user.weight?.toString() || '');
      setFitnessGoal(user.fitnessGoal || 'Maintain Weight');
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      setStatsLoading(true);

      const workoutsRes = await api.get('/workouts');
      const workoutsCount = workoutsRes.data.length;

      const waterData = await userStorage.getItem('waterGlasses');
      const waterCount = parseInt(waterData) || 0;

      let caloriesTotal = 0;
      try {
        const foodsRes = await api.get('/foods/today');
        caloriesTotal = foodsRes.data.reduce((sum, f) => sum + f.calories, 0);
      } catch (error) {
        console.log('❌ Calories stats error:', error.message);
      }

      let latestBMI = 0;
      try {
        const bmiHistory = await userStorage.getItem('bmiHistory');
        if (bmiHistory) {
          const history = JSON.parse(bmiHistory);
          if (history.length > 0) {
            latestBMI = history[0].bmi;
          }
        }
      } catch (error) {
        console.log('❌ BMI stats error:', error.message);
      }

      setStats({
        workouts: workoutsCount,
        water: waterCount,
        calories: caloriesTotal,
        bmi: latestBMI,
      });
    } catch (error) {
      console.log('❌ Load stats error:', error.message);
    } finally {
      setStatsLoading(false);
    }
  };

  // ========== IMAGE PICKER ==========
  const pickImage = async () => {
    try {
      // Permissions ඉල්ලන්න
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Please allow access to your photo library to change the profile picture.'
        );
        return;
      }

      // Image Picker Open කරන්න
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      console.log('❌ Image picker error:', error.message);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // ========== CAMERA ==========
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Please allow camera access to take a photo.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      console.log('❌ Camera error:', error.message);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  // ========== UPLOAD IMAGE ==========
  const uploadImage = async (asset) => {
    setUploadingImage(true);

    try {
      const formData = new FormData();

      // File name එක හදන්න
      const uriParts = asset.uri.split('/');
      const fileName = uriParts[uriParts.length - 1];
      const fileType = asset.mimeType || 'image/jpeg';

      formData.append('avatar', {
        uri: asset.uri,
        name: fileName,
        type: fileType,
      });

      console.log('📤 Uploading image...');

      const response = await api.post('/auth/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        transformRequest: (data) => data,
      });

      console.log('✅ Upload response:', response.data);

      // AuthContext Update කරන්න
      if (response.data.user) {
        updateUser(response.data.user);
      }

      Alert.alert('✅ Success', 'Profile picture updated!');
    } catch (error) {
      console.log('❌ Upload error:', error.message);
      console.log('❌ Error response:', error.response?.data);
      Alert.alert(
        'Upload Failed',
        error.response?.data?.error || 'Failed to upload image'
      );
    } finally {
      setUploadingImage(false);
    }
  };

  // ========== SHOW IMAGE OPTIONS ==========
  const showImageOptions = () => {
    Alert.alert(
      'Profile Picture',
      'Choose an option',
      [
        { text: '📷 Take Photo', onPress: takePhoto },
        { text: '🖼️ Choose from Gallery', onPress: pickImage },
        ...(user?.profilePicture
          ? [
              {
                text: '🗑️ Remove Photo',
                style: 'destructive',
                onPress: removeProfilePicture,
              },
            ]
          : []),
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  // ========== REMOVE PROFILE PICTURE ==========
  const removeProfilePicture = async () => {
    Alert.alert('Remove Photo', 'Delete your profile picture?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          setUploadingImage(true);
          try {
            const response = await api.delete('/auth/avatar');
            if (response.data.user) {
              updateUser(response.data.user);
            }
            Alert.alert('✅ Removed', 'Profile picture removed');
          } catch (error) {
            Alert.alert('Error', 'Failed to remove picture');
          } finally {
            setUploadingImage(false);
          }
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const handleSaveProfile = async () => {
    if (age && (parseInt(age) < 10 || parseInt(age) > 120)) {
      Alert.alert('Error', 'Age must be between 10 and 120');
      return;
    }
    if (height && (parseFloat(height) < 50 || parseFloat(height) > 250)) {
      Alert.alert('Error', 'Height must be between 50 and 250 cm');
      return;
    }
    if (weight && (parseFloat(weight) < 20 || parseFloat(weight) > 300)) {
      Alert.alert('Error', 'Weight must be between 20 and 300 kg');
      return;
    }

    setSubmitting(true);
    try {
      const updateData = {};
      if (age) updateData.age = parseInt(age);
      if (height) updateData.height = parseFloat(height);
      if (weight) updateData.weight = parseFloat(weight);
      updateData.fitnessGoal = fitnessGoal;

      const response = await api.put('/auth/profile', updateData);

      if (response.data.user) {
        updateUser(response.data.user);
      }

      Alert.alert('✅ Success', 'Profile updated successfully!');
      setModalVisible(false);
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to update profile'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = () => {
    setAge(user?.age?.toString() || '');
    setHeight(user?.height?.toString() || '');
    setWeight(user?.weight?.toString() || '');
    setFitnessGoal(user?.fitnessGoal || 'Maintain Weight');
    setModalVisible(true);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getGoalEmoji = (goal) => {
    switch (goal) {
      case 'Lose Weight': return '🔥';
      case 'Gain Muscle': return '💪';
      default: return '⚖️';
    }
  };

  const getBMIColor = (bmi) => {
    if (!bmi || bmi === 0) return theme.textSecondary;
    if (bmi < 18.5) return '#e67e22';
    if (bmi < 25) return '#27ae60';
    if (bmi < 30) return '#e67e22';
    return '#e74c3c';
  };

  const getBMILabel = (bmi) => {
    if (!bmi || bmi === 0) return 'N/A';
    if (bmi < 18.5) return 'Under';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Over';
    return 'Obese';
  };

  return (
    <ScrollView
      style={[S.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top Bar with Back Button */}
      <View style={[S.topBar, { backgroundColor: theme.card }]}>
        <TouchableOpacity
          style={[S.backBtn, { backgroundColor: isDark ? '#2a3a4a' : '#f1f4f9' }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[S.backBtnText, { color: theme.text }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[S.topBarTitle, { color: theme.text }]}>👤 Profile</Text>
        <View style={{ width: 64 }} />
      </View>

      {/* Profile Header */}
      <View
        style={[
          S.profileHeader,
          { backgroundColor: theme.card, borderBottomColor: theme.border },
        ]}
      >
        {/* ⭐ Avatar with Image Support */}
        <TouchableOpacity
          onPress={showImageOptions}
          activeOpacity={0.8}
          disabled={uploadingImage}
        >
          <View style={S.avatarWrapper}>
            {user?.profilePicture ? (
              <Image
                source={{ uri: user.profilePicture }}
                style={S.avatarImage}
              />
            ) : (
              <View
                style={[
                  S.avatarContainer,
                  {
                    backgroundColor: theme.primary,
                    borderColor: isDark ? '#2a3a4a' : '#e8f4fd',
                  },
                ]}
              >
                <Text style={S.avatarText}>{getInitials(user?.name)}</Text>
              </View>
            )}

            {/* Loading Indicator */}
            {uploadingImage && (
              <View style={S.avatarLoading}>
                <ActivityIndicator color="#fff" size="large" />
              </View>
            )}

            {/* Camera Button */}
            <View
              style={[
                S.cameraButton,
                { backgroundColor: theme.primary, borderColor: theme.card },
              ]}
            >
              <Text style={S.cameraIcon}>📷</Text>
            </View>
          </View>
        </TouchableOpacity>

        <Text style={[S.userName, { color: theme.text }]}>
          {user?.name || 'User'}
        </Text>
        <Text style={[S.userEmail, { color: theme.textSecondary }]}>
          {user?.email || 'user@email.com'}
        </Text>

        {/* Photo Hint */}
        <TouchableOpacity onPress={showImageOptions}>
          <Text style={[S.photoHint, { color: theme.primary }]}>
            {user?.profilePicture ? '📷 Change Photo' : '📷 Add Photo'}
          </Text>
        </TouchableOpacity>

        <View style={[S.goalBadge, { backgroundColor: theme.primaryLight }]}>
          <Text style={[S.goalBadgeText, { color: theme.primary }]}>
            {getGoalEmoji(user?.fitnessGoal)} {user?.fitnessGoal || 'No Goal Set'}
          </Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={S.sectionContainer}>
        <Text style={[S.sectionTitle, { color: theme.text }]}>
          📊 Your Stats
        </Text>
      </View>

      <View style={S.statsGrid}>
        {statsLoading ? (
          <View style={[S.statsLoadingCard, { backgroundColor: theme.card }]}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={[S.statsLoadingText, { color: theme.textSecondary }]}>
              Loading stats...
            </Text>
          </View>
        ) : (
          <>
            <View
              style={[
                S.statCard,
                {
                  backgroundColor: theme.card,
                  borderLeftColor: '#e74c3c',
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={S.statEmoji}>🏋️</Text>
              <Text style={[S.statValue, { color: theme.text }]}>
                {stats.workouts}
              </Text>
              <Text style={[S.statLabel, { color: theme.textSecondary }]}>
                Workouts
              </Text>
            </View>

            <View
              style={[
                S.statCard,
                {
                  backgroundColor: theme.card,
                  borderLeftColor: '#1abc9c',
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={S.statEmoji}>💧</Text>
              <Text style={[S.statValue, { color: theme.text }]}>
                {stats.water}
              </Text>
              <Text style={[S.statLabel, { color: theme.textSecondary }]}>
                Water Today
              </Text>
            </View>

            <View
              style={[
                S.statCard,
                {
                  backgroundColor: theme.card,
                  borderLeftColor: '#f39c12',
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={S.statEmoji}>🍔</Text>
              <Text style={[S.statValue, { color: theme.text }]}>
                {stats.calories}
              </Text>
              <Text style={[S.statLabel, { color: theme.textSecondary }]}>
                kcal Today
              </Text>
            </View>

            <View
              style={[
                S.statCard,
                {
                  backgroundColor: theme.card,
                  borderLeftColor: getBMIColor(stats.bmi),
                  borderColor: theme.border,
                },
              ]}
            >
              <Text style={S.statEmoji}>⚖️</Text>
              <Text style={[S.statValue, { color: getBMIColor(stats.bmi) }]}>
                {stats.bmi > 0 ? stats.bmi : '—'}
              </Text>
              <Text style={[S.statLabel, { color: theme.textSecondary }]}>
                BMI • {getBMILabel(stats.bmi)}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Personal Info */}
      <View style={S.sectionContainer}>
        <Text style={[S.sectionTitle, { color: theme.text }]}>
          👤 Personal Info
        </Text>
      </View>

      <View
        style={[
          S.infoCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        <View style={[S.infoRow, { borderBottomColor: theme.borderLight }]}>
          <View style={S.infoLeft}>
            <Text style={S.infoIcon}>🎂</Text>
            <Text style={[S.infoLabel, { color: theme.textSecondary }]}>
              Age
            </Text>
          </View>
          <Text style={[S.infoValue, { color: theme.text }]}>
            {user?.age ? `${user.age} years` : 'Not set'}
          </Text>
        </View>

        <View style={[S.infoRow, { borderBottomColor: theme.borderLight }]}>
          <View style={S.infoLeft}>
            <Text style={S.infoIcon}>📏</Text>
            <Text style={[S.infoLabel, { color: theme.textSecondary }]}>
              Height
            </Text>
          </View>
          <Text style={[S.infoValue, { color: theme.text }]}>
            {user?.height ? `${user.height} cm` : 'Not set'}
          </Text>
        </View>

        <View style={[S.infoRow, { borderBottomColor: theme.borderLight }]}>
          <View style={S.infoLeft}>
            <Text style={S.infoIcon}>⚖️</Text>
            <Text style={[S.infoLabel, { color: theme.textSecondary }]}>
              Weight
            </Text>
          </View>
          <Text style={[S.infoValue, { color: theme.text }]}>
            {user?.weight ? `${user.weight} kg` : 'Not set'}
          </Text>
        </View>

        <View style={[S.infoRow, { borderBottomWidth: 0 }]}>
          <View style={S.infoLeft}>
            <Text style={S.infoIcon}>{getGoalEmoji(user?.fitnessGoal)}</Text>
            <Text style={[S.infoLabel, { color: theme.textSecondary }]}>
              Goal
            </Text>
          </View>
          <Text style={[S.infoValue, { color: theme.text }]}>
            {user?.fitnessGoal || 'Not set'}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={S.sectionContainer}>
        <Text style={[S.sectionTitle, { color: theme.text }]}>
          ⚡ Actions
        </Text>
      </View>

      <TouchableOpacity
        style={[
          S.actionButton,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
        onPress={openEditModal}
      >
        <Text style={S.actionIcon}>✏️</Text>
        <View style={{ flex: 1 }}>
          <Text style={[S.actionTitle, { color: theme.text }]}>
            Edit Profile
          </Text>
          <Text style={[S.actionSubtitle, { color: theme.textSecondary }]}>
            Update your personal info
          </Text>
        </View>
        <Text style={[S.actionArrow, { color: theme.textSecondary }]}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          S.actionButton,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={S.actionIcon}>⚙️</Text>
        <View style={{ flex: 1 }}>
          <Text style={[S.actionTitle, { color: theme.text }]}>Settings</Text>
          <Text style={[S.actionSubtitle, { color: theme.textSecondary }]}>
            Dark mode, units, notifications
          </Text>
        </View>
        <Text style={[S.actionArrow, { color: theme.textSecondary }]}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          S.actionButton,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
        onPress={() => navigation.navigate('Progress')}
      >
        <Text style={S.actionIcon}>📊</Text>
        <View style={{ flex: 1 }}>
          <Text style={[S.actionTitle, { color: theme.text }]}>
            View Progress
          </Text>
          <Text style={[S.actionSubtitle, { color: theme.textSecondary }]}>
            Charts and achievements
          </Text>
        </View>
        <Text style={[S.actionArrow, { color: theme.textSecondary }]}>›</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        style={[
          S.logoutButton,
          {
            backgroundColor: isDark ? '#3a1a1a' : '#fff5f5',
            borderColor: theme.danger,
          },
        ]}
        onPress={handleLogout}
      >
        <Text style={[S.logoutButtonText, { color: theme.danger }]}>
          🚪 Logout
        </Text>
      </TouchableOpacity>

      <View style={S.footer}>
        <Text style={[S.footerText, { color: theme.textSecondary }]}>
          FitTrack v1.0.0
        </Text>
        <Text style={[S.footerSubtext, { color: theme.textLight }]}>
          Made with 💪 for fitness lovers
        </Text>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={S.modalOverlay}>
          <ScrollView contentContainerStyle={S.modalScrollContent}>
            <View style={[S.modalContent, { backgroundColor: theme.card }]}>
              <View style={S.modalHeader}>
                <Text style={[S.modalTitle, { color: theme.text }]}>
                  Edit Profile
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  disabled={submitting}
                >
                  <Text style={[S.modalClose, { color: theme.textSecondary }]}>
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={[S.modalLabel, { color: theme.text }]}>Age</Text>
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
                placeholder="e.g., 20"
                placeholderTextColor={theme.inputPlaceholder}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                editable={!submitting}
              />

              <Text style={[S.modalLabel, { color: theme.text }]}>
                Height (cm)
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
                placeholder="e.g., 170"
                placeholderTextColor={theme.inputPlaceholder}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                editable={!submitting}
              />

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
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                editable={!submitting}
              />

              <Text style={[S.modalLabel, { color: theme.text }]}>
                Fitness Goal
              </Text>
              <View style={S.goalsContainer}>
                {goals.map((goal) => (
                  <TouchableOpacity
                    key={goal}
                    style={[
                      S.goalButton,
                      {
                        backgroundColor:
                          fitnessGoal === goal
                            ? theme.primary
                            : theme.cardSecondary,
                      },
                    ]}
                    onPress={() => setFitnessGoal(goal)}
                    disabled={submitting}
                  >
                    <Text
                      style={[
                        S.goalText,
                        {
                          color: fitnessGoal === goal ? '#fff' : theme.text,
                        },
                      ]}
                    >
                      {getGoalEmoji(goal)} {goal}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  S.modalButton,
                  {
                    backgroundColor: theme.success,
                    opacity: submitting ? 0.6 : 1,
                  },
                ]}
                onPress={handleSaveProfile}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={S.modalButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
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

    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: SAFE_TOP_PADDING,
      paddingBottom: 10,
    },
    backBtn: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 10,
    },
    backBtnText: {
      fontSize: 14,
      fontWeight: '600',
    },
    topBarTitle: {
      fontSize: 18,
      fontWeight: 'bold',
    },

    profileHeader: {
      alignItems: 'center',
      paddingTop: 12,
      paddingBottom: 24,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
    },

    // ⭐ Avatar Styles
    avatarWrapper: {
      position: 'relative',
      marginBottom: 14,
    },
    avatarContainer: {
      width: 110,
      height: 110,
      borderRadius: 55,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    avatarImage: {
      width: 110,
      height: 110,
      borderRadius: 55,
      borderWidth: 4,
      borderColor: isDark ? '#2a3a4a' : '#e8f4fd',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
    },
    avatarText: {
      fontSize: 44,
      fontWeight: 'bold',
      color: '#fff',
    },
    avatarLoading: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 55,
      backgroundColor: 'rgba(0,0,0,0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cameraButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
    },
    cameraIcon: {
      fontSize: 16,
    },

    userName: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    userEmail: { fontSize: 14, marginBottom: 8 },
    photoHint: {
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 10,
    },
    goalBadge: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 20,
    },
    goalBadgeText: { fontSize: 13, fontWeight: '600' },

    sectionContainer: {
      paddingHorizontal: 20,
      marginTop: 20,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      letterSpacing: 0.5,
    },

    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 20,
      gap: 10,
    },
    statsLoadingCard: {
      width: '100%',
      paddingVertical: 30,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statsLoadingText: { marginTop: 8, fontSize: 13 },
    statCard: {
      width: (width - 50) / 2,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderLeftWidth: 4,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 3,
    },
    statEmoji: { fontSize: 26, marginBottom: 6 },
    statValue: { fontSize: 22, fontWeight: 'bold' },
    statLabel: { fontSize: 11, marginTop: 4, textAlign: 'center' },

    infoCard: {
      marginHorizontal: 20,
      borderRadius: 16,
      borderWidth: 1,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 3,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
    },
    infoLeft: { flexDirection: 'row', alignItems: 'center' },
    infoIcon: { fontSize: 20, marginRight: 12 },
    infoLabel: { fontSize: 14 },
    infoValue: { fontSize: 15, fontWeight: '600' },

    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 20,
      marginBottom: 10,
      padding: 16,
      borderRadius: 14,
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
      elevation: 2,
    },
    actionIcon: { fontSize: 24, marginRight: 14 },
    actionTitle: { fontSize: 15, fontWeight: '600' },
    actionSubtitle: { fontSize: 12, marginTop: 2 },
    actionArrow: { fontSize: 24, fontWeight: '300' },

    logoutButton: {
      marginHorizontal: 20,
      marginTop: 20,
      paddingVertical: 16,
      borderRadius: 14,
      borderWidth: 2,
      alignItems: 'center',
    },
    logoutButtonText: { fontSize: 16, fontWeight: 'bold' },

    footer: { alignItems: 'center', marginTop: 30 },
    footerText: { fontSize: 13, fontWeight: '600' },
    footerSubtext: { fontSize: 11, marginTop: 4 },

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalScrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingVertical: 40,
    },
    modalContent: {
      borderRadius: 20,
      padding: 24,
      marginHorizontal: 20,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold' },
    modalClose: { fontSize: 22 },
    modalLabel: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
      marginTop: 8,
    },
    modalInput: {
      borderRadius: 10,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
    },
    goalsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
      marginTop: 4,
    },
    goalButton: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
      marginRight: 4,
      marginBottom: 4,
    },
    goalText: { fontSize: 13, fontWeight: '600' },
    modalButton: {
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 10,
    },
    modalButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  });

export default ProfileScreen;