import { useCallback, useEffect, useMemo } from "react";
import { runAction } from "@/core/http/actionResult";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchIngredientCategories } from "./ingredientSlice";

/** Danh sách nhóm nguyên liệu (công khai). Tự tải một lần khi có màn hình đầu tiên dùng. */
export function useIngredientCategories() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((s) => s.ingredient.categories);
  const status = useAppSelector((s) => s.ingredient.status);

  const load = useCallback(
    (force?: boolean) =>
      runAction(
        () => dispatch(fetchIngredientCategories(force)),
        "Không tải được nhóm nguyên liệu.",
      ),
    [dispatch],
  );

  // Lỗi bỏ qua: bộ lọc theo nhóm không bắt buộc nên màn hình vẫn dùng được khi chưa có nhóm.
  useEffect(() => {
    void load();
  }, [load]);

  return useMemo(
    () => ({ categories, isLoading: status === "loadingCategories", reload: () => load(true) }),
    [categories, status, load],
  );
}
