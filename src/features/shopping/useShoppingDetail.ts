import { useCallback, useMemo, useState } from "react";
import { confirmDialog } from "@/components/ui/dialogs";
import { runAction, type ActionResult } from "@/core/http/actionResult";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ShoppingItemStatus, type ShoppingItemCreateRequest, type ShoppingItemResponse } from "@/types";
import { formatQuantity } from "@/features/unit/unitOptions";
import type { ShoppingItemPatch } from "./shoppingService";
import {
  addShoppingItem,
  deleteShoppingItem,
  deleteShoppingList,
  fetchShoppingListDetail,
  moveShoppingItemsToPantry,
  renameShoppingList,
  toggleShoppingItem,
  updateShoppingItem,
} from "./shoppingSlice";

/** Kết quả chuyển vào tủ: số mục đã vào tủ và số mục còn lại vì chưa có trong danh mục nguyên liệu. */
export interface MoveToPantrySummary {
  moved: number;
  kept: number;
  /** Câu thông báo dựng sẵn để màn hình chỉ việc hiển thị. */
  message: string;
}

const describeMove = (moved: number, kept: number): string => {
  if (moved === 0) return "Chưa mục nào khớp với danh mục nguyên liệu nên chưa chuyển được vào tủ.";
  if (kept === 0) return `Đã chuyển ${moved} mục vào tủ.`;
  return `Đã chuyển ${moved} mục vào tủ. ${kept} mục chưa có trong danh mục nguyên liệu nên được giữ lại trong danh sách.`;
};

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

  /**
   * Chuyển các mục đã mua vào tủ. Mục có tên khớp danh mục nguyên liệu thì vào tủ và rời danh sách,
   * mục không khớp được giữ lại để người dùng tự xử lý.
   */
  const moveBoughtToPantry = useCallback(async (): Promise<ActionResult<MoveToPantrySummary>> => {
    const boughtBefore = detail?.items.filter((i) => i.status === ShoppingItemStatus.BOUGHT).length ?? 0;
    const result = await runAction(
      () => dispatch(moveShoppingItemsToPantry(listId)),
      "Không thể chuyển vào tủ.",
    );
    if (!result.ok) return result;
    const moved = result.data.length;
    const kept = Math.max(boughtBefore - moved, 0);
    return { ok: true, data: { moved, kept, message: describeMove(moved, kept) } };
  }, [detail, dispatch, listId]);

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
      canMoveToPantry: boughtItems.length > 0,
      isLoading: status === "loadingDetail",
      isSaving: status === "saving",
      loadError,
      load,
      rename,
      moveBoughtToPantry,
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
      moveBoughtToPantry,
      confirmAndRemoveList,
      addItem,
      updateItem,
      toggleItem,
      confirmAndRemoveItem,
    ],
  );
}
