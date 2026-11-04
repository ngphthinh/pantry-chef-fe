import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme";
import { AppText } from "./AppText";

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
}

/**
 * Chip thông minh độ tương phản chuẩn WCAG AAA:
 * Dùng plain style object đảm bảo 100% tương thích cả Web lẫn Mobile Native.
 * - Light Mode: Selected nền Emerald (#2E7D4F) chữ Trắng; Unselected nền xám ngọc (#EFF5F1) chữ Đậm (#233329).
 * - Dark Mode: Selected nền Mint Neon (#10B981) chữ Trắng/Đen đậm; Unselected nền than chì (#1E2621) chữ Sáng (#E5EAE7).
 */
export function Chip({ label, selected, onPress, icon }: ChipProps) {
  const { colors, isDark } = useTheme();

  const isSel = !!selected;

  const bg = isSel
    ? colors.primary
    : isDark
      ? "#1E2621"
      : "#EFF5F1";

  const borderColor = isSel
    ? colors.primary
    : isDark
      ? "rgba(255, 255, 255, 0.14)"
      : "#D1DDD5";

  const textColor = isSel
    ? "#FFFFFF"
    : isDark
      ? "#E5EAE7"
      : "#1F2D25";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isSel }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 9999,
        backgroundColor: bg,
        borderColor: borderColor,
        borderWidth: 1.2,
      }}>
      {isSel ? (
        <Ionicons
          name="checkmark-circle"
          size={14}
          color="#FFFFFF"
          style={styles.iconMargin}
        />
      ) : icon ? (
        <Ionicons
          name={icon}
          size={14}
          color={isDark ? "#95A39B" : "#4B5563"}
          style={styles.iconMargin}
        />
      ) : null}

      <AppText
        style={{
          color: textColor,
          fontWeight: isSel ? "800" : "600",
          fontSize: 13,
          letterSpacing: 0.1,
        }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconMargin: {
    marginRight: 5,
  },
});
