import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { brand } from "@/core/theme/colors";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { confirmAction, notify } from "@/core/ui/dialogs";
import { useIngredientCategories } from "@/features/ingredient/useIngredientCategories";
import { useIngredientForm } from "@/features/ingredient/useIngredientForm";
import { useIngredientManager } from "@/features/ingredient/useIngredientManager";
import type { IngredientResponse, Unit } from "@/types";

const UNITS: Unit[] = [
  "MG",
  "G",
  "KG",
  "ML",
  "L",
  "PCS",
  "TBSP",
  "TSP",
  "CUP",
  "PINCH",
];

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      className={`rounded-full border px-3.5 py-1.5 active:opacity-70 ${
        selected
          ? "border-brand bg-successBg dark:bg-successBg-dark"
          : "border-line bg-surface dark:border-line-dark dark:bg-surface-dark"
      }`}
    >
      <AppText
        className={`text-sm font-medium ${
          selected ? "text-successInk dark:text-successInk-dark" : ""
        }`}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

/** Hộp thoại thêm / sửa. Chỉ được dựng khi mở, nên form luôn bắt đầu từ giá trị mới. */
function IngredientEditorSheet({
  ingredient,
  onClose,
  onSaved,
}: {
  ingredient?: IngredientResponse;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { palette } = useAppTheme();
  const { categories } = useIngredientCategories();
  const form = useIngredientForm({ ingredient, onCreated: onSaved });

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end bg-black/40"
      >
        <Pressable
          className="flex-1"
          onPress={onClose}
          accessibilityLabel="Đóng"
        />

        <View className="gap-4 rounded-t-3xl border border-line bg-surface p-5 pb-8 dark:border-line-dark dark:bg-surface-dark">
          <View className="flex-row items-center gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brandSoft dark:bg-successBg-dark">
              <Ionicons
                name={form.isEditing ? "create-outline" : "add-circle-outline"}
                size={20}
                color={brand.DEFAULT}
              />
            </View>
            <AppText variant="heading" className="flex-1">
              {form.isEditing ? "Sửa nguyên liệu" : "Thêm nguyên liệu"}
            </AppText>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Đóng"
              className="h-9 w-9 items-center justify-center rounded-full bg-soft dark:bg-surface-dark"
            >
              <Ionicons name="close" size={18} color={palette.ink} />
            </Pressable>
          </View>

          <ScrollView
            style={{ maxHeight: 460 }}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: 16 }}
          >
            <TextField
              label="Tên nguyên liệu"
              placeholder="Ví dụ: Cà chua"
              value={form.name}
              onChangeText={form.setName}
              maxLength={255}
              autoCapitalize="sentences"
              error={form.errors.name}
            />

            <View className="gap-2">
              <AppText variant="label">Danh mục</AppText>
              <View className="flex-row flex-wrap gap-2">
                {categories.map((category) => (
                  <Chip
                    key={category.id}
                    label={category.name}
                    selected={form.categoryId === category.id}
                    onPress={() => form.setCategoryId(category.id)}
                  />
                ))}
              </View>
              {form.errors.category ? (
                <AppText variant="error">{form.errors.category}</AppText>
              ) : null}
            </View>

            <View className="gap-2">
              <AppText variant="label">
                Đơn vị mặc định (không bắt buộc)
              </AppText>
              <View className="flex-row flex-wrap gap-2">
                {UNITS.map((unit) => (
                  <Chip
                    key={unit}
                    label={unit}
                    selected={form.unit === unit}
                    onPress={() => form.setUnit(form.unit === unit ? "" : unit)}
                  />
                ))}
              </View>
            </View>

            <TextField
              label="Mã vạch (không bắt buộc)"
              placeholder="8–14 chữ số"
              value={form.barcode}
              onChangeText={form.setBarcode}
              keyboardType="number-pad"
              maxLength={14}
              error={form.errors.barcode}
            />
          </ScrollView>

          {form.formError ? (
            <AppText variant="error">{form.formError}</AppText>
          ) : null}

          <View className="flex-row gap-3">
            <Button
              title="Huỷ"
              variant="outline"
              className="flex-1"
              disabled={form.isSubmitting}
              onPress={onClose}
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
  );
}

export default function IngredientsScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const { categories } = useIngredientCategories();
  const manager = useIngredientManager();

  // `open = false` là đóng; `ingredient` bỏ trống là thêm mới.
  const [editor, setEditor] = useState<{
    open: boolean;
    ingredient?: IngredientResponse;
  }>({ open: false });

  const closeEditor = () => setEditor({ open: false });

  const handleSaved = () => {
    closeEditor();
    manager.reload();
  };

  const handleDelete = async (ingredient: IngredientResponse) => {
    const ok = await confirmAction({
      title: "Xoá nguyên liệu",
      message: `Xoá “${ingredient.name}”?`,
      confirmText: "Xoá",
      destructive: true,
    });
    if (!ok) return;
    const result = await manager.remove(ingredient.id);
    if (!result.ok) notify("Không thể xoá", result.message);
  };

  const goBack = () =>
    router.canGoBack() ? router.back() : router.replace("/");

  const header = (
    <View className="gap-4">
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          className="h-10 w-10 items-center justify-center rounded-full bg-soft dark:bg-surface-dark"
        >
          <Ionicons name="arrow-back" size={20} color={palette.ink} />
        </Pressable>
        <View className="flex-1">
          <AppText variant="title">Nguyên liệu</AppText>
          <AppText variant="caption">
            {manager.isAdmin
              ? "Bạn quản lý cả nguyên liệu hệ thống lẫn nguyên liệu riêng của mình."
              : "Bạn có thể thêm nguyên liệu riêng; nguyên liệu hệ thống chỉ xem được."}
          </AppText>
        </View>
      </View>

      <TextField
        label="Tìm nguyên liệu"
        placeholder="Ví dụ: ca chua"
        value={manager.keyword}
        onChangeText={manager.setKeyword}
        returnKeyType="search"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 8 }}
      >
        <Chip
          label="Tất cả"
          selected={manager.categoryId === undefined}
          onPress={() => manager.setCategoryId(undefined)}
        />
        {categories.map((category) => (
          <Chip
            key={category.id}
            label={category.name}
            selected={manager.categoryId === category.id}
            onPress={() => manager.setCategoryId(category.id)}
          />
        ))}
      </ScrollView>

      <Button
        title="Thêm nguyên liệu"
        onPress={() => setEditor({ open: true })}
      />

      <View className="flex-row items-center justify-between">
        <AppText variant="label">Danh sách</AppText>
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
          <Button title="Thử lại" variant="outline" onPress={manager.reload} />
        </Card>
      )}
    </View>
  );

  const empty = manager.isEmpty ? (
    <EmptyState
      icon="nutrition-outline"
      title={
        manager.hasFilter
          ? "Không tìm thấy nguyên liệu"
          : "Chưa có nguyên liệu nào"
      }
      message={
        manager.hasFilter
          ? "Thử từ khoá hoặc danh mục khác."
          : "Bấm “Thêm nguyên liệu” để tạo nguyên liệu đầu tiên."
      }
    />
  ) : undefined;

  return (
    <Screen scroll={false}>
      <FlatList
        data={manager.items}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ListFooterComponent={
          manager.isLoadingMore ? (
            <View className="items-center p-4">
              <ActivityIndicator color={brand.DEFAULT} />
            </View>
          ) : undefined
        }
        onEndReached={() => void manager.loadMore()}
        onEndReachedThreshold={0.4}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32, gap: 12 }}
        renderItem={({ item: ingredient }) => {
          const editable = manager.canEdit(ingredient);
          return (
            <Pressable
              disabled={!editable}
              onPress={() => setEditor({ open: true, ingredient })}
              className="active:scale-[0.985]"
            >
              <Card className="flex-row items-center gap-3.5 p-4 shadow-sm">
                <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brandSoft dark:bg-successBg-dark">
                  <Ionicons
                    name="nutrition-outline"
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
                    {ingredient.name}
                  </AppText>
                  <View className="flex-row flex-wrap gap-2">
                    <Badge label={ingredient.category.name} tone="success" />
                    {ingredient.system && (
                      <Badge label="Hệ thống" tone="warn" />
                    )}
                  </View>
                  {(ingredient.defaultUnit || ingredient.barcode) && (
                    <AppText variant="caption" numberOfLines={1}>
                      {[
                        ingredient.defaultUnit &&
                          `Đơn vị: ${ingredient.defaultUnit}`,
                        ingredient.barcode && `Mã vạch: ${ingredient.barcode}`,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </AppText>
                  )}
                </View>

                {editable && (
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => setEditor({ open: true, ingredient })}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel={`Sửa ${ingredient.name}`}
                      className="h-9 w-9 items-center justify-center rounded-full bg-successBg active:opacity-70 dark:bg-successBg-dark"
                    >
                      <Ionicons
                        name="create-outline"
                        size={18}
                        color={palette.successInk}
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => void handleDelete(ingredient)}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel={`Xoá ${ingredient.name}`}
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
        }}
      />

      {editor.open && (
        <IngredientEditorSheet
          // Đổi nguyên liệu thì dựng lại form để lấy giá trị mới.
          key={editor.ingredient?.id ?? "new"}
          ingredient={editor.ingredient}
          onClose={closeEditor}
          onSaved={handleSaved}
        />
      )}
    </Screen>
  );
}
