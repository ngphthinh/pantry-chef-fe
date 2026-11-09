import { useEffect, useRef, useState, type ReactNode } from "react";
import { ActivityIndicator, Keyboard, Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { TextField } from "@/components/ui/TextField";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { useIngredientSearch } from "@/features/customRecipe/useIngredientSearch";
import type { IngredientResponse } from "@/types";

interface Props {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (item: IngredientResponse) => void;
  /** Nút đặt bên phải ô nhập (ví dụ nút xoá dòng). */
  right?: ReactNode;
}

export function IngredientNameField({
  label,
  value,
  onChangeText,
  onSelect,
  right,
}: Props) {
  const { brand } = useAppTheme();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { items, isLoading } = useIngredientSearch(value, open);

  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

  const handleChange = (text: string) => {
    setOpen(true); // chỉ mở danh sách khi người dùng gõ
    onChangeText(text);
  };

  // Trễ một chút để cú chạm vào gợi ý kịp xử lý trước khi danh sách đóng lại.
  const handleBlur = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  };

  const handleSelect = (item: IngredientResponse) => {
    Keyboard.dismiss();
    setOpen(false);
    onSelect(item);
  };

  const showList = open && value.trim().length > 0;

  return (
    <View className="gap-2">
      <View className="flex-row items-end gap-3">
        <View className="flex-1">
          <TextField
            label={label}
            placeholder="Ví dụ: Thịt bò, Cà chua..."
            autoCapitalize="sentences"
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
            blurOnSubmit={true}
            value={value}
            onChangeText={handleChange}
            onBlur={handleBlur}
          />
        </View>
        {right}
      </View>

      {showList ? (
        <View className="overflow-hidden rounded-2xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark">
          {isLoading && items.length === 0 ? (
            <View className="items-center py-3">
              <ActivityIndicator size="small" color={brand} />
            </View>
          ) : items.length === 0 ? (
            <AppText variant="caption" className="px-4 py-3">
              Không có trong danh mục, sẽ dùng đúng tên bạn nhập.
            </AppText>
          ) : (
            items.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => handleSelect(item)}
                className="border-b border-line px-4 py-3 active:opacity-70 dark:border-line-dark">
                <AppText className="font-semibold">{item.name}</AppText>
                <AppText variant="caption">
                  {item.category?.name ?? "Nguyên liệu"}
                  {item.defaultUnit ? ` · ${item.defaultUnit}` : ""}
                </AppText>
              </Pressable>
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}
