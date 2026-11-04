import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/theme";

interface TactileButtonProps {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  loading?: boolean;
  disabled?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap | undefined;
  variant?: "primary" | "secondary" | "danger";
}

/**
 * Nút xúc giác 3D hiện đại: có độ nổi khối, hiệu ứng lún (translateY),
 * viền sáng phản quang (top rim) và bóng phát quang đồng bộ từ theme token.
 */
export function TactileButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  iconName = undefined,
  variant = "primary",
}: TactileButtonProps) {
  const { colors, radius, shadows, isDark } = useTheme();
  const inactive = disabled || loading;

  const bgSurface =
    variant === "secondary"
      ? colors.secondary
      : variant === "danger"
        ? colors.error
        : colors.primary;

  const bevelColor =
    variant === "secondary"
      ? isDark
        ? "#064E3B"
        : "#047857"
      : variant === "danger"
        ? colors.errorSoft
        : colors.primaryBevel;

  const glowColor =
    variant === "danger"
      ? colors.error
      : variant === "secondary"
        ? colors.secondary
        : colors.shadowGlow;

  return (
    <Pressable onPress={onPress} disabled={inactive} style={styles.wrapper}>
      {({ pressed }) => (
        <>
          {/* Lớp đế nổi khối 3D */}
          <View
            style={[
              styles.bevelBase,
              {
                backgroundColor: bevelColor,
                borderRadius: radius["2xl"],
              },
            ]}
          />

          {/* Bề mặt nút bấm có tương tác lún vật lý */}
          <View
            style={[
              styles.buttonSurface,
              {
                backgroundColor: bgSurface,
                borderRadius: radius["2xl"],
                shadowColor: glowColor,
                transform: [{ translateY: pressed ? 3 : 0 }],
                opacity: inactive ? 0.7 : 1,
              },
            ]}>
            {/* Viền sáng phản xạ (Top rim) */}
            <View
              style={[
                styles.topRim,
                {
                  backgroundColor: colors.topRim,
                },
              ]}
            />

            {loading ? (
              <View style={styles.row}>
                <ActivityIndicator size="small" color={colors.textOnPrimary} />
                <AppText
                  style={[styles.loadingText, { color: colors.textOnPrimary }]}>
                  Đang xử lý...
                </AppText>
              </View>
            ) : (
              <View style={styles.row}>
                <AppText
                  style={[styles.buttonText, { color: colors.textOnPrimary }]}>
                  {title}
                </AppText>
                {iconName ? (
                  <Ionicons
                    name={iconName}
                    size={18}
                    color={colors.textOnPrimary}
                    style={styles.icon}
                  />
                ) : null}
              </View>
            )}
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    height: 54,
    marginVertical: 10,
    justifyContent: "center",
  },
  bevelBase: {
    position: "absolute",
    top: 4,
    left: 0,
    right: 0,
    height: 50,
  },
  buttonSurface: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden",
  },
  topRim: {
    position: "absolute",
    top: 0,
    left: 12,
    right: 12,
    height: 1.5,
    borderRadius: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 10,
  },
  icon: {
    marginLeft: 8,
  },
});
