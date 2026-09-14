import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.emoji}>💪</Text>
      </Animated.View>
      <Animated.Text style={[styles.appName, { opacity: fadeAnim }]}>FitTrack</Animated.Text>
      <Animated.Text style={[styles.tagline, { opacity: fadeAnim }]}>Your Fitness Partner</Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#3498db', justifyContent: 'center', alignItems: 'center' },
  logoContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emoji: { fontSize: 70 },
  appName: { fontSize: 42, fontWeight: 'bold', color: '#fff', letterSpacing: 2 },
  tagline: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 8, letterSpacing: 1 },
});

export default SplashScreen;