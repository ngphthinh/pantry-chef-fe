import { useCallback, useMemo, useState } from "react";
import { confirmDialog } from "@/components/ui/dialogs";
import { runAction, type ActionResult } from "@/core/http/actionResult";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { ShoppingListDetailResponse, ShoppingListResponse } from "@/types";
import {
  createShoppingList,
  createShoppingListFromMealPlan,
  createShoppingListFromRecipe,
  deleteShoppingList,
  fetchShoppingLists,
} from "./shoppingSlice";

/** BE trả 422 khi không có gì để mua (đã đủ nguyên liệu trong tủ, hoặc công thức không có nguyên liệu). */
const NOTHING_TO_BUY_STATUS = 422;
const NOTHING_TO_BUY_MESSAGE = "Không có nguyên liệu nào cần mua.";

const explainNothingToBuy = <T,>(result: ActionResult<T>): ActionResult<T> =>
  !result.ok && result.status === NOTHING_TO_BUY_STATUS
    ? { ok: false, message: NOTHING_TO_BUY_MESSAGE, status: result.status }
    : result;

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

  /** Gọi khi cuộn tới cuối danh sách; bỏ qua nếu hết trang hoặc đang tải dở để không tải trùng một trang. */
  const loadMore = useCallback(async () => {
    if (!hasNext || status !== "idle") return;
    const result = await runAction(() => dispatch(fetchShoppingLists(true)), "Không tải thêm được.");
    setLoadError(result.ok ? null : result.message);
    return result;
  }, [dispatch, hasNext, status]);

  const create = useCallback(
    (name: string) => runAction(() => dispatch(createShoppingList(name)), "Không thể tạo danh sách."),
    [dispatch],
  );

  /** Tạo danh sách từ thực đơn: chỉ phần còn thiếu sau khi đã trừ nguyên liệu trong tủ. */
  const createFromMealPlan = useCallback(
    async (mealPlanId: string): Promise<ActionResult<ShoppingListDetailResponse>> =>
      explainNothingToBuy(
        await runAction(
          () => dispatch(createShoppingListFromMealPlan(mealPlanId)),
          "Không thể tạo danh sách từ thực đơn.",
        ),
      ),
    [dispatch],
  );

  /** Tạo danh sách từ một công thức của mình (đủ nguyên liệu, không trừ đồ trong tủ). */
  const createFromRecipe = useCallback(
    async (recipeId: string): Promise<ActionResult<ShoppingListDetailResponse>> =>
      explainNothingToBuy(
        await runAction(
          () => dispatch(createShoppingListFromRecipe(recipeId)),
          "Không thể tạo danh sách từ công thức.",
        ),
      ),
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
      createFromMealPlan,
      createFromRecipe,
      confirmAndRemove,
    }),
    [
      lists,
      hasNext,
      status,
      loadError,
      load,
      loadMore,
      create,
      createFromMealPlan,
      createFromRecipe,
      confirmAndRemove,
    ],
  );
}
