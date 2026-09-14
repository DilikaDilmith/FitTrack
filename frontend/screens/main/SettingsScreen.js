import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Linking,
  Image,
} from 'react-native';
import Alert from '../../components/FitAlert';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { SAFE_TOP_PADDING } from '../../utils/theme';
import { userStorage } from '../../utils/userStorage';

const SettingsScreen = ({ navigation }) => {
  const { theme, isDark, toggleTheme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  const [weightUnit, setWeightUnit] = useState('kg');
  const [heightUnit, setHeightUnit] = useState('cm');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const weight = await userStorage.getItem('weightUnit');
      const height = await userStorage.getItem('heightUnit');
      const notif = await userStorage.getItem('notificationsEnabled');
      const haptic = await userStorage.getItem('hapticFeedback');
      const lang = await userStorage.getItem('language');

      if (weight) setWeightUnit(weight);
      if (height) setHeightUnit(height);
      if (notif !== null) setNotificationsEnabled(notif === 'true');
      if (haptic !== null) setHapticFeedback(haptic === 'true');
      if (lang) setLanguage(lang);
    } catch (error) {
      console.log('❌ Load prefs error:', error);
    }
  };

  const updatePreference = async (key, value) => {
    try {
      await userStorage.setItem(key, value.toString());
    } catch (error) {
      console.log('❌ Save pref error:', error);
    }
  };

  const handleWeightUnit = async (unit) => {
    setWeightUnit(unit);
    await updatePreference('weightUnit', unit);
  };

  const handleHeightUnit = async (unit) => {
    setHeightUnit(unit);
    await updatePreference('heightUnit', unit);
  };

  const handleNotifications = async (value) => {
    setNotificationsEnabled(value);
    await updatePreference('notificationsEnabled', value);
  };

  const handleHaptic = async (value) => {
    setHapticFeedback(value);
    await updatePreference('hapticFeedback', value);
  };

  const handleLanguage = async (lang) => {
    setLanguage(lang);
    await updatePreference('language', lang);
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

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all your local data (workout history, custom exercises, plans). Your account data will remain safe.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              const keysToKeep = ['token', 'themeMode'];
              const allKeys = await AsyncStorage.getAllKeys();
              const keysToRemove = allKeys.filter(
                (k) => !keysToKeep.includes(k)
              );
              await AsyncStorage.multiRemove(keysToRemove);
              Alert.alert('✅ Cleared', 'All local data has been removed.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  // Get initials from user name
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if user has profile picture
  const hasProfilePic = !!user?.profilePicture;

  // ========== RENDER SECTION ==========
  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        {title}
      </Text>
      <View
        style={[
          styles.sectionContent,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
      >
        {children}
      </View>
    </View>
  );

  const SettingRow = ({
    icon,
    title,
    subtitle,
    right,
    onPress,
    danger,
    last,
  }) => (
    <TouchableOpacity
      style={[
        styles.settingRow,
        !last && { borderBottomWidth: 1, borderBottomColor: theme.borderLight },
      ]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingTextContainer}>
          <Text
            style={[
              styles.settingTitle,
              { color: danger ? theme.danger : theme.text },
            ]}
          >
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {right || (onPress && <Text style={[styles.arrow, { color: theme.textSecondary }]}>›</Text>)}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          ⚙️ Settings
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Customize your experience
        </Text>
      </View>

      {/* 👤 User Card - CLICKABLE → Navigate to Profile */}
      <TouchableOpacity
        style={[
          styles.userCard,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
        onPress={() => navigation.navigate('Profile')}
        activeOpacity={0.7}
      >
        {/* Avatar - Image හෝ Initials */}
        {hasProfilePic ? (
          <Image
            source={{ uri: user.profilePicture }}
            style={styles.userAvatarImage}
          />
        ) : (
          <View
            style={[styles.userAvatar, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.userAvatarText}>{getInitials(user?.name)}</Text>
          </View>
        )}

        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.text }]}>
            {user?.name || 'User'}
          </Text>
          <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
            {user?.email || 'user@email.com'}
          </Text>
          <View style={styles.viewProfileRow}>
            <Text style={[styles.viewProfileText, { color: theme.primary }]}>
              View Profile
            </Text>
            <Text style={[styles.viewProfileArrow, { color: theme.primary }]}>
              →
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* APPEARANCE */}
      <SettingSection title="APPEARANCE">
        <SettingRow
          icon="🌙"
          title="Dark Mode"
          subtitle={isDark ? 'On' : 'Off'}
          right={
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#ccc', true: theme.primary }}
              thumbColor={isDark ? '#fff' : '#f4f3f4'}
            />
          }
        />
        <SettingRow
          icon="🎨"
          title="Theme"
          subtitle={isDark ? 'Dark' : 'Light'}
          right={
            <View style={styles.themeToggle}>
              <TouchableOpacity
                style={[
                  styles.themeButton,
                  !isDark && { backgroundColor: theme.primary },
                ]}
                onPress={() => setTheme('light')}
              >
                <Text
                  style={[
                    styles.themeButtonText,
                    !isDark && { color: '#fff' },
                  ]}
                >
                  ☀️
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.themeButton,
                  isDark && { backgroundColor: theme.primary },
                ]}
                onPress={() => setTheme('dark')}
              >
                <Text
                  style={[styles.themeButtonText, isDark && { color: '#fff' }]}
                >
                  🌙
                </Text>
              </TouchableOpacity>
            </View>
          }
          last
        />
      </SettingSection>

      {/* UNITS */}
      <SettingSection title="UNITS">
        <SettingRow
          icon="⚖️"
          title="Weight Unit"
          subtitle={weightUnit === 'kg' ? 'Kilograms' : 'Pounds'}
          right={
            <View style={styles.unitToggle}>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  weightUnit === 'kg' && {
                    backgroundColor: theme.primary,
                  },
                ]}
                onPress={() => handleWeightUnit('kg')}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    { color: weightUnit === 'kg' ? '#fff' : theme.text },
                  ]}
                >
                  kg
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  weightUnit === 'lbs' && {
                    backgroundColor: theme.primary,
                  },
                ]}
                onPress={() => handleWeightUnit('lbs')}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    { color: weightUnit === 'lbs' ? '#fff' : theme.text },
                  ]}
                >
                  lbs
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
        <SettingRow
          icon="📏"
          title="Height Unit"
          subtitle={heightUnit === 'cm' ? 'Centimeters' : 'Feet/Inches'}
          right={
            <View style={styles.unitToggle}>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  heightUnit === 'cm' && {
                    backgroundColor: theme.primary,
                  },
                ]}
                onPress={() => handleHeightUnit('cm')}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    { color: heightUnit === 'cm' ? '#fff' : theme.text },
                  ]}
                >
                  cm
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  heightUnit === 'ft' && {
                    backgroundColor: theme.primary,
                  },
                ]}
                onPress={() => handleHeightUnit('ft')}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    { color: heightUnit === 'ft' ? '#fff' : theme.text },
                  ]}
                >
                  ft
                </Text>
              </TouchableOpacity>
            </View>
          }
          last
        />
      </SettingSection>

      {/* NOTIFICATIONS */}
      <SettingSection title="NOTIFICATIONS">
        <SettingRow
          icon="🔔"
          title="Enable Notifications"
          subtitle="Water reminders, workout alerts"
          right={
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotifications}
              trackColor={{ false: '#ccc', true: theme.primary }}
              thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
            />
          }
        />
        <SettingRow
          icon="📳"
          title="Haptic Feedback"
          subtitle="Vibrate on button taps"
          right={
            <Switch
              value={hapticFeedback}
              onValueChange={handleHaptic}
              trackColor={{ false: '#ccc', true: theme.primary }}
              thumbColor={hapticFeedback ? '#fff' : '#f4f3f4'}
            />
          }
          last
        />
      </SettingSection>

      {/* LANGUAGE */}
      <SettingSection title="LANGUAGE">
        <SettingRow
          icon="🌍"
          title="App Language"
          subtitle={
            language === 'en'
              ? 'English'
              : language === 'si'
              ? 'සිංහල'
              : 'தமிழ்'
          }
          right={
            <View style={styles.langToggle}>
              {['en', 'si', 'ta'].map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.langButton,
                    language === lang && {
                      backgroundColor: theme.primary,
                    },
                  ]}
                  onPress={() => handleLanguage(lang)}
                >
                  <Text
                    style={[
                      styles.langButtonText,
                      { color: language === lang ? '#fff' : theme.text },
                    ]}
                  >
                    {lang === 'en' ? 'EN' : lang === 'si' ? 'සි' : 'த'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          }
          last
        />
      </SettingSection>

      {/* DATA */}
      <SettingSection title="DATA">
        <SettingRow
          icon="🗑️"
          title="Clear Local Data"
          subtitle="Remove workout history, plans"
          onPress={handleClearData}
          danger
          last
        />
      </SettingSection>

      {/* ABOUT */}
      <SettingSection title="ABOUT">
        <SettingRow
          icon="📱"
          title="App Version"
          subtitle="1.0.0"
          right={
            <Text style={[styles.versionBadge, { color: theme.textSecondary }]}>
              Latest
            </Text>
          }
        />
        <SettingRow
          icon="📄"
          title="Privacy Policy"
          onPress={() =>
            Alert.alert(
              'Privacy Policy',
              'Your data is stored securely. We do not share your personal information with third parties.'
            )
          }
        />
        <SettingRow
          icon="📧"
          title="Contact Support"
          subtitle="support@fittrack.app"
          onPress={() => Linking.openURL('mailto:support@fittrack.app')}
        />
        <SettingRow
          icon="⭐"
          title="Rate Us"
          subtitle="Enjoying the app? Rate us!"
          onPress={() =>
            Alert.alert('Thank You!', 'Rating feature coming soon!')
          }
          last
        />
      </SettingSection>

      {/* Logout Button */}
      <TouchableOpacity
        style={[
          styles.logoutButton,
          {
            backgroundColor: isDark ? '#3a1a1a' : '#fff5f5',
            borderColor: theme.danger,
          },
        ]}
        onPress={handleLogout}
      >
        <Text style={[styles.logoutButtonText, { color: theme.danger }]}>
          🚪 Logout
        </Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          Made with 💪 by FitTrack
        </Text>
        <Text style={[styles.footerSubtext, { color: theme.textLight }]}>
          © 2026 All rights reserved
        </Text>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: SAFE_TOP_PADDING,
    marginBottom: 16,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 16, marginTop: 4 },

  // 👤 User Card (Clickable)
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  userAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  userAvatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userAvatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 18, fontWeight: 'bold' },
  userEmail: { fontSize: 13, marginTop: 2 },
  viewProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  viewProfileText: {
    fontSize: 13,
    fontWeight: '600',
  },
  viewProfileArrow: {
    fontSize: 16,
    marginLeft: 4,
    fontWeight: 'bold',
  },

  // Section
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionContent: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },

  // Setting Row
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: { fontSize: 22, marginRight: 14 },
  settingTextContainer: { flex: 1 },
  settingTitle: { fontSize: 15, fontWeight: '600' },
  settingSubtitle: { fontSize: 12, marginTop: 2 },
  arrow: { fontSize: 24, fontWeight: '300' },

  // Theme Toggle
  themeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20,
    padding: 3,
    gap: 2,
  },
  themeButton: {
    width: 36,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeButtonText: { fontSize: 16 },

  // Unit Toggle
  unitToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  unitButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  unitButtonText: { fontSize: 12, fontWeight: '600' },

  // Language Toggle
  langToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10,
    padding: 3,
    gap: 2,
  },
  langButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 32,
    alignItems: 'center',
  },
  langButtonText: { fontSize: 12, fontWeight: 'bold' },

  versionBadge: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Logout
  logoutButton: {
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: { fontSize: 13, fontWeight: '600' },
  footerSubtext: { fontSize: 11, marginTop: 4 },
});

export default SettingsScreen;