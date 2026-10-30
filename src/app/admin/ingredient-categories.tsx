import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageScreen } from "@/components/ui/PageScreen";
import { TextField } from "@/components/ui/TextField";
import { brand } from "@/core/theme/colors";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { confirmAction, notify } from "@/core/ui/dialogs";
import { useAdminAccess } from "@/features/admin/useAdminAccess";
import { useIngredientCategoryForm } from "@/features/ingredient/useIngredientCategoryForm";
import { useIngredientCategoryManager } from "@/features/ingredient/useIngredientCategoryManager";
import type { IngredientCategoryResponse } from "@/types";

export default function IngredientCategoriesScreen() {
  const { palette } = useAppTheme();
  const { isAdmin } = useAdminAccess();
  const manager = useIngredientCategoryManager();
  const form = useIngredientCategoryForm(manager.save);

  const handleDelete = async (category: IngredientCategoryResponse) => {
    const ok = await confirmAction({
      title: "Xoá danh mục",
      message: `Xoá “${category.name}”? Chỉ xoá được khi không còn nguyên liệu nào thuộc danh mục này.`,
      confirmText: "Xoá",
      destructive: true,
    });
    if (!ok) return;
    const result = await manager.remove(category.id);
    if (!result.ok) notify("Không thể xoá", result.message);
  };

  return (
    <PageScreen
      title="Danh mục nguyên liệu"
      right={
        isAdmin ? (
          <Pressable
            onPress={() => form.open()}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Thêm danh mục">
            <Ionicons name="add-circle" size={30} color={brand.DEFAULT} />
          </Pressable>
        ) : null
      }>
      <AppText variant="caption">
        Nhóm dùng để phân loại nguyên liệu và lọc trong tủ. Mã là định danh của
        hệ thống, tên là phần hiển thị cho người dùng.
      </AppText>

      <TextField
        label="Tìm danh mục"
        placeholder="Theo tên hoặc mã, ví dụ: rau"
        value={manager.keyword}
        onChangeText={manager.setKeyword}
        returnKeyType="search"
      />

      <View className="gap-2">
        <AppText variant="label">Danh mục ({manager.total})</AppText>

        {manager.isInitialLoading && (
          <ActivityIndicator color={brand.DEFAULT} />
        )}

        {manager.error && manager.total === 0 && (
          <Card className="items-center gap-3 p-5">
            <AppText variant="error" className="text-center">
              {manager.error}
            </AppText>
            <Button
              title="Thử lại"
              variant="outline"
              onPress={() => void manager.reload()}
            />
          </Card>
        )}

        {manager.isEmpty && (
          <EmptyState
            icon="pricetags-outline"
            title={
              manager.hasFilter
                ? "Không tìm thấy danh mục"
                : "Chưa có danh mục nào"
            }
            message={
              manager.hasFilter
                ? "Thử từ khoá khác."
                : isAdmin
                  ? "Bấm nút + ở góc trên để thêm danh mục đầu tiên."
                  : "Danh mục sẽ hiện ở đây khi quản trị viên thêm."
            }
          />
        )}

        {manager.items.map((category) => (
          <Card key={category.id} className="flex-row items-center gap-3 p-4">
            <Ionicons name="pricetag-outline" size={20} color={brand.DEFAULT} />
            <View className="flex-1">
              <AppText className="font-semibold" numberOfLines={1}>
                {category.name}
              </AppText>
              <AppText variant="caption" numberOfLines={1}>
                {category.code}
              </AppText>
            </View>

            {isAdmin && (
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => form.open(category)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={`Sửa ${category.name}`}
                  className="h-9 w-9 items-center justify-center rounded-full bg-successBg active:opacity-70 dark:bg-successBg-dark">
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color={palette.successInk}
                  />
                </Pressable>
                <Pressable
                  onPress={() => void handleDelete(category)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={`Xoá ${category.name}`}
                  className="h-9 w-9 items-center justify-center rounded-full bg-dangerBg active:opacity-70 dark:bg-dangerBg-dark">
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={palette.dangerInk}
                  />
                </Pressable>
              </View>
            )}
          </Card>
        ))}
      </View>

      {/* Hộp thoại thêm / sửa */}
      <Modal
        visible={form.visible}
        transparent
        animationType="slide"
        onRequestClose={form.close}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-end bg-black/40">
          <Pressable
            className="flex-1"
            onPress={form.close}
            accessibilityLabel="Đóng"
          />

          <View className="gap-4 rounded-t-3xl border border-line bg-surface p-5 pb-8 dark:border-line-dark dark:bg-surface-dark">
            <AppText variant="heading">
              {form.isEditing ? "Sửa danh mục" : "Thêm danh mục"}
            </AppText>

            <TextField
              label="Mã danh mục"
              placeholder="Ví dụ: VEGETABLE"
              value={form.code}
              onChangeText={form.setCode}
              autoCapitalize="characters"
              maxLength={50}
              error={form.errors.code}
            />

            <TextField
              label="Tên danh mục"
              placeholder="Ví dụ: Rau củ"
              autoCapitalize="sentences"
              value={form.name}
              onChangeText={form.setName}
              maxLength={255}
              error={form.errors.name}
              onSubmitEditing={() => void form.submit()}
              returnKeyType="done"
            />

            {form.formError ? (
              <AppText variant="error">{form.formError}</AppText>
            ) : null}

            <View className="flex-row gap-3">
              <Button
                title="Huỷ"
                variant="outline"
                className="flex-1"
                disabled={form.isSubmitting}
                onPress={form.close}
              />
              <Button
                title="Lưu"
                className="flex-1"
                loading={form.isSubmitting}
                onPress={() => void form.submit()}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </PageScreen>
  );
}
