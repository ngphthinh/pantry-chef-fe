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

interface GlassInput3DProps extends TextInputProps {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  error?: string | null;
  isDark?: boolean;
}

/**
 * Không animation: đổi style trực tiếp theo state focus.
 */
export function GlassInput3D({
  label,
  iconName,
  error,
  isDark = true,
  secureTextEntry,
  value,
  onChangeText,
  ...props
}: GlassInput3DProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);

  const accent = isDark ? "#34D399" : "#2E7D4F";
  const muted = isDark ? "#9CA3AF" : "#6B7280";

  const borderColor = error
    ? isDark
      ? "#F87171"
      : "#DC2626"
    : isFocused
      ? accent
      : isDark
        ? "rgba(255, 255, 255, 0.12)"
        : "rgba(0, 0, 0, 0.08)";

  const backgroundColor = isFocused
    ? isDark
      ? "rgba(46, 125, 79, 0.12)"
      : "rgba(255, 255, 255, 0.95)"
    : isDark
      ? "rgba(255, 255, 255, 0.04)"
      : "rgba(255, 255, 255, 0.65)";

  return (
    <View style={styles.container}>
      <AppText
        variant="caption"
        style={[styles.label, { color: isFocused ? accent : muted }]}>
        {label}
      </AppText>

      <View style={[styles.fieldWrapper, { borderColor, backgroundColor }]}>
        <Ionicons
          name={iconName}
          size={20}
          color={error ? "#EF4444" : isFocused ? accent : muted}
          style={styles.leadingIcon}
        />

        <TextInput
          style={[styles.input, { color: isDark ? "#F9FAFB" : "#111827" }]}
          placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
          autoCapitalize="none"
          secureTextEntry={hidden}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {secureTextEntry ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            style={styles.trailingAction}>
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={muted}
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
              color={isDark ? "#6B7280" : "#9CA3AF"}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons
            name="alert-circle"
            size={14}
            color={isDark ? "#F87171" : "#DC2626"}
          />
          <AppText variant="error" style={styles.errorText}>
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
    borderRadius: 18,
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
