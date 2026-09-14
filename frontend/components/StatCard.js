import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const StatCard = ({
  icon,
  value,
  label,
  gradient,
  color,
  size = 'medium',
}) => {
  const { theme } = useTheme();

  const isSmall = size === 'small';
  const isLarge = size === 'large';

  if (gradient) {
    return (
      <LinearGradient
        colors={gradient}
        style={[
          styles.container,
          isSmall && styles.small,
          isLarge && styles.large,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.icon}>{icon}</Text>
        <Text
          style={[
            styles.value,
            { color: '#fff' },
            isSmall && styles.valueSmall,
            isLarge && styles.valueLarge,
          ]}
        >
          {value}
        </Text>
        <Text
          style={[
            styles.label,
            { color: 'rgba(255,255,255,0.9)' },
            isSmall && styles.labelSmall,
          ]}
        >
          {label}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderLeftColor: color || theme.primary,
        },
        isSmall && styles.small,
        isLarge && styles.large,
      ]}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text
        style={[
          styles.value,
          { color: color || theme.text },
          isSmall && styles.valueSmall,
          isLarge && styles.valueLarge,
        ]}
      >
        {value}
      </Text>
      <Text
        style={[
          styles.label,
          { color: theme.textSecondary },
          isSmall && styles.labelSmall,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  small: {
    padding: 12,
    borderRadius: 12,
  },
  large: {
    padding: 20,
    borderRadius: 20,
  },
  icon: {
    fontSize: 24,
    marginBottom: 6,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  valueSmall: {
    fontSize: 16,
  },
  valueLarge: {
    fontSize: 28,
  },
  label: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  labelSmall: {
    fontSize: 10,
  },
});

export default StatCard;