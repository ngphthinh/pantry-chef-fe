import { useCallback, useMemo, useState } from "react";
import { confirmDialog } from "@/components/ui/dialogs";
import { runAction } from "@/core/http/actionResult";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { ShoppingListResponse } from "@/types";
import { createShoppingList, deleteShoppingList, fetchShoppingLists } from "./shoppingSlice";

/** Danh sách các danh sách mua sắm (màn `shopping/index`). */
export function useShopping() {
  const dispatch = useAppDispatch();
  const lists = useAppSelector((s) => s.shopping.lists);
  const hasNext = useAppSelector((s) => s.shopping.hasNext);
  const status = useAppSelector((s) => s.shopping.status);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await runAction(() => dispatch(fetchShoppingLists()), "Không tải được danh sách mua sắm.");
    setLoadError(result.ok ? null : result.message);
    return result;
  }, [dispatch]);

  const loadMore = useCallback(async () => {
    const result = await runAction(() => dispatch(fetchShoppingLists(true)), "Không tải thêm được.");
    setLoadError(result.ok ? null : result.message);
    return result;
  }, [dispatch]);

  const create = useCallback(
    (name: string) => runAction(() => dispatch(createShoppingList(name)), "Không thể tạo danh sách."),
    [dispatch],
  );

  /** Hỏi xác nhận rồi mới xoá. Trả `null` nếu người dùng huỷ. */
  const confirmAndRemove = useCallback(
    async (list: ShoppingListResponse) => {
      const confirmed = await confirmDialog({
        title: "Xoá danh sách",
        message: `Xoá “${list.name}” và toàn bộ mục bên trong?`,
        confirmText: "Xoá",
        destructive: true,
      });
      if (!confirmed) return null;
      return runAction(() => dispatch(deleteShoppingList(list.id)), "Không thể xoá danh sách.");
    },
    [dispatch],
  );

  return useMemo(
    () => ({
      lists,
      hasNext,
      isLoading: status === "loading",
      isLoadingMore: status === "loadingMore",
      isSaving: status === "saving",
      loadError,
      load,
      loadMore,
      create,
      confirmAndRemove,
    }),
    [lists, hasNext, status, loadError, load, loadMore, create, confirmAndRemove],
  );
}
