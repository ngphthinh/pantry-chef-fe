import { useEffect } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListScreen } from "@/components/ui/ListScreen";
import { PageHeader } from "@/components/ui/PageHeader";
import { TextField } from "@/components/ui/TextField";
import { showAlert } from "@/components/ui/dialogs";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { useShopping } from "@/features/shopping/useShopping";
import { useShoppingListForm } from "@/features/shopping/useShoppingListForm";
import type { ShoppingListResponse } from "@/types";

export default function ShoppingListsScreen() {
  const router = useRouter();
  const { palette, brand } = useAppTheme();
  const {
    lists,
    isLoading,
    isLoadingMore,
    loadError,
    load,
    loadMore,
    create,
    confirmAndRemove,
  } = useShopping();
  const form = useShoppingListForm(create);

  // Danh sách được cập nhật trực tiếp khi tạo / đổi tên / xoá, nên chỉ cần tải khi mở màn hình.
  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async () => {
    const result = await form.submit();
    if (result.ok) router.push(`/shopping/${result.data.id}` as Href);
  };

  const handleDelete = async (list: ShoppingListResponse) => {
    const result = await confirmAndRemove(list);
    if (result && !result.ok) showAlert("Lỗi", result.message);
  };

  const header = (
    <View className="gap-4">
      <PageHeader title="Danh sách mua sắm" />

      {/* Create card */}
      <Card className="gap-3 bg-brandSoft/50 p-4 shadow-sm dark:bg-surface-dark">
        <View className="flex-row items-center gap-3">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-white/70 dark:bg-soft-dark">
            <Ionicons name="add-circle" size={24} color={brand} />
          </View>
          <View className="flex-1">
            <AppText variant="heading" className="text-base">
              Tạo danh sách mới
            </AppText>
            <AppText variant="caption">Ghi lại những thứ cần mua</AppText>
          </View>
        </View>
        <TextField
          label="Tên danh sách"
          placeholder="Ví dụ: Đi chợ cuối tuần"
          autoCapitalize="sentences"
          returnKeyType="done"
          value={form.name}
          onChangeText={form.setName}
          onSubmitEditing={() => void handleCreate()}
          error={form.error}
        />
        <Button
          title="Tạo danh sách"
          loading={form.isSubmitting}
          onPress={() => void handleCreate()}
        />
      </Card>

      {loadError ? (
        <Card className="items-center gap-3 p-5 shadow-sm">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-dangerBg dark:bg-dangerBg-dark">
            <Ionicons name="alert-circle" size={28} color={palette.dangerInk} />
          </View>
          <AppText variant="error" className="text-center">
            {loadError}
          </AppText>
          <Button
            title="Thử lại"
            variant="outline"
            onPress={() => void load()}
            className="self-stretch"
          />
        </Card>
      ) : null}

      {isLoading && lists.length === 0 ? (
        <View className="items-center py-10">
          <ActivityIndicator size="large" color={brand} />
          <AppText variant="caption" className="mt-3">
            Đang tải danh sách...
          </AppText>
        </View>
      ) : null}

      {lists.length > 0 ? (
        <View className="flex-row items-center justify-between px-1">
          <AppText
            variant="label"
            className="text-xs font-bold uppercase tracking-wider text-muted">
            Danh sách của bạn
          </AppText>
          <View className="rounded-full bg-brandSoft px-2.5 py-1 dark:bg-surface-dark">
            <AppText className="text-xs font-bold text-brand">
              {lists.length}
            </AppText>
          </View>
        </View>
      ) : null}
    </View>
  );

  // Chỉ truyền khi đã tải xong, nếu không sẽ nháy "chưa có danh sách" lúc đang tải.
  const empty =
    !isLoading && !loadError ? (
      <EmptyState
        icon="cart-outline"
        title="Chưa có danh sách nào"
        message="Tạo danh sách đầu tiên để ghi lại những thứ cần mua."
      />
    ) : null;

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ListScreen
        data={lists}
        keyExtractor={(list) => list.id}
        header={header}
        empty={empty}
        onEndReached={() => void loadMore()}
        isLoadingMore={isLoadingMore}
        renderItem={({ item: list }) => (
          <Pressable
            className="active:scale-[0.98]"
            onPress={() => router.push(`/shopping/${list.id}` as Href)}>
            <Card className="flex-row items-center gap-3 p-3.5 shadow-sm">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brandSoft dark:bg-surface-dark">
                <Ionicons name="cart" size={22} color={brand} />
              </View>

              <View className="flex-1">
                <AppText className="font-bold" numberOfLines={1}>
                  {list.name}
                </AppText>
                <AppText variant="caption">Chạm để xem chi tiết</AppText>
              </View>

              <Pressable
                onPress={() => void handleDelete(list)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={`Xoá ${list.name}`}
                className="h-9 w-9 items-center justify-center rounded-full bg-dangerBg active:scale-90 dark:bg-dangerBg-dark">
                <Ionicons
                  name="trash-outline"
                  size={18}
                  color={palette.dangerInk}
                />
              </Pressable>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={palette.muted}
              />
            </Card>
          </Pressable>
        )}
      />
    </KeyboardAvoidingView>
  );
}

// ShoppingListRow (thay ROW_COLORS cũ)
function ShoppingListRow({
  list,
  index,
  onPress,
  onDelete,
}: {
  list: ShoppingListResponse;
  index: number;
  onPress: () => void;
  onDelete: () => void;
}) {
  const { palette, brand } = useAppTheme();
  const rowColors = [brand, palette.warnInk, palette.successInk, palette.muted];
  const color = rowColors[index % rowColors.length];
  const initial = (list.name.trim()[0] ?? "?").toUpperCase();

  return (
    <Pressable className="active:scale-[0.98]" onPress={onPress}>
      <Card className="flex-row items-center overflow-hidden shadow-sm">
        <View
          className="self-stretch"
          style={{ width: 5, backgroundColor: color }}
        />

        <View className="flex-1 flex-row items-center gap-3 p-3.5">
          <View
            className="h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${color}22` }}>
            <AppText className="text-lg font-extrabold" style={{ color }}>
              {initial}
            </AppText>
          </View>

          <View className="flex-1 gap-0.5">
            <AppText variant="heading" className="text-base" numberOfLines={1}>
              {list.name}
            </AppText>
            <View className="flex-row items-center gap-1">
              <Ionicons name="cart-outline" size={13} color={palette.muted} />
              <AppText variant="caption">Danh sách mua sắm</AppText>
            </View>
          </View>

          <Pressable
            onPress={onDelete}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={`Xoá ${list.name}`}
            className="h-9 w-9 items-center justify-center rounded-full bg-dangerBg active:scale-90 dark:bg-dangerBg-dark">
            <Ionicons
              name="trash-outline"
              size={17}
              color={palette.dangerInk}
            />
          </Pressable>

          <Ionicons name="chevron-forward" size={18} color={palette.muted} />
        </View>
      </Card>
    </Pressable>
  );
}
