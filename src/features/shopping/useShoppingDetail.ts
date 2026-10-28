import { useCallback, useMemo, useState } from "react";
import { confirmDialog } from "@/components/ui/dialogs";
import { runAction } from "@/core/http/actionResult";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ShoppingItemStatus, type ShoppingItemCreateRequest, type ShoppingItemResponse } from "@/types";
import { formatQuantity } from "@/features/unit/unitOptions";
import type { ShoppingItemPatch } from "./shoppingService";
import {
  addShoppingItem,
  deleteShoppingItem,
  deleteShoppingList,
  fetchShoppingListDetail,
  renameShoppingList,
  toggleShoppingItem,
  updateShoppingItem,
} from "./shoppingSlice";

/** Mục kèm nhãn số lượng đã định dạng sẵn ("2 kg") để màn hình chỉ việc hiển thị. */
export interface ShoppingItemView extends ShoppingItemResponse {
  quantityLabel: string;
  bought: boolean;
}

const toView = (item: ShoppingItemResponse): ShoppingItemView => ({
  ...item,
  quantityLabel: formatQuantity(item.quantity, item.unit),
  bought: item.status === ShoppingItemStatus.BOUGHT,
});

/** Chi tiết một danh sách mua sắm (màn `shopping/[id]`). */
export function useShoppingDetail(listId: string) {
  const dispatch = useAppDispatch();
  const stored = useAppSelector((s) => s.shopping.detail);
  const status = useAppSelector((s) => s.shopping.status);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Store giữ một chi tiết duy nhất; chỉ trả về khi đúng danh sách đang xem.
  const detail = stored?.id === listId ? stored : null;

  const load = useCallback(async () => {
    const result = await runAction(
      () => dispatch(fetchShoppingListDetail(listId)),
      "Không tải được danh sách mua sắm.",
    );
    setLoadError(result.ok ? null : result.message);
    return result;
  }, [dispatch, listId]);

  const rename = useCallback(
    (name: string) => runAction(() => dispatch(renameShoppingList(listId, name)), "Không thể đổi tên."),
    [dispatch, listId],
  );

  /** Hỏi xác nhận rồi mới xoá cả danh sách. Trả `null` nếu người dùng huỷ. */
  const confirmAndRemoveList = useCallback(async () => {
    const confirmed = await confirmDialog({
      title: "Xoá danh sách",
      message: "Toàn bộ mục trong danh sách sẽ bị xoá.",
      confirmText: "Xoá",
      destructive: true,
    });
    if (!confirmed) return null;
    return runAction(() => dispatch(deleteShoppingList(listId)), "Không thể xoá danh sách.");
  }, [dispatch, listId]);

  const addItem = useCallback(
    (body: ShoppingItemCreateRequest) =>
      runAction(() => dispatch(addShoppingItem(listId, body)), "Không thể thêm mục."),
    [dispatch, listId],
  );

  const updateItem = useCallback(
    (item: ShoppingItemResponse, patch: ShoppingItemPatch) =>
      runAction(() => dispatch(updateShoppingItem(listId, item, patch)), "Không thể cập nhật mục."),
    [dispatch, listId],
  );

  const toggleItem = useCallback(
    (item: ShoppingItemResponse) =>
      runAction(() => dispatch(toggleShoppingItem(listId, item)), "Không thể đánh dấu mục."),
    [dispatch, listId],
  );

  /** Hỏi xác nhận rồi mới xoá mục. Trả `null` nếu người dùng huỷ. */
  const confirmAndRemoveItem = useCallback(
    async (item: ShoppingItemResponse) => {
      const confirmed = await confirmDialog({
        title: "Xoá mục",
        message: `Xoá “${item.name}” khỏi danh sách?`,
        confirmText: "Xoá",
        destructive: true,
      });
      if (!confirmed) return null;
      return runAction(() => dispatch(deleteShoppingItem(listId, item.id)), "Không thể xoá mục.");
    },
    [dispatch, listId],
  );

  const { pendingItems, boughtItems } = useMemo(() => {
    const items = detail?.items ?? [];
    return {
      pendingItems: items.filter((i) => i.status !== ShoppingItemStatus.BOUGHT).map(toView),
      boughtItems: items.filter((i) => i.status === ShoppingItemStatus.BOUGHT).map(toView),
    };
  }, [detail]);

  const totalCount = pendingItems.length + boughtItems.length;
  /** 0–100 cho thanh tiến độ. */
  const progressPercent = totalCount === 0 ? 0 : (boughtItems.length / totalCount) * 100;

  return useMemo(
    () => ({
      detail,
      pendingItems,
      boughtItems,
      totalCount,
      boughtCount: boughtItems.length,
      progressPercent,
      isLoading: status === "loadingDetail",
      isSaving: status === "saving",
      loadError,
      load,
      rename,
      confirmAndRemoveList,
      addItem,
      updateItem,
      toggleItem,
      confirmAndRemoveItem,
    }),
    [
      detail,
      pendingItems,
      boughtItems,
      totalCount,
      progressPercent,
      status,
      loadError,
      load,
      rename,
      confirmAndRemoveList,
      addItem,
      updateItem,
      toggleItem,
      confirmAndRemoveItem,
    ],
  );
}
