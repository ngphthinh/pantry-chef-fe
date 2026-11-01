import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageScreen } from "@/components/ui/PageScreen";
import { TextField } from "@/components/ui/TextField";
import { cn } from "@/components/ui/cn";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { confirmAction, notify } from "@/core/ui/dialogs";
import { useAdminAccess } from "@/features/admin/useAdminAccess";
import { useIngredientCategoryForm } from "@/features/ingredient/useIngredientCategoryForm";
import { useIngredientCategoryManager } from "@/features/ingredient/useIngredientCategoryManager";
import type { IngredientCategoryResponse } from "@/types";

export default function IngredientCategoriesScreen() {
  const { palette, brand } = useAppTheme();
  const { isAdmin } = useAdminAccess();
  const manager = useIngredientCategoryManager();
  const form = useIngredientCategoryForm(manager.save);

  // Khớp BE: danh mục hệ thống chỉ ADMIN sửa / xoá.
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
      <View className="gap-4 pb-10">
        {/* Search + add */}
        <View className="flex-row items-center gap-3">
          <View className="flex-1 flex-row items-center gap-2 rounded-full border border-line bg-surface px-4 dark:border-line-dark dark:bg-surface-dark">
            <Ionicons name="search" size={18} color={palette.muted} />
            <TextInput
              value={manager.keyword}
              onChangeText={manager.setKeyword}
              placeholder="Tìm theo tên hoặc mã"
              placeholderTextColor={palette.muted}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              className="flex-1 py-3 text-base text-ink dark:text-ink-dark"
            />
            {manager.keyword ? (
              <Pressable hitSlop={10} onPress={() => manager.setKeyword("")}>
                <Ionicons name="close-circle" size={18} color={palette.muted} />
              </Pressable>
            ) : null}
          </View>

          <Pressable
            onPress={() => form.open()}
            accessibilityRole="button"
            accessibilityLabel="Thêm danh mục"
            className="h-12 w-12 items-center justify-center rounded-full bg-brand shadow-md active:scale-90">
            <Ionicons name="add" size={26} color="#FFFFFF" />
          </Pressable>
        </View>

        <View className="flex-row items-center justify-between px-1">
          <AppText variant="caption" className="flex-1">
            {isAdmin
              ? "Bạn quản lý cả danh mục hệ thống và danh mục riêng."
              : "Danh mục hệ thống chỉ xem được."}
          </AppText>
          <View className="flex-row items-center gap-2">
            {manager.isRefreshing && (
              <ActivityIndicator size="small" color={brand} />
            )}
            <AppText className="text-xs font-bold text-brand">
              {manager.total} mục
            </AppText>
          </View>
        </View>

        {manager.isInitialLoading && (
          <View className="items-center py-10">
            <ActivityIndicator size="large" color={brand} />
          </View>
        )}

        {manager.error && (
          <Card className="items-center gap-3 p-5">
            <Ionicons name="alert-circle" size={28} color={palette.dangerInk} />
            <AppText variant="error" className="text-center">
              {manager.error}
            </AppText>
            <Button
              title="Thử lại"
              variant="outline"
              className="self-stretch"
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
                : "Bấm nút + để tạo danh mục đầu tiên."
            }
          />
        )}

        {manager.items.length > 0 && (
          <Card className="overflow-hidden shadow-sm">
            {manager.items.map((category, index) => {
              const editable = canEdit(category);
              return (
                <Pressable
                  key={category.id}
                  disabled={!editable}
                  onPress={() => form.open(category)}
                  className={cn(
                    "flex-row items-center gap-3 px-4 py-3.5 active:bg-soft dark:active:bg-soft-dark",
                    index > 0 && "border-t border-line dark:border-line-dark",
                  )}>
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-brandSoft dark:bg-soft-dark">
                    <Ionicons
                      name={category.system ? "pricetags" : "pricetag"}
                      size={18}
                      color={brand}
                    />
                  </View>

                  <View className="flex-1">
                    <AppText className="font-semibold" numberOfLines={1}>
                      {category.name}
                    </AppText>
                    <View className="flex-row items-center gap-1.5">
                      <AppText variant="caption">{category.code}</AppText>
                      {category.system && (
                        <>
                          <AppText variant="caption">·</AppText>
                          <Ionicons
                            name="lock-closed"
                            size={11}
                            color={palette.warnInk}
                          />
                          <AppText
                            variant="caption"
                            className="font-semibold text-warnInk dark:text-warnInk-dark">
                            Hệ thống
                          </AppText>
                        </>
                      )}
                    </View>
                  </View>

                  {editable ? (
                    <View className="flex-row items-center gap-4">
                      <Pressable
                        onPress={() => form.open(category)}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel={`Sửa ${category.name}`}>
                        <Ionicons
                          name="create-outline"
                          size={20}
                          color={palette.muted}
                        />
                      </Pressable>
                      <Pressable
                        onPress={() => void handleDelete(category)}
                        hitSlop={10}
                        accessibilityRole="button"
                        accessibilityLabel={`Xoá ${category.name}`}>
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color={palette.dangerInk}
                        />
                      </Pressable>
                    </View>
                  ) : (
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={palette.muted}
                    />
                  )}
                </Pressable>
              );
            })}
          </Card>
        )}
      </View>

      {/* Hộp thoại thêm / sửa */}
      <Modal
        visible={form.visible}
        transparent
        animationType="slide"
        onRequestClose={form.close}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1 justify-end bg-black/50">
          <Pressable
            className="flex-1"
            onPress={form.close}
            accessibilityLabel="Đóng"
          />

          <View className="gap-4 rounded-t-3xl bg-surface p-5 pb-8 dark:bg-surface-dark">
            <View className="h-1 w-10 self-center rounded-full bg-line dark:bg-line-dark" />

            <View className="flex-row items-center justify-between">
              <AppText variant="heading" className="text-lg">
                {form.isEditing ? "Sửa danh mục" : "Thêm danh mục"}
              </AppText>
              <Pressable hitSlop={10} onPress={form.close}>
                <Ionicons name="close" size={22} color={palette.muted} />
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
