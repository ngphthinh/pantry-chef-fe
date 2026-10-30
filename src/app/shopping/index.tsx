import { useCallback } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter, type Href } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageScreen } from "@/components/ui/PageScreen";
import { TextField } from "@/components/ui/TextField";
import { showAlert } from "@/components/ui/dialogs";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { useShopping } from "@/features/shopping/useShopping";
import { useShoppingListForm } from "@/features/shopping/useShoppingListForm";
import type { ShoppingListResponse } from "@/types";

export default function ShoppingListsScreen() {
  const router = useRouter();
  const { palette, brand } = useAppTheme();
  const { lists, hasNext, isLoading, isLoadingMore, loadError, load, loadMore, create, confirmAndRemove } =
    useShopping();
  const form = useShoppingListForm(create);

  // Tải lại mỗi lần quay về màn hình này (ví dụ sau khi xoá danh sách ở màn chi tiết).
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const handleCreate = async () => {
    const result = await form.submit();
    if (result.ok) router.push(`/shopping/${result.data.id}` as Href);
  };

  const handleDelete = async (list: ShoppingListResponse) => {
    const result = await confirmAndRemove(list);
    if (result && !result.ok) showAlert("Lỗi", result.message);
  };

  return (
    <PageScreen title="Danh sách mua sắm">
      <Card className="gap-3 p-4">
        <TextField
          label="Tạo danh sách mới"
          placeholder="Ví dụ: Đi chợ cuối tuần"
          autoCapitalize="sentences"
          returnKeyType="done"
          value={form.name}
          onChangeText={form.setName}
          onSubmitEditing={() => void handleCreate()}
          error={form.error}
        />
        <Button title="Tạo danh sách" loading={form.isSubmitting} onPress={() => void handleCreate()} />
      </Card>

      {loadError ? (
        <Card className="items-center gap-3 p-4">
          <AppText variant="error" className="text-center">
            {loadError}
          </AppText>
          <Button title="Thử lại" variant="outline" onPress={() => void load()} className="self-stretch" />
        </Card>
      ) : null}

      {isLoading && lists.length === 0 ? <ActivityIndicator color={brand} className="py-6" /> : null}

      {!isLoading && !loadError && lists.length === 0 ? (
        <EmptyState
          icon="cart-outline"
          title="Chưa có danh sách nào"
          message="Tạo danh sách đầu tiên để ghi lại những thứ cần mua."
        />
      ) : null}

      {lists.map((list) => (
        <Pressable key={list.id} onPress={() => router.push(`/shopping/${list.id}` as Href)}>
          <Card className="flex-row items-center gap-3 p-4">
            <Ionicons name="cart-outline" size={22} color={brand} />
            <AppText className="flex-1 font-bold" numberOfLines={1}>
              {list.name}
            </AppText>
            <Pressable
              onPress={() => void handleDelete(list)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={`Xoá ${list.name}`}
            >
              <Ionicons name="trash-outline" size={20} color={palette.dangerInk} />
            </Pressable>
            <Ionicons name="chevron-forward" size={18} color={palette.muted} />
          </Card>
        </Pressable>
      ))}

      {hasNext ? (
        <Button
          variant="outline"
          title={isLoadingMore ? "Đang tải..." : "Xem thêm"}
          disabled={isLoadingMore}
          onPress={() => void loadMore()}
        />
      ) : null}
    </PageScreen>
  );
}
