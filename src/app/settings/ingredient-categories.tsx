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
import { Badge } from "@/components/ui/Badge";
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

  // Khớp BE: danh mục hệ thống chỉ ADMIN sửa / xoá; danh mục cá nhân thì chủ sở hữu (BE chỉ trả về của chính mình).
  const canEdit = (category: IngredientCategoryResponse) =>
    isAdmin || !category.system;

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
    <PageScreen title="Danh mục nguyên liệu">
      <AppText variant="caption">
        Nhóm dùng để phân loại nguyên liệu và lọc trong tủ.{" "}
        {isAdmin
          ? "Bạn quản lý cả danh mục hệ thống lẫn danh mục riêng của mình."
          : "Bạn có thể tạo danh mục riêng; danh mục hệ thống chỉ xem được."}
      </AppText>

      <View className="gap-3">
        <TextField
          label="Tìm danh mục"
          placeholder="Theo tên hoặc mã, ví dụ: rau"
          value={manager.keyword}
          onChangeText={manager.setKeyword}
          returnKeyType="search"
        />

        <Button title="Thêm danh mục" onPress={() => form.open()} />
      </View>

      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <AppText variant="label">Danh mục ({manager.total})</AppText>
          {manager.isRefreshing && (
            <ActivityIndicator size="small" color={brand.DEFAULT} />
          )}
        </View>

        {manager.isInitialLoading && (
          <View className="items-center py-8">
            <ActivityIndicator size="large" color={brand.DEFAULT} />
            <AppText variant="caption" className="mt-2">
              Đang tải...
            </AppText>
          </View>
        )}

        {manager.error && (
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
                : "Bấm “Thêm danh mục” để tạo danh mục đầu tiên."
            }
          />
        )}

        {manager.items.map((category) => {
          const editable = canEdit(category);
          return (
            <Pressable
              key={category.id}
              disabled={!editable}
              onPress={() => form.open(category)}
              className="active:scale-[0.985]"
            >
              <Card className="flex-row items-center gap-3.5 p-4 shadow-sm">
                <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brandSoft dark:bg-successBg-dark">
                  <Ionicons
                    name={
                      category.system
                        ? "shield-checkmark-outline"
                        : "pricetag-outline"
                    }
                    size={20}
                    color={brand.DEFAULT}
                  />
                </View>

                <View className="flex-1 gap-1">
                  <AppText
                    variant="heading"
                    className="text-base font-semibold"
                    numberOfLines={1}
                  >
                    {category.name}
                  </AppText>
                  <View className="flex-row flex-wrap gap-2">
                    <Badge label={category.code} tone="success" />
                    {category.system && <Badge label="Hệ thống" tone="warn" />}
                  </View>
                </View>

                {editable && (
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => form.open(category)}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel={`Sửa ${category.name}`}
                      className="h-9 w-9 items-center justify-center rounded-full bg-successBg active:opacity-70 dark:bg-successBg-dark"
                    >
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
                      className="h-9 w-9 items-center justify-center rounded-full bg-dangerBg active:opacity-70 dark:bg-dangerBg-dark"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={palette.dangerInk}
                      />
                    </Pressable>
                  </View>
                )}
              </Card>
            </Pressable>
          );
        })}
      </View>

      {/* Hộp thoại thêm / sửa */}
      <Modal
        visible={form.visible}
        transparent
        animationType="slide"
        onRequestClose={form.close}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-end bg-black/40"
        >
          <Pressable
            className="flex-1"
            onPress={form.close}
            accessibilityLabel="Đóng"
          />

          <View className="gap-4 rounded-t-3xl border border-line bg-surface p-5 pb-8 dark:border-line-dark dark:bg-surface-dark">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brandSoft dark:bg-successBg-dark">
                <Ionicons
                  name={
                    form.isEditing ? "create-outline" : "add-circle-outline"
                  }
                  size={20}
                  color={brand.DEFAULT}
                />
              </View>
              <AppText variant="heading" className="flex-1">
                {form.isEditing ? "Sửa danh mục" : "Thêm danh mục"}
              </AppText>
              <Pressable
                onPress={form.close}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Đóng"
                className="h-9 w-9 items-center justify-center rounded-full bg-soft dark:bg-surface-dark"
              >
                <Ionicons name="close" size={18} color={palette.ink} />
              </Pressable>
            </View>

            {!form.isEditing && (
              <AppText variant="caption">
                {isAdmin
                  ? "Danh mục bạn tạo sẽ là danh mục chung của hệ thống, mọi người đều thấy."
                  : "Danh mục bạn tạo chỉ mình bạn thấy và dùng."}
              </AppText>
            )}

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
