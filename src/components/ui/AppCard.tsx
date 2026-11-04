import React, { type ReactNode } from "react";
import { StyleSheet, View, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "@/theme";

export interface AppCardProps extends ViewProps {
  children?: ReactNode;
  variant?: "elevated" | "flat" | "outlined" | "glass";
  className?: string;
}

/**
 * Thẻ giao diện AppCard hiện đại:
 * - Hỗ trợ nhiều biến thể: elevated, flat, outlined, glass.
 * - Tự động đồng bộ màu nền và viền từ Theme Token, có đường phản xạ viền trên trong Dark Mode.
 */
export function AppCard({
  children,
  variant = "elevated",
  style,
  ...props
}: AppCardProps) {
  const { colors, radius, isDark } = useTheme();

  const variantStyles: ViewStyle = {
    elevated: {
      backgroundColor: colors.surface,
      borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : colors.border,
      borderWidth: 1.2,
      shadowColor: isDark ? "#000000" : "#121C16",
      shadowOffset: { width: 0, height: isDark ? 3 : 2 },
      shadowOpacity: isDark ? 0.35 : 0.06,
      shadowRadius: isDark ? 8 : 10,
      elevation: isDark ? 4 : 2,
    },
    flat: {
      backgroundColor: colors.surfaceVariant,
      borderWidth: 0,
    },
    outlined: {
      backgroundColor: "transparent",
      borderColor: colors.border,
      borderWidth: 1.2,
    },
    glass: {
      backgroundColor: colors.card,
      borderColor: colors.cardBorder,
      borderWidth: 1.2,
      shadowColor: isDark ? "#000000" : "#121C16",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.4 : 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
  }[variant];

  return (
    <View
      style={[
        styles.base,
        {
          borderRadius: radius["2xl"],
        },
        variantStyles,
        style,
      ]}
      {...props}>
      {isDark ? (
        <View
          pointerEvents="none"
          style={[
            styles.specularTop,
            {
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              borderTopLeftRadius: radius["2xl"],
              borderTopRightRadius: radius["2xl"],
            },
          ]}
        />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: 16,
    overflow: "hidden",
    position: "relative",
  },
  specularTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
});
