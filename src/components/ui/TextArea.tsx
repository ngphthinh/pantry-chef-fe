import React, { useState } from "react";
import {
  Keyboard,
  Pressable,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { AppText } from "./AppText";
import { cn } from "./cn";

interface TextAreaProps extends TextInputProps {
  label: string;
  error?: string | null;
  /** Dòng nhỏ dưới ô nhập (ví dụ bộ đếm ký tự). */
  hint?: string;
}

/** Ô nhập nhiều dòng, cùng kiểu với TextField. */
export function TextArea({
  label,
  error,
  hint,
  className,
  onFocus,
  onBlur,
  ...props
}: TextAreaProps) {
  const { palette, brand } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className="gap-1.5">
      <View className="flex-row items-center justify-between">
        <AppText variant="caption" className="font-semibold">
          {label}
        </AppText>
        {isFocused && (
          <Pressable
            onPress={() => Keyboard.dismiss()}
            hitSlop={8}
            className="flex-row items-center gap-1 rounded-lg bg-soft px-2 py-0.5 active:opacity-70 dark:bg-surface-dark">
            <Ionicons name="checkmark" size={13} color={brand} />
            <AppText className="text-xs font-semibold text-brand">Xong</AppText>
          </Pressable>
        )}
      </View>
      <View
        className={cn(
          "rounded-3xl border bg-surface px-4 py-3 dark:bg-surface-dark",
          error
            ? "border-dangerInk dark:border-dangerInk-dark"
            : "border-line dark:border-line-dark",
        )}>
        <TextInput
          className={cn(
            "min-h-[88px] text-base text-ink dark:text-ink-dark",
            className,
          )}
          placeholderTextColor={palette.muted}
          multiline
          textAlignVertical="top"
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...props}
        />
      </View>
      {error ? <AppText variant="error">{error}</AppText> : null}
      {!error && hint ? <AppText variant="caption">{hint}</AppText> : null}
    </View>
  );
}
