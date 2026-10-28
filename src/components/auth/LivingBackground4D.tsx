import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface LivingBackground4DProps {
  isDark?: boolean;
}

/** Nền tĩnh, không animation. */
export function LivingBackground4D({ isDark = true }: LivingBackground4DProps) {
  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: isDark ? "#0A120E" : "#F5F2EB", overflow: "hidden" },
      ]}
      pointerEvents="none">
      {/* Orb xanh (trên trái) */}
      <View
        style={[
          styles.orb,
          {
            width: SCREEN_WIDTH * 0.95,
            height: SCREEN_WIDTH * 0.95,
            borderRadius: SCREEN_WIDTH * 0.5,
            backgroundColor: isDark
              ? "rgba(46, 125, 79, 0.38)"
              : "rgba(74, 222, 128, 0.28)",
            top: -SCREEN_WIDTH * 0.2,
            left: -SCREEN_WIDTH * 0.2,
          },
        ]}
      />

      {/* Orb hổ phách (dưới phải) */}
      <View
        style={[
          styles.orb,
          {
            width: SCREEN_WIDTH * 0.9,
            height: SCREEN_WIDTH * 0.9,
            borderRadius: SCREEN_WIDTH * 0.45,
            backgroundColor: isDark
              ? "rgba(217, 119, 6, 0.22)"
              : "rgba(245, 158, 11, 0.18)",
            bottom: -SCREEN_WIDTH * 0.15,
            right: -SCREEN_WIDTH * 0.15,
          },
        ]}
      />

      {/* Orb bạc hà (giữa) */}
      <View
        style={[
          styles.orb,
          {
            width: SCREEN_WIDTH * 0.75,
            height: SCREEN_WIDTH * 0.75,
            borderRadius: SCREEN_WIDTH * 0.375,
            backgroundColor: isDark
              ? "rgba(16, 185, 129, 0.16)"
              : "rgba(52, 211, 153, 0.16)",
            top: SCREEN_HEIGHT * 0.22,
            left: SCREEN_WIDTH * 0.12,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: "absolute",
  },
});
