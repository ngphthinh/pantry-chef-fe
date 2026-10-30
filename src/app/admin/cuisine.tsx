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
      <View className="gap-5 pb-10">
        {/* Form */}
        <Card className="gap-3 bg-brandSoft/40 p-4 shadow-sm dark:bg-surface-dark">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-surface dark:bg-soft-dark">
              <Ionicons
                name={form.editing ? "create" : "add-circle"}
                size={24}
                color={brand}
              />
            </View>
            <View className="flex-1">
              <AppText variant="heading" className="text-base">
                {form.editing ? "Sửa ẩm thực" : "Thêm ẩm thực"}
              </AppText>
              <AppText variant="caption">
                {form.editing
                  ? "Chỉnh sửa rồi lưu thay đổi"
                  : "Tạo danh mục ẩm thực mới"}
              </AppText>
            </View>
          </View>

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

          {form.errors.submit ? (
            <View className="flex-row items-center gap-2 rounded-2xl border border-dangerInk/40 bg-dangerBg/40 p-3 dark:border-dangerInk-dark/40 dark:bg-dangerBg-dark">
              <Ionicons
                name="alert-circle"
                size={18}
                color={palette.dangerInk}
              />
              <AppText variant="error" className="flex-1">
                {form.errors.submit}
              </AppText>
            </View>
          ) : null}

          <View className="flex-row gap-3">
            {form.editing ? (
              <Button
                title="Huỷ"
                variant="outline"
                className="flex-1"
                onPress={form.cancelEdit}
              />
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
          <Card className="items-center gap-3 p-5 shadow-sm">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-dangerBg dark:bg-dangerBg-dark">
              <Ionicons
                name="alert-circle"
                size={28}
                color={palette.dangerInk}
              />
            </View>
            <AppText variant="error" className="text-center">
              {loadError}
            </AppText>
            <Button
              title="Thử lại"
              variant="outline"
              onPress={() => void load(true)}
              className="self-stretch"
            />
          </Card>
        ) : null}

        {isLoading && items.length === 0 ? (
          <View className="items-center py-10">
            <ActivityIndicator size="large" color={brand} />
            <AppText variant="caption" className="mt-3">
              Đang tải danh sách...
            </AppText>
          </View>
        ) : null}

        {!isLoading && !loadError && items.length === 0 ? (
          <EmptyState
            icon="restaurant-outline"
            title="Chưa có ẩm thực nào"
            message="Thêm ẩm thực đầu tiên ở phía trên."
          />
        ) : null}

        {items.length > 0 ? (
          <View className="gap-3">
            <View className="flex-row items-center justify-between px-1">
              <AppText
                variant="label"
                className="text-xs font-bold uppercase tracking-wider text-muted dark:text-muted-dark">
                Danh sách ẩm thực
              </AppText>
              <View className="rounded-full bg-brandSoft px-2.5 py-1 dark:bg-surface-dark">
                <AppText className="text-xs font-bold text-brand">
                  {items.length}
                </AppText>
              </View>
            </View>

            {items.map((cuisine) => (
              <Card
                key={cuisine.id}
                className="flex-row items-center gap-3 p-3.5 shadow-sm">
                <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brandSoft dark:bg-surface-dark">
                  <Ionicons name="restaurant" size={22} color={brand} />
                </View>

                <View className="flex-1 gap-1">
                  <AppText
                    variant="heading"
                    className="text-base"
                    numberOfLines={1}>
                    {cuisine.name}
                  </AppText>
                  <View className="self-start rounded-full bg-soft px-2.5 py-0.5 dark:bg-soft-dark">
                    <AppText variant="caption" className="font-semibold">
                      {cuisine.code}
                    </AppText>
                  </View>
                </View>

                <Pressable
                  onPress={() => form.startEdit(cuisine)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={`Sửa ${cuisine.name}`}
                  className="h-9 w-9 items-center justify-center rounded-full bg-brandSoft active:scale-90 dark:bg-surface-dark">
                  <Ionicons name="create-outline" size={18} color={brand} />
                </Pressable>
                <Pressable
                  onPress={() => void handleRemove(cuisine)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={`Xoá ${cuisine.name}`}
                  className="h-9 w-9 items-center justify-center rounded-full bg-dangerBg active:scale-90 dark:bg-dangerBg-dark">
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={palette.dangerInk}
                  />
                </Pressable>
              </Card>
            ))}
          </View>
        ) : null}
      </View>
    </PageScreen>
  );
}
