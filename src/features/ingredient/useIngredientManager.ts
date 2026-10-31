import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { runAction } from "@/core/http/actionResult";
import { useAdminAccess } from "@/features/admin/useAdminAccess";
import { useAppDispatch } from "@/store/hooks";
import type { IngredientResponse } from "@/types";
import { deleteIngredient, searchIngredients } from "./ingredientSlice";

type ListStatus = "idle" | "loading" | "loadingMore";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 500;

/**
 * Quản lý nguyên liệu: xem (hệ thống + của mình), tìm, lọc theo nhóm, sửa, xoá.
 * Danh sách giữ trong hook (không lưu store) vì mỗi màn hình có từ khoá riêng.
 */
export function useIngredientManager() {
  const dispatch = useAppDispatch();
  const { isAdmin } = useAdminAccess();

  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [items, setItems] = useState<IngredientResponse[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<ListStatus>("loading");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadTick, setReloadTick] = useState(0);

  // Mỗi lần tải lại tăng số này; phản hồi của lần cũ về trễ thì bị bỏ qua.
  const requestId = useRef(0);

  const fetchPage = useCallback(
    (cursor?: string) =>
      runAction(
        () =>
          dispatch(
            searchIngredients({
              q: keyword,
              categoryId,
              cursor,
              size: PAGE_SIZE,
            }),
          ),
        "Không tải được danh sách nguyên liệu.",
      ),
    [dispatch, keyword, categoryId],
  );

  // Đổi từ khoá / nhóm / bấm tải lại thì tải lại từ trang đầu; gõ từ khoá có debounce.
  useEffect(() => {
    const id = ++requestId.current;
    setStatus("loading");
    setError(null);

    const timer = setTimeout(
      async () => {
        const result = await fetchPage();
        if (id !== requestId.current) return;
        setStatus("idle");
        if (result.ok) {
          setItems(result.data.content);
          setHasNext(result.data.hasNext);
          setNextCursor(result.data.nextCursor ?? undefined);
          setLoaded(true);
        } else {
          setError(result.message);
        }
      },
      keyword.trim() ? SEARCH_DEBOUNCE_MS : 0,
    );

    return () => clearTimeout(timer);
  }, [fetchPage, keyword, reloadTick]);

  const loadMore = useCallback(async () => {
    if (!hasNext || !nextCursor || status !== "idle") return;
    const id = requestId.current;
    setStatus("loadingMore");
    const result = await fetchPage(nextCursor);
    if (id !== requestId.current) return;
    setStatus("idle");
    if (result.ok) {
      setItems((prev) => [...prev, ...result.data.content]);
      setHasNext(result.data.hasNext);
      setNextCursor(result.data.nextCursor ?? undefined);
    } else {
      setError(result.message);
    }
  }, [fetchPage, hasNext, nextCursor, status]);

  const reload = useCallback(() => setReloadTick((t) => t + 1), []);

  const remove = useCallback(
    async (id: string) => {
      const result = await runAction(
        () => dispatch(deleteIngredient(id)),
        "Không xoá được nguyên liệu.",
      );
      if (result.ok) setItems((prev) => prev.filter((i) => i.id !== id));
      return result;
    },
    [dispatch],
  );

  /** Khớp BE: nguyên liệu hệ thống chỉ ADMIN sửa / xoá; nguyên liệu của mình thì ai cũng được. */
  const canEdit = useCallback(
    (ingredient: IngredientResponse) => isAdmin || !ingredient.system,
    [isAdmin],
  );

  return useMemo(
    () => ({
      items,
      keyword,
      setKeyword,
      categoryId,
      setCategoryId,
      error,
      hasNext,
      hasFilter: keyword.trim().length > 0 || categoryId !== undefined,
      isInitialLoading: status === "loading" && !loaded,
      isRefreshing: status === "loading" && loaded,
      isLoadingMore: status === "loadingMore",
      isEmpty: loaded && status === "idle" && !error && items.length === 0,
      isAdmin,
      canEdit,
      loadMore,
      reload,
      remove,
    }),
    [
      items,
      keyword,
      categoryId,
      error,
      hasNext,
      status,
      loaded,
      isAdmin,
      canEdit,
      loadMore,
      reload,
      remove,
    ],
  );
}
