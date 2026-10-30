import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageScreen } from "@/components/ui/PageScreen";
import { TextField } from "@/components/ui/TextField";
import { cn } from "@/components/ui/cn";
import { showAlert } from "@/components/ui/dialogs";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { useShoppingDetail, type ShoppingItemView } from "@/features/shopping/useShoppingDetail";
import { useShoppingItemForm } from "@/features/shopping/useShoppingItemForm";
import { useShoppingListForm } from "@/features/shopping/useShoppingListForm";
import { UNIT_OPTIONS } from "@/features/unit/unitOptions";

export default function ShoppingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { palette, brand } = useAppTheme();
  const shopping = useShoppingDetail(id);
  const itemForm = useShoppingItemForm(shopping);
  const renameForm = useShoppingListForm(shopping.rename);
  const [renaming, setRenaming] = useState(false);

  const { load } = shopping;
  useEffect(() => {
    void load();
  }, [load]);

  const startRename = () => {
    renameForm.reset(shopping.detail?.name ?? "");
    setRenaming(true);
  };

  const handleRename = async () => {
    const result = await renameForm.submit();
    if (result.ok) setRenaming(false);
  };

  const handleToggle = async (item: ShoppingItemView) => {
    const result = await shopping.toggleItem(item);
    if (!result.ok) showAlert("Lỗi", result.message);
  };

  const handleRemoveItem = async (item: ShoppingItemView) => {
    const result = await shopping.confirmAndRemoveItem(item);
    if (result && !result.ok) showAlert("Lỗi", result.message);
  };

  const handleRemoveList = async () => {
    const result = await shopping.confirmAndRemoveList();
    if (!result) return;
    if (result.ok) router.back();
    else showAlert("Lỗi", result.message);
  };

  const renderItem = (item: ShoppingItemView, index: number) => {
    const { bought } = item;
    return (
      <View
        key={item.id}
        className={cn("flex-row items-center gap-3 px-4 py-3", index > 0 && "border-t border-line dark:border-line-dark")}
      >
        <Pressable
          onPress={() => void handleToggle(item)}
          hitSlop={8}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: bought }}
          accessibilityLabel={item.name}
        >
          <Ionicons name={bought ? "checkbox" : "square-outline"} size={24} color={bought ? brand : palette.muted} />
        </Pressable>
        <Pressable className="flex-1" onPress={() => itemForm.startEdit(item)}>
          <AppText className={cn("font-semibold", bought && "line-through opacity-60")}>{item.name}</AppText>
          {item.quantityLabel ? <AppText variant="caption">{item.quantityLabel}</AppText> : null}
        </Pressable>
        <Pressable
          onPress={() => void handleRemoveItem(item)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Xoá ${item.name}`}
        >
          <Ionicons name="trash-outline" size={20} color={palette.dangerInk} />
        </Pressable>
      </View>
    );
  };

  return (
    <PageScreen
      title={shopping.detail?.name ?? "Danh sách mua sắm"}
      right={
        shopping.detail ? (
          <Pressable onPress={startRename} hitSlop={10} accessibilityRole="button" accessibilityLabel="Đổi tên danh sách">
            <Ionicons name="create-outline" size={22} color={brand} />
          </Pressable>
        ) : null
      }
    >
      {renaming ? (
        <Card className="gap-3 p-4">
          <TextField
            label="Tên danh sách"
            autoCapitalize="sentences"
            value={renameForm.name}
            onChangeText={renameForm.setName}
            error={renameForm.error}
          />
          <View className="flex-row gap-3">
            <Button title="Huỷ" variant="outline" className="flex-1" onPress={() => setRenaming(false)} />
            <Button title="Lưu" className="flex-1" loading={renameForm.isSubmitting} onPress={() => void handleRename()} />
          </View>
        </Card>
      ) : null}

      {shopping.isLoading && !shopping.detail ? <ActivityIndicator color={brand} className="py-6" /> : null}

      {shopping.loadError && !shopping.detail ? (
        <Card className="items-center gap-3 p-4">
          <AppText variant="error" className="text-center">
            {shopping.loadError}
          </AppText>
          <Button title="Thử lại" variant="outline" onPress={() => void load()} className="self-stretch" />
        </Card>
      ) : null}

      {shopping.detail ? (
        <>
          <Card className="gap-3 p-4">
            <AppText variant="label">{itemForm.editing ? "Sửa mục" : "Thêm mục"}</AppText>
            <TextField
              label="Tên"
              placeholder="Ví dụ: Trứng gà"
              autoCapitalize="sentences"
              value={itemForm.values.name}
              onChangeText={(t) => itemForm.setField("name", t)}
              error={itemForm.errors.name}
            />
            <TextField
              label="Số lượng (tuỳ chọn)"
              keyboardType="decimal-pad"
              value={itemForm.values.quantity}
              onChangeText={(t) => itemForm.setField("quantity", t)}
              error={itemForm.errors.quantity}
            />
            <ChipGroup
              horizontal
              options={UNIT_OPTIONS}
              value={itemForm.values.unit}
              onChange={(unit) => itemForm.setField("unit", unit)}
            />
            {itemForm.errors.submit ? <AppText variant="error">{itemForm.errors.submit}</AppText> : null}
            <View className="flex-row gap-3">
              {itemForm.editing ? (
                <Button title="Huỷ" variant="outline" className="flex-1" onPress={itemForm.cancelEdit} />
              ) : null}
              <Button
                title={itemForm.editing ? "Lưu thay đổi" : "Thêm"}
                className="flex-1"
                loading={itemForm.isSubmitting}
                onPress={() => void itemForm.submit()}
              />
            </View>
          </Card>

          {shopping.totalCount === 0 ? (
            <EmptyState icon="basket-outline" title="Danh sách đang trống" message="Thêm mục đầu tiên ở phía trên." />
          ) : (
            <View className="gap-1">
              <AppText variant="caption">
                Đã mua {shopping.boughtCount}/{shopping.totalCount}
              </AppText>
              <View className="h-2 overflow-hidden rounded-full bg-soft dark:bg-soft-dark">
                <View
                  className="h-2 rounded-full bg-brand"
                  style={{ width: `${shopping.progressPercent}%` }}
                />
              </View>
            </View>
          )}

          {shopping.pendingItems.length > 0 ? (
            <View className="gap-2">
              <AppText variant="label">Cần mua</AppText>
              <Card className="overflow-hidden">{shopping.pendingItems.map(renderItem)}</Card>
            </View>
          ) : null}

          {shopping.boughtItems.length > 0 ? (
            <View className="gap-2">
              <AppText variant="label">Đã mua</AppText>
              <Card className="overflow-hidden">{shopping.boughtItems.map(renderItem)}</Card>
            </View>
          ) : null}

          <Button title="Xoá danh sách" variant="danger" onPress={() => void handleRemoveList()} />
        </>
      ) : null}
    </PageScreen>
  );
}
