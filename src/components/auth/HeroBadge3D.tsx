import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface HeroBadge3DProps {
  isDark?: boolean;
}

export function HeroBadge3D({ isDark = true }: HeroBadge3DProps) {
  const spinAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const sparkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous 360 ring spin
    const spinLoop = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 16000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    // Subtle 3D floating bounce
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -6,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 4,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    // Aura pulse
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.95,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    // Sparkle blink
    const sparkLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(sparkAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(sparkAnim, {
          toValue: 0.3,
          duration: 1200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    spinLoop.start();
    floatLoop.start();
    pulseLoop.start();
    sparkLoop.start();

    return () => {
      spinLoop.stop();
      floatLoop.stop();
      pulseLoop.stop();
      sparkLoop.stop();
    };
  }, []);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const reverseSpin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      {/* Outer Glow Halo */}
      <Animated.View
        style={[
          styles.glowHalo,
          {
            backgroundColor: isDark ? 'rgba(46, 125, 79, 0.45)' : 'rgba(74, 222, 128, 0.35)',
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* Rotating 3D Orbit Ring (Dashed Gold & Emerald) */}
      <Animated.View
        style={[
          styles.orbitRing,
          {
            borderColor: isDark ? 'rgba(52, 211, 153, 0.4)' : 'rgba(16, 185, 129, 0.45)',
            transform: [{ rotate: spin }],
          },
        ]}
      >
        <View style={[styles.orbitSatellite, { top: -4, left: 36, backgroundColor: '#F59E0B' }]} />
        <View style={[styles.orbitSatellite, { bottom: -4, right: 36, backgroundColor: '#34D399' }]} />
      </Animated.View>

      {/* Counter-rotating Inner Orbit Ring */}
      <Animated.View
        style={[
          styles.innerOrbitRing,
          {
            borderColor: isDark ? 'rgba(245, 158, 11, 0.35)' : 'rgba(217, 119, 6, 0.3)',
            transform: [{ rotate: reverseSpin }],
          },
        ]}
      />

      {/* Glassmorphic 3D Hex/Circle Crest Shield */}
      <Animated.View
        style={[
          styles.crestShield,
          {
            backgroundColor: isDark ? 'rgba(18, 38, 28, 0.85)' : 'rgba(255, 255, 255, 0.92)',
            borderColor: isDark ? 'rgba(52, 211, 153, 0.5)' : 'rgba(46, 125, 79, 0.3)',
            transform: [{ translateY: floatAnim }],
          },
        ]}
      >
        {/* Specular Edge Highlight */}
        <View style={styles.specularEdge} />

        {/* 3D Chef & Culinary Icon Layer */}
        <View style={styles.iconLayer}>
          <MaterialCommunityIcons
            name="chef-hat"
            size={40}
            color={isDark ? '#4ADE80' : '#2E7D4F'}
            style={styles.hatIcon}
          />

          {/* Little Sparkle Accent */}
          <Animated.View
            style={[
              styles.sparkleBadge,
              {
                opacity: sparkAnim,
                transform: [
                  {
                    scale: sparkAnim.interpolate({
                      inputRange: [0.3, 1],
                      outputRange: [0.8, 1.2],
                    }),
                  },
                ],
              },
            ]}
          >
            <Ionicons name="sparkles" size={16} color="#FBBF24" />
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 110,
    height: 110,
    alignSelf: 'center',
    marginBottom: 8,
  },
  glowHalo: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    shadowColor: '#34D399',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 24,
    elevation: 10,
  },
  orbitRing: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  innerOrbitRing: {
    position: 'absolute',
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1,
    borderStyle: 'dotted',
  },
  orbitSatellite: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 5,
    elevation: 4,
  },
  crestShield: {
    width: 76,
    height: 76,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  specularEdge: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },
  iconLayer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  hatIcon: {
    shadowColor: '#2E7D4F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  sparkleBadge: {
    position: 'absolute',
    top: -6,
    right: -10,
  },
});
