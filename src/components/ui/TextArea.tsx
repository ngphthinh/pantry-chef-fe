import { TextInput, View, type TextInputProps } from "react-native";
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
export function TextArea({ label, error, hint, className, ...props }: TextAreaProps) {
  const { palette } = useAppTheme();
  return (
    <View className="gap-1.5">
      <AppText variant="caption" className="font-semibold">
        {label}
      </AppText>
      <View
        className={cn(
          "rounded-3xl border bg-surface px-4 py-3 dark:bg-surface-dark",
          error ? "border-dangerInk dark:border-dangerInk-dark" : "border-line dark:border-line-dark",
        )}
      >
        <TextInput
          className={cn("min-h-[88px] text-base text-ink dark:text-ink-dark", className)}
          placeholderTextColor={palette.muted}
          multiline
          textAlignVertical="top"
          {...props}
        />
      </View>
      {error ? <AppText variant="error">{error}</AppText> : null}
      {!error && hint ? <AppText variant="caption">{hint}</AppText> : null}
    </View>
  );
}
