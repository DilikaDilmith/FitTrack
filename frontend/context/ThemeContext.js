import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../utils/theme';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load theme preference
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const saved = await AsyncStorage.getItem('themeMode');
      if (saved === 'dark') {
        setIsDark(true);
      } else if (saved === 'light') {
        setIsDark(false);
      } else {
        // Default: System preference (optional)
        setIsDark(false);
      }
    } catch (error) {
      console.log('❌ Load theme error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newValue = !isDark;
    setIsDark(newValue);
    await AsyncStorage.setItem('themeMode', newValue ? 'dark' : 'light');
  };

  const setTheme = async (mode) => {
    const isDarkMode = mode === 'dark';
    setIsDark(isDarkMode);
    await AsyncStorage.setItem('themeMode', mode);
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        loading,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};