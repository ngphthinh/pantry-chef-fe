import { ActivityIndicator, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageScreen } from "@/components/ui/PageScreen";
import { TextField } from "@/components/ui/TextField";
import { brand } from "@/core/theme/colors";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { confirmAction, notify } from "@/core/ui/dialogs";
import { useExcludedIngredientForm } from "@/features/excludedIngredient/useExcludedIngredientForm";
import { useExcludedIngredients } from "@/features/excludedIngredient/useExcludedIngredients";

export default function ExcludedIngredientsScreen() {
  const { palette } = useAppTheme();
  const list = useExcludedIngredients();
  const form = useExcludedIngredientForm();

  const handleRemove = async (id: string, name: string) => {
    const ok = await confirmAction({
      title: "Bỏ nguyên liệu loại trừ",
      message: `Bỏ “${name}” khỏi danh sách? Gợi ý món và AI sẽ có thể dùng lại nguyên liệu này.`,
      confirmText: "Bỏ",
      destructive: true,
    });
    if (!ok) return;
    const result = await list.remove(id);
    if (!result.ok) notify("Lỗi", result.message);
  };

  return (
    <PageScreen title="Nguyên liệu loại trừ">
      <AppText variant="caption">
        Những nguyên liệu bạn không ăn được hoặc không muốn dùng (dị ứng, ăn kiêng). Gợi ý món và AI sẽ tránh chúng.
      </AppText>
      <View className="gap-3">
        <TextField
          label="Thêm nguyên liệu"
          placeholder="Ví dụ: Đậu phộng"
          autoCapitalize="sentences"
          value={form.name}
          onChangeText={form.setName}
          error={form.error}
          onSubmitEditing={() => void form.submit()}
          returnKeyType="done"
        />

        {form.suggestions.length > 0 && (
          <View className="gap-2">
            <AppText variant="label">Gợi ý từ danh mục</AppText>
            <View className="flex-row flex-wrap gap-2">
              {form.suggestions.map((s) => (
                <Chip key={s.id} label={s.name} onPress={() => void form.submit(s.name)} />
              ))}
            </View>
          </View>
        )}

        <Button title="Thêm vào danh sách" loading={form.isSaving} onPress={() => void form.submit()} />
      </View>
      <View className="gap-2">
        <AppText variant="label">Đang loại trừ ({list.items.length})</AppText>

        {list.isLoading && <ActivityIndicator color={brand.DEFAULT} />}

        {list.error && list.items.length === 0 && (
          <Card className="items-center gap-3 p-5">
            <AppText variant="error" className="text-center">
              {list.error}
            </AppText>
            <Button title="Thử lại" variant="outline" onPress={() => void list.load()} />
          </Card>
        )}

        {!list.isLoading && !list.error && list.items.length === 0 && (
          <EmptyState
            icon="ban-outline"
            title="Chưa loại trừ nguyên liệu nào"
            message="Thêm nguyên liệu bạn muốn tránh ở trên."
          />
        )}

        {list.items.map((item) => (
          <Card key={item.id} className="flex-row items-center gap-3 p-4">
            <Ionicons name="ban-outline" size={20} color={palette.dangerInk} />
            <AppText className="flex-1 font-semibold" numberOfLines={1}>
              {item.name}
            </AppText>
            <Pressable
              onPress={() => void handleRemove(item.id, item.name)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={`Bỏ ${item.name}`}
              className="h-9 w-9 items-center justify-center rounded-full bg-dangerBg active:opacity-70 dark:bg-dangerBg-dark"
            >
              <Ionicons name="trash-outline" size={18} color={palette.dangerInk} />
            </Pressable>
          </Card>
        ))}
      </View>
    </PageScreen>
  );
}
