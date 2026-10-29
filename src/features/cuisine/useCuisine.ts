import { useCallback, useMemo, useState } from "react";
import { confirmDialog } from "@/components/ui/dialogs";
import { runAction, type ActionResult } from "@/core/http/actionResult";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { CuisineRequest, CuisineResponse } from "@/types";
import { createCuisine, deleteCuisine, fetchCuisines, updateCuisine } from "./cuisineSlice";

/** BE trả 409 khi trùng mã (thêm/sửa) hoặc khi ẩm thực đang được công thức dùng (xoá). */
const CONFLICT_STATUS = 409;

const explainConflict = <T,>(result: ActionResult<T>, message: string): ActionResult<T> =>
  !result.ok && result.status === CONFLICT_STATUS ? { ...result, message } : result;

export function useCuisine() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.cuisine.items);
  const status = useAppSelector((s) => s.cuisine.status);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(
    async (force?: boolean) => {
      const result = await runAction(() => dispatch(fetchCuisines(force)), "Không tải được danh sách ẩm thực.");
      setLoadError(result.ok ? null : result.message);
      return result;
    },
    [dispatch],
  );

  // Ba hàm dưới chỉ ADMIN gọi được (màn admin/cuisine).
  const create = useCallback(
    async (body: CuisineRequest) =>
      explainConflict(
        await runAction(() => dispatch(createCuisine(body)), "Không thể thêm ẩm thực."),
        "Mã ẩm thực này đã tồn tại.",
      ),
    [dispatch],
  );

  const update = useCallback(
    async (id: string, body: CuisineRequest) =>
      explainConflict(
        await runAction(() => dispatch(updateCuisine(id, body)), "Không thể sửa ẩm thực."),
        "Mã ẩm thực này đã tồn tại.",
      ),
    [dispatch],
  );

  const remove = useCallback(
    async (id: string) =>
      explainConflict(
        await runAction(() => dispatch(deleteCuisine(id)), "Không thể xoá ẩm thực."),
        "Không thể xoá vì ẩm thực này đang được công thức sử dụng.",
      ),
    [dispatch],
  );

  /** Hỏi xác nhận rồi mới xoá. Trả `null` nếu người dùng huỷ. */
  const confirmAndRemove = useCallback(
    async (cuisine: CuisineResponse) => {
      const confirmed = await confirmDialog({
        title: "Xoá ẩm thực",
        message: `Xoá “${cuisine.name}”? Không xoá được nếu đang có công thức sử dụng.`,
        confirmText: "Xoá",
        destructive: true,
      });
      return confirmed ? remove(cuisine.id) : null;
    },
    [remove],
  );

  return useMemo(
    () => ({
      items,
      isLoading: status === "loading",
      isSaving: status === "saving",
      loadError,
      load,
      create,
      update,
      remove,
      confirmAndRemove,
    }),
    [items, status, loadError, load, create, update, remove, confirmAndRemove],
  );
}
