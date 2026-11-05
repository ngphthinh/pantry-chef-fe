import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/theme";
import { useAuthShell } from "@/components/auth/AuthShell";

interface GlassInput3DProps extends TextInputProps {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  error?: string | null;
  isDark?: boolean;
}

/**
 * Input hiệu ứng kính 3D hiện đại: đổi viền phát sáng khi focus,
 * tương thích 100% với hệ thống Design Token.
 */
export function GlassInput3D({
  label,
  iconName,
  error,
  isDark: propIsDark,
  secureTextEntry,
  value,
  onChangeText,
  ...props
}: GlassInput3DProps) {
  const theme = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : theme.isDark;
  const { colors, radius } = theme;

  const authShell = useAuthShell();
  const [layoutY, setLayoutY] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);

  const accentColor = colors.primary;
  const mutedColor = colors.textSecondary;

  const borderColor = error
    ? colors.error
    : isFocused
      ? accentColor
      : isDark
        ? colors.border
        : "rgba(0, 0, 0, 0.08)";

  const backgroundColor = isFocused
    ? isDark
      ? "rgba(46, 125, 79, 0.16)"
      : "rgba(255, 255, 255, 0.95)"
    : isDark
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(255, 255, 255, 0.75)";

  return (
    <View
      style={styles.container}
      onLayout={(e) => {
        setLayoutY(e.nativeEvent.layout.y);
      }}>
      <AppText
        variant="caption"
        style={[
          styles.label,
          { color: isFocused ? accentColor : mutedColor },
        ]}>
        {label}
      </AppText>

      <View
        style={[
          styles.fieldWrapper,
          {
            borderColor,
            backgroundColor,
            borderRadius: radius.xl,
          },
        ]}>
        <Ionicons
          name={iconName}
          size={20}
          color={error ? colors.error : isFocused ? accentColor : mutedColor}
          style={styles.leadingIcon}
        />

        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          placeholderTextColor={colors.textDisabled}
          autoCapitalize="none"
          secureTextEntry={hidden}
          value={value}
          onChangeText={onChangeText}
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
            if (authShell) {
              const name = label.toLowerCase();
              // Độ nhích nhẹ vừa vặn, không đẩy quá cao làm mất tiêu đề
              const targetY = name.includes("host")
                ? 0
                : name.includes("email")
                  ? 80
                  : name.includes("xác nhận")
                    ? 180
                    : secureTextEntry || name.includes("mật khẩu")
                      ? 140
                      : 50;

              authShell.scrollToY(targetY);
            }
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />

        {secureTextEntry ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            style={styles.trailingAction}>
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={mutedColor}
            />
          </Pressable>
        ) : value && value.length > 0 ? (
          <Pressable
            onPress={() => onChangeText?.("")}
            hitSlop={10}
            style={styles.trailingAction}>
            <Ionicons
              name="close-circle"
              size={18}
              color={colors.textDisabled}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons
            name="alert-circle"
            size={14}
            color={colors.error}
          />
          <AppText
            variant="error"
            style={[styles.errorText, { color: colors.error }]}>
            {error}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    width: "100%",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  fieldWrapper: {
    height: 52,
    borderWidth: 1.2,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  leadingIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    paddingVertical: 0,
  },
  trailingAction: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    gap: 4,
  },
  errorText: {
    fontSize: 12,
  },
});
