import { useCallback, useMemo } from "react";
import { runAction } from "@/core/http/actionResult";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { CuisineRequest } from "@/types";
import { createCuisine, deleteCuisine, fetchCuisines, updateCuisine } from "./cuisineSlice";

export function useCuisine() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cuisine.items);
  const status = useAppSelector((s) => s.cuisine.status);

  const load = useCallback(
    (force?: boolean) =>
      runAction(() => dispatch(fetchCuisines(force)), "Không tải được danh sách ẩm thực."),
    [dispatch],
  );

  // Ba hàm dưới chỉ ADMIN gọi được; hiện chưa có màn hình dùng.
  const create = useCallback(
    (body: CuisineRequest) => runAction(() => dispatch(createCuisine(body)), "Không thể thêm ẩm thực."),
    [dispatch],
  );
  const update = useCallback(
    (id: string, body: CuisineRequest) =>
      runAction(() => dispatch(updateCuisine(id, body)), "Không thể sửa ẩm thực."),
    [dispatch],
  );
  const remove = useCallback(
    (id: string) => runAction(() => dispatch(deleteCuisine(id)), "Không thể xoá ẩm thực."),
    [dispatch],
  );

  return useMemo(
    () => ({
      items,
      isLoading: status === "loading",
      isSaving: status === "saving",
      load,
      create,
      update,
      remove,
    }),
    [items, status, load, create, update, remove],
  );
}
