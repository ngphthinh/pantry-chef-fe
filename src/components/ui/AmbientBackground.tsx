import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useTheme } from "@/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface AmbientBackgroundProps {
  intensity?: "subtle" | "vivid";
}

/**
 * Hiệu ứng ánh sáng môi trường đa chiều (Ambient Glow):
 * Tạo chiều sâu hữu cơ, sinh động cho màn hình theo phong cách VisionOS / iOS 18 Glass.
 * Các quầng sáng mềm mại không gây rối mắt, giữ trọn độ tương phản cho nội dung.
 */
export function AmbientBackground({ intensity = "subtle" }: AmbientBackgroundProps) {
  const { isDark } = useTheme();

  const factor = intensity === "vivid" ? 1.5 : 1;

  return (
    <View style={[StyleSheet.absoluteFill, styles.container]} pointerEvents="none">
      {/* Quầng sáng ngọc bích phía trên bên trái */}
      <View
        style={[
          styles.glowOrb,
          {
            width: SCREEN_WIDTH * 0.85,
            height: SCREEN_WIDTH * 0.85,
            borderRadius: SCREEN_WIDTH * 0.425,
            top: -SCREEN_WIDTH * 0.25,
            left: -SCREEN_WIDTH * 0.2,
            backgroundColor: isDark
              ? `rgba(16, 185, 129, ${0.07 * factor})`
              : `rgba(46, 125, 79, ${0.04 * factor})`,
          },
        ]}
      />

      {/* Quầng sáng hổ phách ấm áp phía dưới bên phải */}
      <View
        style={[
          styles.glowOrb,
          {
            width: SCREEN_WIDTH * 0.75,
            height: SCREEN_WIDTH * 0.75,
            borderRadius: SCREEN_WIDTH * 0.375,
            bottom: SCREEN_HEIGHT * 0.1,
            right: -SCREEN_WIDTH * 0.25,
            backgroundColor: isDark
              ? `rgba(245, 158, 11, ${0.05 * factor})`
              : `rgba(217, 119, 6, ${0.035 * factor})`,
          },
        ]}
      />

      {/* Điểm nhấn bạc hà tươi mát ở góc trên bên phải */}
      <View
        style={[
          styles.glowOrb,
          {
            width: SCREEN_WIDTH * 0.6,
            height: SCREEN_WIDTH * 0.6,
            borderRadius: SCREEN_WIDTH * 0.3,
            top: SCREEN_HEIGHT * 0.15,
            right: -SCREEN_WIDTH * 0.15,
            backgroundColor: isDark
              ? `rgba(52, 211, 153, ${0.04 * factor})`
              : `rgba(16, 185, 129, ${0.03 * factor})`,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
  },
  glowOrb: {
    position: "absolute",
  },
});

