import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

// ⭐ Generate locations based on colors array length
const generateLocations = (colors) => {
  const count = colors.length;
  if (count === 2) return [0, 1];
  if (count === 3) return [0, 0.5, 1];
  if (count === 4) return [0, 0.33, 0.66, 1];
  if (count === 5) return [0, 0.25, 0.5, 0.75, 1];
  
  // Generic - equal spacing
  return colors.map((_, i) => i / (count - 1));
};

const HeroCard = ({
  image,
  title,
  subtitle,
  onPress,
  height = 180,
  gradientColors,
  children,
}) => {
  const { theme, isDark } = useTheme();

  const Wrapper = onPress ? TouchableOpacity : View;

  // ⭐ Default gradient colors
  const colors =
    gradientColors || [
      'rgba(0,0,0,0.1)',
      'rgba(0,0,0,0.5)',
      'rgba(0,0,0,0.85)',
    ];

  // ⭐ Generate matching locations
  const locations = generateLocations(colors);

  return (
    <Wrapper
      style={[styles.container, { height, borderRadius: 20 }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <ImageBackground
        source={{ uri: image }}
        style={styles.image}
        imageStyle={{ borderRadius: 20 }}
      >
        {/* Dark Overlay Gradient */}
        <LinearGradient
          colors={colors}
          locations={locations}
          style={[styles.overlay, { borderRadius: 20 }]}
        >
          {children ? (
            children
          ) : (
            <View style={styles.content}>
              {title && <Text style={styles.title}>{title}</Text>}
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          )}
        </LinearGradient>
      </ImageBackground>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  image: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
});

export default HeroCard;