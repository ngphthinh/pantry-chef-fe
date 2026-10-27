import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  GestureResponderEvent,
  PanResponder,
  PanResponderGestureState,
  Platform,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';

interface TiltCard3DProps {
  children: React.ReactNode;
  isDark?: boolean;
  style?: ViewStyle;
  shakeTrigger?: boolean | string | null;
}

export function TiltCard3D({ children, isDark = true, style, shakeTrigger }: TiltCard3DProps) {
  // 3D rotation values
  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const shakeX = useRef(new Animated.Value(0)).current;

  // Specular sheen reflection
  const sheenX = useRef(new Animated.Value(0)).current;
  const sheenY = useRef(new Animated.Value(0)).current;

  // Idle floating tilt animation
  const idleAnim = useRef(new Animated.Value(0)).current;
  const isInteracting = useRef(false);

  useEffect(() => {
    const idleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(idleAnim, {
          toValue: 1,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(idleAnim, {
          toValue: -1,
          duration: 3500,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    idleLoop.start();

    return () => {
      idleLoop.stop();
    };
  }, []);

  // Shake on error
  useEffect(() => {
    if (shakeTrigger) {
      Animated.sequence([
        Animated.timing(shakeX, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: -4, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 4, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [shakeTrigger]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState: PanResponderGestureState) => {
        // Only claim gesture if noticeable swipe/drag to avoid blocking input taps
        return Math.abs(gestureState.dx) > 10 || Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        isInteracting.current = true;
        Animated.spring(scale, {
          toValue: 0.985,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      },
      onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
        // Map drag gesture to 3D rotation angles
        // Clamping angles between -12deg and +12deg for realistic optical tilt
        const maxAngle = 12;
        const targetRotY = Math.max(-maxAngle, Math.min(maxAngle, (gestureState.dx / 180) * maxAngle));
        const targetRotX = Math.max(-maxAngle, Math.min(maxAngle, (-gestureState.dy / 180) * maxAngle));

        rotateY.setValue(targetRotY);
        rotateX.setValue(targetRotX);

        sheenX.setValue(-targetRotY * 12);
        sheenY.setValue(-targetRotX * 12);
      },
      onPanResponderRelease: () => {
        isInteracting.current = false;
        // Smooth physics spring back to resting state
        Animated.parallel([
          Animated.spring(rotateX, {
            toValue: 0,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.spring(rotateY, {
            toValue: 0,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.spring(scale, {
            toValue: 1,
            tension: 60,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.spring(sheenX, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(sheenY, {
            toValue: 0,
            useNativeDriver: true,
          }),
        ]).start();
      },
    }),
  ).current;

  // Interpolations
  const rotXInterpolated = rotateX.interpolate({
    inputRange: [-20, 20],
    outputRange: ['-20deg', '20deg'],
  });

  const rotYInterpolated = rotateY.interpolate({
    inputRange: [-20, 20],
    outputRange: ['-20deg', '20deg'],
  });

  const idleTiltX = idleAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-1.8deg', '1.8deg'],
  });

  const idleTiltY = idleAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['2deg', '-2deg'],
  });

  return (
    <View style={styles.perspectiveContainer} {...panResponder.panHandlers}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? 'rgba(20, 32, 25, 0.82)' : 'rgba(255, 255, 255, 0.92)',
            borderColor: isDark ? 'rgba(52, 211, 153, 0.28)' : 'rgba(46, 125, 79, 0.18)',
            shadowColor: isDark ? '#000000' : '#1F2D26',
            transform: [
              { perspective: 1000 },
              { translateX: shakeX },
              { scale },
              { rotateX: rotXInterpolated },
              { rotateY: rotYInterpolated },
              { rotateX: idleTiltX },
              { rotateY: idleTiltY },
            ],
          },
          style,
        ]}
      >
        {/* Dynamic Specular Sheen Highlight */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.specularSheen,
            {
              transform: [{ translateX: sheenX }, { translateY: sheenY }],
            },
          ]}
        />

        {/* 3D Top-edge Light Bevel */}
        <View
          pointerEvents="none"
          style={[
            styles.topBevel,
            {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(255, 255, 255, 0.8)',
            },
          ]}
        />

        {/* Inner Content */}
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  perspectiveContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  card: {
    width: '100%',
    borderRadius: 30,
    borderWidth: 1.5,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.38,
    shadowRadius: 28,
    elevation: 18,
    overflow: 'hidden',
  },
  specularSheen: {
    position: 'absolute',
    top: -100,
    left: -100,
    right: -100,
    height: 180,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    transform: [{ rotate: '-25deg' }],
  },
  topBevel: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1.5,
    borderRadius: 1,
  },
});
