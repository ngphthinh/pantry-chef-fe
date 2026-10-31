import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LivingBackground4DProps {
  isDark?: boolean;
}

export function LivingBackground4D({ isDark = true }: LivingBackground4DProps) {
  // Orb 1: Emerald culinary aura
  const orb1X = useRef(new Animated.Value(0)).current;
  const orb1Y = useRef(new Animated.Value(0)).current;
  const orb1Scale = useRef(new Animated.Value(1)).current;

  // Orb 2: Warm amber hearth glow
  const orb2X = useRef(new Animated.Value(0)).current;
  const orb2Y = useRef(new Animated.Value(0)).current;
  const orb2Scale = useRef(new Animated.Value(1)).current;

  // Orb 3: Central breathing pulse
  const orb3Scale = useRef(new Animated.Value(0.9)).current;
  const orb3Opacity = useRef(new Animated.Value(0.4)).current;

  // Floating culinary particles
  const particle1 = useRef(new Animated.Value(0)).current;
  const particle2 = useRef(new Animated.Value(0)).current;
  const particle3 = useRef(new Animated.Value(0)).current;
  const particle4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Orb 1 continuous organic Lissajous movement
    const loopOrb1 = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orb1X, {
            toValue: 40,
            duration: 6000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(orb1Y, {
            toValue: -35,
            duration: 5000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(orb1Scale, {
            toValue: 1.15,
            duration: 5500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orb1X, {
            toValue: -30,
            duration: 7000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(orb1Y, {
            toValue: 45,
            duration: 6500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(orb1Scale, {
            toValue: 0.9,
            duration: 6000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orb1X, {
            toValue: 0,
            duration: 5000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(orb1Y, {
            toValue: 0,
            duration: 5500,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(orb1Scale, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    // Orb 2 warm hearth breathing counter-motion
    const loopOrb2 = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orb2X, {
            toValue: -45,
            duration: 7000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(orb2Y, {
            toValue: 40,
            duration: 6000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(orb2Scale, {
            toValue: 1.2,
            duration: 6500,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orb2X, {
            toValue: 35,
            duration: 8000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(orb2Y, {
            toValue: -30,
            duration: 7500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(orb2Scale, {
            toValue: 0.85,
            duration: 7000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orb2X, {
            toValue: 0,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(orb2Y, {
            toValue: 0,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(orb2Scale, {
            toValue: 1,
            duration: 6000,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    // Orb 3 central 4D pulse
    const loopOrb3 = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(orb3Scale, {
            toValue: 1.25,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(orb3Opacity, {
            toValue: 0.65,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(orb3Scale, {
            toValue: 0.9,
            duration: 4000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(orb3Opacity, {
            toValue: 0.35,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );

    // Staggered upward floating particles
    const createParticleLoop = (anim: Animated.Value, duration: number, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );
    };

    const loopP1 = createParticleLoop(particle1, 8000, 0);
    const loopP2 = createParticleLoop(particle2, 9500, 1500);
    const loopP3 = createParticleLoop(particle3, 7500, 3000);
    const loopP4 = createParticleLoop(particle4, 11000, 4500);

    loopOrb1.start();
    loopOrb2.start();
    loopOrb3.start();
    loopP1.start();
    loopP2.start();
    loopP3.start();
    loopP4.start();

    return () => {
      loopOrb1.stop();
      loopOrb2.stop();
      loopOrb3.stop();
      loopP1.stop();
      loopP2.stop();
      loopP3.stop();
      loopP4.stop();
    };
  }, []);

  const baseBg = isDark ? '#0A120E' : '#F5F2EB';

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: baseBg, overflow: 'hidden' }]} pointerEvents="none">
      {/* Orb 1: Emerald Glow (Top Left) */}
      <Animated.View
        style={[
          styles.orb,
          {
            width: SCREEN_WIDTH * 0.95,
            height: SCREEN_WIDTH * 0.95,
            borderRadius: SCREEN_WIDTH * 0.5,
            backgroundColor: isDark ? 'rgba(46, 125, 79, 0.38)' : 'rgba(74, 222, 128, 0.28)',
            top: -SCREEN_WIDTH * 0.2,
            left: -SCREEN_WIDTH * 0.2,
            transform: [{ translateX: orb1X }, { translateY: orb1Y }, { scale: orb1Scale }],
          },
        ]}
      />

      {/* Orb 2: Warm Amber / Culinary Fire Glow (Bottom Right) */}
      <Animated.View
        style={[
          styles.orb,
          {
            width: SCREEN_WIDTH * 0.9,
            height: SCREEN_WIDTH * 0.9,
            borderRadius: SCREEN_WIDTH * 0.45,
            backgroundColor: isDark ? 'rgba(217, 119, 6, 0.22)' : 'rgba(245, 158, 11, 0.18)',
            bottom: -SCREEN_WIDTH * 0.15,
            right: -SCREEN_WIDTH * 0.15,
            transform: [{ translateX: orb2X }, { translateY: orb2Y }, { scale: orb2Scale }],
          },
        ]}
      />

      {/* Orb 3: Central Mint Aurora Glow */}
      <Animated.View
        style={[
          styles.orb,
          {
            width: SCREEN_WIDTH * 0.75,
            height: SCREEN_WIDTH * 0.75,
            borderRadius: SCREEN_WIDTH * 0.375,
            backgroundColor: isDark ? 'rgba(16, 185, 129, 0.22)' : 'rgba(52, 211, 153, 0.20)',
            top: SCREEN_HEIGHT * 0.22,
            left: SCREEN_WIDTH * 0.12,
            opacity: orb3Opacity,
            transform: [{ scale: orb3Scale }],
          },
        ]}
      />

      {/* 4D Floating Particle 1 */}
      <Animated.View
        style={[
          styles.particle,
          {
            left: '20%',
            bottom: -20,
            transform: [
              {
                translateY: particle1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -SCREEN_HEIGHT * 0.85],
                }),
              },
              {
                translateX: particle1.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 25, -15],
                }),
              },
            ],
            opacity: particle1.interpolate({
              inputRange: [0, 0.2, 0.8, 1],
              outputRange: [0, 0.8, 0.6, 0],
            }),
          },
        ]}
      />

      {/* 4D Floating Particle 2 */}
      <Animated.View
        style={[
          styles.particle,
          {
            width: 8,
            height: 8,
            borderRadius: 4,
            left: '68%',
            bottom: -20,
            backgroundColor: isDark ? '#F59E0B' : '#EAB308',
            transform: [
              {
                translateY: particle2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -SCREEN_HEIGHT * 0.9],
                }),
              },
              {
                translateX: particle2.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, -30, 20],
                }),
              },
            ],
            opacity: particle2.interpolate({
              inputRange: [0, 0.25, 0.75, 1],
              outputRange: [0, 0.9, 0.7, 0],
            }),
          },
        ]}
      />

      {/* 4D Floating Particle 3 */}
      <Animated.View
        style={[
          styles.particle,
          {
            width: 5,
            height: 5,
            borderRadius: 2.5,
            left: '42%',
            bottom: -20,
            backgroundColor: '#34D399',
            transform: [
              {
                translateY: particle3.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -SCREEN_HEIGHT * 0.8],
                }),
              },
              {
                translateX: particle3.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 20, -25],
                }),
              },
            ],
            opacity: particle3.interpolate({
              inputRange: [0, 0.2, 0.8, 1],
              outputRange: [0, 0.7, 0.5, 0],
            }),
          },
        ]}
      />

      {/* 4D Floating Particle 4 */}
      <Animated.View
        style={[
          styles.particle,
          {
            width: 7,
            height: 7,
            borderRadius: 3.5,
            left: '82%',
            bottom: -20,
            backgroundColor: isDark ? '#A7F3D0' : '#10B981',
            transform: [
              {
                translateY: particle4.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -SCREEN_HEIGHT * 0.75],
                }),
              },
              {
                translateX: particle4.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, -18, 15],
                }),
              },
            ],
            opacity: particle4.interpolate({
              inputRange: [0, 0.3, 0.7, 1],
              outputRange: [0, 0.85, 0.6, 0],
            }),
          },
        ]}
      />

      {/* Micro-dot grid mesh effect for futuristic depth */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: isDark ? 0.08 : 0.04,
            borderStyle: 'dashed',
            borderWidth: 1,
            borderColor: isDark ? '#34D399' : '#047857',
            margin: -2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    // Soft blur simulation with radial layer
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#6EE7B7',
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 3,
  },
});
