import React from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";

interface TiltCard3DProps {
  children: React.ReactNode;
  isDark?: boolean;
  style?: ViewStyle;
  /** Giữ lại để không phải sửa nơi gọi; không còn tác dụng. */
  shakeTrigger?: boolean | string | null;
}

/** Thẻ tĩnh, không animation. */
export function TiltCard3D({
  children,
  isDark = true,
  style,
}: TiltCard3DProps) {
  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark
              ? "rgba(20, 32, 25, 0.82)"
              : "rgba(255, 255, 255, 0.92)",
            borderColor: isDark
              ? "rgba(52, 211, 153, 0.28)"
              : "rgba(46, 125, 79, 0.18)",
            shadowColor: isDark ? "#000000" : "#1F2D26",
          },
          style,
        ]}>
        <View
          pointerEvents="none"
          style={[
            styles.topBevel,
            {
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.18)"
                : "rgba(255, 255, 255, 0.8)",
            },
          ]}
        />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  card: {
    width: "100%",
    borderRadius: 30,
    borderWidth: 1.5,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 22,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: "hidden",
  },
  topBevel: {
    position: "absolute",
    top: 0,
    left: 24,
    right: 24,
    height: 1.5,
    borderRadius: 1,
  },
});
