import { useState } from "react";
import { Pressable, TextInput, View, type TextInputProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { AppText } from "./AppText";
import { cn } from "./cn";

interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string | null;
}

export function TextField({
  label,
  error,
  secureTextEntry,
  className,
  ...props
}: TextFieldProps) {
  const { palette } = useAppTheme();
  const [hidden, setHidden] = useState(!!secureTextEntry);

  return (
    <View className="gap-1.5">
      {label ? (
        <AppText variant="caption" className="font-semibold">
          {label}
        </AppText>
      ) : null}
      <View
        className={cn(
          "h-12 flex-row items-center rounded-full border bg-surface px-4 dark:bg-surface-dark",
          error
            ? "border-dangerInk dark:border-dangerInk-dark"
            : "border-line dark:border-line-dark",
        )}>
        <TextInput
          className={cn(
            "flex-1 text-sm text-ink dark:text-ink-dark",
            className,
          )}
          placeholderTextColor={palette.muted}
          autoCapitalize="none"
          secureTextEntry={hidden}
          {...props}
        />
        {secureTextEntry && (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={8}>
            <Ionicons
              name={hidden ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={palette.muted}
            />
          </Pressable>
        )}
      </View>
      {error ? <AppText variant="error">{error}</AppText> : null}
    </View>
  );
}
