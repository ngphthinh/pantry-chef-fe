import { useEffect } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageScreen } from "@/components/ui/PageScreen";
import { TextField } from "@/components/ui/TextField";
import { showAlert } from "@/components/ui/dialogs";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { useCuisine } from "@/features/cuisine/useCuisine";
import { useCuisineForm } from "@/features/cuisine/useCuisineForm";
import type { CuisineResponse } from "@/types";

/** Quản lý danh mục ẩm thực (chỉ admin; đã được chặn ở app/admin/_layout.tsx). */
export default function AdminCuisineScreen() {
  const { palette, brand } = useAppTheme();
  const { items, isLoading, loadError, load, confirmAndRemove } = useCuisine();
  const form = useCuisineForm();

  // Admin luôn lấy danh sách mới nhất, không dùng bản đã lưu tạm.
  useEffect(() => {
    void load(true);
  }, [load]);

  const handleRemove = async (cuisine: CuisineResponse) => {
    const result = await confirmAndRemove(cuisine);
    if (result && !result.ok) showAlert("Không xoá được", result.message);
  };

  return (
    <PageScreen title="Quản lý ẩm thực">
      <Card className="gap-3 p-4">
        <AppText variant="label">{form.editing ? "Sửa ẩm thực" : "Thêm ẩm thực"}</AppText>
        <TextField
          label="Mã (viết hoa, không dấu)"
          placeholder="Ví dụ: JAPANESE"
          autoCapitalize="characters"
          autoCorrect={false}
          value={form.values.code}
          onChangeText={form.setCode}
          error={form.errors.code}
        />
        <TextField
          label="Tên hiển thị"
          placeholder="Ví dụ: Nhật Bản"
          autoCapitalize="sentences"
          value={form.values.name}
          onChangeText={form.setName}
          error={form.errors.name}
        />
        {form.errors.submit ? <AppText variant="error">{form.errors.submit}</AppText> : null}
        <View className="flex-row gap-3">
          {form.editing ? (
            <Button title="Huỷ" variant="outline" className="flex-1" onPress={form.cancelEdit} />
          ) : null}
          <Button
            title={form.editing ? "Lưu thay đổi" : "Thêm"}
            className="flex-1"
            loading={form.isSubmitting}
            onPress={() => void form.submit()}
          />
        </View>
      </Card>

      {loadError ? (
        <Card className="items-center gap-3 p-4">
          <AppText variant="error" className="text-center">
            {loadError}
          </AppText>
          <Button title="Thử lại" variant="outline" onPress={() => void load(true)} className="self-stretch" />
        </Card>
      ) : null}

      {isLoading && items.length === 0 ? <ActivityIndicator color={brand} className="py-6" /> : null}

      {!isLoading && !loadError && items.length === 0 ? (
        <EmptyState icon="restaurant-outline" title="Chưa có ẩm thực nào" message="Thêm ẩm thực đầu tiên ở phía trên." />
      ) : null}

      {items.map((cuisine) => (
        <Card key={cuisine.id} className="flex-row items-center gap-3 p-4">
          <View className="flex-1">
            <AppText className="font-bold">{cuisine.name}</AppText>
            <AppText variant="caption">{cuisine.code}</AppText>
          </View>
          <Pressable
            onPress={() => form.startEdit(cuisine)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Sửa ${cuisine.name}`}
          >
            <Ionicons name="create-outline" size={22} color={brand} />
          </Pressable>
          <Pressable
            onPress={() => void handleRemove(cuisine)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Xoá ${cuisine.name}`}
          >
            <Ionicons name="trash-outline" size={20} color={palette.dangerInk} />
          </Pressable>
        </Card>
      ))}
    </PageScreen>
  );
}
