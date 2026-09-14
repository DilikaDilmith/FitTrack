import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { categoryColors } from '../utils/theme';
import { useTheme } from '../context/ThemeContext';

const CategoryImageCard = ({
  category,
  image,
  exerciseCount,
  onPress,
  isCustom,
}) => {
  const { theme } = useTheme();
  const colors = categoryColors[category] || categoryColors.Chest;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <ImageBackground
        source={{ uri: image }}
        style={styles.image}
        imageStyle={{ borderRadius: 18 }}
      >
        {/* Top gradient — subtle darkening at top for the custom badge */}
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.82)']}
          locations={[0, 0.4, 1]}
          style={[styles.overlay, { borderRadius: 18 }]}
        >
          {/* Custom badge at top-right */}
          {isCustom && (
            <View style={styles.customBadge}>
              <Text style={styles.customBadgeText}>CUSTOM</Text>
            </View>
          )}

          {/* Bottom content */}
          <View style={styles.content}>
            <View
              style={[
                styles.emojiBadge,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text style={styles.emoji}>{colors.emoji}</Text>
            </View>
            <Text style={styles.name}>{category}</Text>
            <Text style={styles.count}>
              {exerciseCount} exercise{exerciseCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    height: 165,
    marginBottom: 14,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 8,
  },
  image: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 12,
  },
  customBadge: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(155, 89, 182, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  customBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  content: {
    justifyContent: 'flex-end',
  },
  emojiBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  emoji: {
    fontSize: 20,
  },
  name: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  count: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 3,
    fontWeight: '600',
  },
});

export default CategoryImageCard;