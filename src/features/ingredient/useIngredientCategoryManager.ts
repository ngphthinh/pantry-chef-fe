import { useCallback, useEffect, useMemo, useState } from "react";
import { runAction } from "@/core/http/actionResult";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { IngredientCategoryRequest } from "@/types";
import {
  deleteIngredientCategory,
  fetchIngredientCategories,
  saveIngredientCategory,
} from "./ingredientSlice";

/** Bỏ dấu tiếng Việt + chữ thường, để lọc ngay trên máy ("ca" khớp "Cà"). */
const normalizeSearchText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();

/** Quản lý nhóm nguyên liệu (màn hình ADMIN): xem, lọc, thêm, sửa, xoá. Luôn tải mới khi mở màn hình. */
export function useIngredientCategoryManager() {
  const dispatch = useAppDispatch();
  const all = useAppSelector((s) => s.ingredient.categories);
  const loaded = useAppSelector((s) => s.ingredient.categoriesLoaded);
  const status = useAppSelector((s) => s.ingredient.status);

  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await runAction(
      () => dispatch(fetchIngredientCategories(true)),
      "Không tải được danh mục nguyên liệu.",
    );
    setError(result.ok ? null : result.message);
    return result;
  }, [dispatch]);

  useEffect(() => {
    void load();
  }, [load]);

  const items = useMemo(() => {
    const key = normalizeSearchText(keyword);
    if (!key) return all;
    return all.filter(
      (c) =>
        normalizeSearchText(c.name).includes(key) ||
        normalizeSearchText(c.code).includes(key),
    );
  }, [all, keyword]);

  /** `id = null` là thêm mới, có `id` là sửa. */
  const save = useCallback(
    (id: string | null, body: IngredientCategoryRequest) =>
      runAction(
        () => dispatch(saveIngredientCategory(id, body)),
        "Không lưu được danh mục.",
      ),
    [dispatch],
  );

  const remove = useCallback(
    (id: string) =>
      runAction(
        () => dispatch(deleteIngredientCategory(id)),
        "Không xoá được danh mục.",
      ),
    [dispatch],
  );

  const loading = status === "loadingCategories";

  return useMemo(
    () => ({
      items,
      total: all.length,
      keyword,
      setKeyword,
      error,
      // Lần đầu chưa có gì để hiện thì hiện khung chờ; các lần sau giữ danh sách cũ và tải ngầm.
      isInitialLoading: loading && !loaded,
      isRefreshing: loading && loaded,
      isEmpty: loaded && !error && items.length === 0,
      hasFilter: keyword.trim().length > 0,
      reload: load,
      save,
      remove,
    }),
    [items, all.length, keyword, error, loading, loaded, load, save, remove],
  );
}
