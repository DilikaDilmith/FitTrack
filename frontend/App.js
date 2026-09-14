import React, { useState, useEffect } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import AuthNavigator from './navigation/AuthNavigator';
import BottomTabs from './navigation/BottomTabs';
import SplashScreen from './screens/SplashScreen';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

import FitAlert, { installFitAlert } from './components/FitAlert';

// Automatically upgrade all NativeAlert.alert calls across the app to matching theme FitAlert
installFitAlert();

function AppContent() {
  const { isLoggedIn, loading: authLoading } = useAuth();
  const { theme, isDark, loading: themeLoading } = useTheme();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.background,
      card: theme.card,
      text: theme.text,
      border: theme.border,
      primary: theme.primary,
    },
  };

  if (showSplash) return <SplashScreen />;

  if (authLoading || themeLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <>
      <NavigationContainer theme={navTheme}>
        {isLoggedIn ? <BottomTabs /> : <AuthNavigator />}
      </NavigationContainer>
      <FitAlert />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});