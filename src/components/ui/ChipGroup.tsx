import { ScrollView, View } from "react-native";
import { Chip } from "./Chip";

export interface ChipOption<T extends string> {
  value: T;
  label: string;
}

interface ChipGroupProps<T extends string> {
  options: readonly ChipOption<T>[];
  value: T | "" | null | undefined;
  onChange: (value: T) => void;
  /** Có thì bấm lại chip đang chọn sẽ bỏ chọn (dùng cho trường tuỳ chọn). */
  onClear?: () => void;
  /** Một hàng cuộn ngang thay vì xuống dòng. */
  horizontal?: boolean;
}

/** Chọn một giá trị trong nhóm nhỏ (đơn vị, độ khó, ẩm thực, loại phản hồi...). Dựng từ Chip. */
export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  onClear,
  horizontal,
}: ChipGroupProps<T>) {
  const chips = options.map((option) => {
    const selected = option.value === value;
    return (
      <Chip
        key={option.value}
        label={option.label}
        selected={selected}
        onPress={() => (selected && onClear ? onClear() : onChange(option.value))}
      />
    );
  });

  if (horizontal) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View className="flex-row gap-2">{chips}</View>
      </ScrollView>
    );
  }
  return <View className="flex-row flex-wrap gap-2">{chips}</View>;
}
