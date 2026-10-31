import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { runAction } from "@/core/http/actionResult";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addExcludedIngredient,
  fetchExcludedIngredients,
  removeExcludedIngredient,
} from "./excludedIngredientSlice";

interface Options {
  /** Tự tải mỗi khi màn hình được focus. Tắt nếu chỉ cần đọc `items` đã có. */
  autoLoad?: boolean;
}

export function useExcludedIngredients({ autoLoad = true }: Options = {}) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.excludedIngredient.items);
  const loaded = useAppSelector((s) => s.excludedIngredient.loaded);
  const status = useAppSelector((s) => s.excludedIngredient.status);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await runAction(
      () => dispatch(fetchExcludedIngredients()),
      "Không tải được danh sách nguyên liệu loại trừ.",
    );
    setError(result.ok ? null : result.message);
    return result;
  }, [dispatch]);

  const add = useCallback(
    (name: string) =>
      runAction(() => dispatch(addExcludedIngredient(name)), "Không thể thêm nguyên liệu loại trừ."),
    [dispatch],
  );

  const remove = useCallback(
    (id: string) =>
      runAction(() => dispatch(removeExcludedIngredient(id)), "Không thể xoá nguyên liệu loại trừ."),
    [dispatch],
  );

  useFocusEffect(
    useCallback(() => {
      if (autoLoad) void load();
    }, [autoLoad, load]),
  );

  return useMemo(
    () => ({
      items,
      error,
      // Chỉ hiện "đang tải" khi chưa có dữ liệu; có rồi thì hiện danh sách cũ và cập nhật ngầm.
      isLoading: status === "loading" && !loaded,
      isSaving: status === "saving",
      load,
      add,
      remove,
    }),
    [items, error, status, loaded, load, add, remove],
  );
}
