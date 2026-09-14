import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { gradients } from '../utils/theme';

const CenterFAB = () => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const [visible, setVisible] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const actions = [
    {
      icon: 'water',
      label: 'Add Water',
      emoji: '💧',
      color: '#1abc9c',
      gradient: gradients.teal,
      screen: 'Water',
    },
    {
      icon: 'restaurant',
      label: 'Add Food',
      emoji: '🍔',
      color: '#f39c12',
      gradient: gradients.orange,
      screen: 'Calories',
    },
    {
      icon: 'calculator',
      label: 'BMI',
      emoji: '⚖️',
      color: '#9b59b6',
      gradient: gradients.purple,
      screen: 'BMI',
    },
    {
      icon: 'barbell',
      label: 'Workout',
      emoji: '🏋️',
      color: '#e74c3c',
      gradient: gradients.fire,
      screen: 'Workout',
    },
  ];

  const openMenu = () => {
    setVisible(true);
    Animated.spring(animation, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 10,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const handleAction = (screen) => {
    closeMenu();
    setTimeout(() => {
      navigation.navigate(screen);
    }, 300);
  };

  const rotation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '135deg'],
  });

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 1],
  });

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const opacity = animation;

  return (
    <>
      {/* FAB Button */}
      <TouchableOpacity
        onPress={openMenu}
        activeOpacity={0.85}
        style={styles.fabWrapper}
      >
        <LinearGradient
          colors={gradients.blue}
          style={styles.fabButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <Ionicons name="add" size={32} color="#fff" />
          </Animated.View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Modal with Quick Actions */}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={closeMenu}
      >
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                style={[
                  styles.actionMenu,
                  {
                    backgroundColor: theme.card,
                    opacity,
                    transform: [{ translateY }, { scale }],
                  },
                ]}
              >
                <Text style={[styles.menuTitle, { color: theme.text }]}>
                  ⚡ Quick Add
                </Text>

                <View style={styles.actionsGrid}>
                  {actions.map((action, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.actionItem}
                      onPress={() => handleAction(action.screen)}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={action.gradient}
                        style={styles.actionIconContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.actionEmoji}>{action.emoji}</Text>
                      </LinearGradient>
                      <Text
                        style={[styles.actionLabel, { color: theme.text }]}
                        numberOfLines={1}
                      >
                        {action.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[
                    styles.closeBtn,
                    { backgroundColor: theme.cardSecondary },
                  ]}
                  onPress={closeMenu}
                >
                  <Ionicons name="close" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fabWrapper: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E86DE',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 4,
    borderColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  actionMenu: {
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 18,
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
  },
});

export default CenterFAB;