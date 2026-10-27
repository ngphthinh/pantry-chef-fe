import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';

interface TactileButton3DProps {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  loading?: boolean;
  disabled?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export function TactileButton3D({
  title,
  onPress,
  loading = false,
  disabled = false,
  iconName = 'arrow-forward-outline',
}: TactileButton3DProps) {
  const pressAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    // Periodic light shimmer across the button surface
    const shimmerLoop = Animated.loop(
      Animated.sequence([
        Animated.delay(2600),
        Animated.timing(shimmerAnim, {
          toValue: 1.5,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: -1,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    shimmerLoop.start();
    return () => shimmerLoop.stop();
  }, []);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      tension: 180,
      friction: 12,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 0,
      tension: 140,
      friction: 9,
      useNativeDriver: true,
    }).start();
  };

  const translateY = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 3],
  });

  const scale = pressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.98],
  });

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [-1, 1.5],
    outputRange: [-120, 280],
  });

  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={inactive}
      style={styles.wrapper}
    >
      {/* 3D Bottom Bevel Layer (Provides physical thickness) */}
      <View style={styles.bevelBase} />

      {/* Main Animated Surface */}
      <Animated.View
        style={[
          styles.buttonSurface,
          {
            transform: [{ translateY }, { scale }],
            opacity: inactive ? 0.75 : 1,
          },
        ]}
      >
        {/* Specular Rim Light */}
        <View style={styles.topRim} />

        {/* Shimmer light sweep */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.shimmerBeam,
            {
              transform: [{ translateX: shimmerTranslateX }, { rotate: '25deg' }],
            },
          ]}
        />

        {/* Content */}
        {loading ? (
          <View style={styles.row}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <AppText style={styles.loadingText}>Đang xác thực...</AppText>
          </View>
        ) : (
          <View style={styles.row}>
            <AppText style={styles.buttonText}>{title}</AppText>
            {iconName ? (
              <Ionicons name={iconName} size={18} color="#FFFFFF" style={styles.icon} />
            ) : null}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: 54,
    marginVertical: 10,
    justifyContent: 'center',
  },
  bevelBase: {
    position: 'absolute',
    top: 4,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: '#1B4D31',
    borderRadius: 20,
  },
  buttonSurface: {
    height: 50,
    borderRadius: 20,
    backgroundColor: '#2E7D4F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  topRim: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
    borderRadius: 1,
  },
  shimmerBeam: {
    position: 'absolute',
    top: -30,
    width: 40,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },
  icon: {
    marginLeft: 8,
  },
});
