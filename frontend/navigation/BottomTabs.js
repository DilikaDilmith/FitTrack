import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import CenterFAB from '../components/CenterFAB';

import HomeScreen from '../screens/main/HomeScreen';
import WorkoutScreen from '../screens/main/WorkoutScreen';
import CaloriesScreen from '../screens/main/CaloriesScreen';
import WaterScreen from '../screens/main/WaterScreen';
import ProgressScreen from '../screens/main/ProgressScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import BMIScreen from '../screens/main/BMIScreen';
import WorkoutHistoryScreen from '../screens/main/WorkoutHistoryScreen';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const { theme, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          let size = 24;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Workout') {
            iconName = focused ? 'barbell' : 'barbell-outline';
          } else if (route.name === 'Progress') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.tabBarActive,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarStyle: {
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: isDark ? '#1A1F2E' : '#FFFFFF',
          borderTopColor: theme.border,
          borderTopWidth: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        headerStyle: {
          backgroundColor: theme.card,
          borderBottomColor: theme.border,
          borderBottomWidth: 1,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="Workout"
        component={WorkoutScreen}
        options={{ headerShown: false }}
      />

      {/* ⭐ CENTER FAB - Navigation එකට නොපෙනේ */}
      <Tab.Screen
        name="AddAction"
        component={View}
        options={{
          tabBarButton: () => <CenterFAB />,
          headerShown: false,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
          },
        }}
      />

      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ headerShown: false }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />

      {/* ============ HIDDEN SCREENS ============ */}
      <Tab.Screen
        name="Calories"
        component={CaloriesScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="Water"
        component={WaterScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="BMI"
        component={BMIScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
          headerShown: false,
        }}
      />

      <Tab.Screen
        name="WorkoutHistory"
        component={WorkoutHistoryScreen}
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}