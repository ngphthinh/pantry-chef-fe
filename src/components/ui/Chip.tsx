import { Pressable } from "react-native";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { AppText } from "./AppText";
import { cn } from "./cn";

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

/** Chip nào cũng có viền (kích thước không đổi khi chọn); chip được chọn nổi bật bằng viền, nền và chữ màu thương hiệu. */
export function Chip({ label, selected, onPress }: ChipProps) {
  const { palette } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      className={cn(
        "rounded-full border-[1.5px] px-4 py-2",
        selected
          ? "border-brand bg-brandSoft dark:border-successInk-dark dark:bg-successBg-dark"
          : "border-line bg-soft dark:border-line-dark dark:bg-soft-dark",
      )}>
      <AppText
        className="font-semibold"
        style={
          selected
            ? { color: palette.successInk, fontWeight: "700" }
            : undefined
        }>
        {label}
      </AppText>
    </Pressable>
  );
}
