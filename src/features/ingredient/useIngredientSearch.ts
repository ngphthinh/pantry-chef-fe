import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { runAction } from "@/core/http/actionResult";
import { useAppDispatch } from "@/store/hooks";
import type { IngredientResponse } from "@/types";
import { searchIngredients } from "./ingredientSlice";

const SEARCH_DELAY_MS = 300;

interface Options {
  categoryId?: string;
  pageSize?: number;
}

type SearchStatus = "idle" | "loading" | "loadingMore";

/**
 * Tìm nguyên liệu theo từ khoá (có độ trễ để không gọi API sau mỗi phím gõ), lọc theo nhóm,
 * phân trang cursor. Danh sách nằm trong hook nên các màn hình dùng đồng thời không ghi đè nhau.
 */
export function useIngredientSearch({ categoryId, pageSize = 20 }: Options = {}) {
  const dispatch = useAppDispatch();

  const [keyword, setKeyword] = useState("");
  const [items, setItems] = useState<IngredientResponse[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Kết quả của lần gọi cũ về sau lần gọi mới thì bỏ đi, tránh danh sách nhảy về từ khoá cũ.
  const requestId = useRef(0);

  const query = useMemo(
    () => ({ q: keyword.trim() || undefined, categoryId, size: pageSize }),
    [keyword, categoryId, pageSize],
  );

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setStatus("loading");
    setError(null);

    const result = await runAction(
      () => dispatch(searchIngredients(query)),
      "Không tìm được nguyên liệu.",
    );
    if (id !== requestId.current) return;

    if (result.ok) {
      setItems(result.data.content);
      setHasNext(result.data.hasNext);
      setNextCursor(result.data.nextCursor);
    } else {
      setItems([]);
      setHasNext(false);
      setNextCursor(null);
      setError(result.message);
    }
    setStatus("idle");
    setLoaded(true);
  }, [dispatch, query]);

  // Tải lần đầu và mỗi khi đổi từ khoá / nhóm
  useEffect(() => {
    const timer = setTimeout(() => void load(), keyword.trim() ? SEARCH_DELAY_MS : 0);
    return () => clearTimeout(timer);
  }, [keyword, load]);

  const loadMore = useCallback(async () => {
    if (!hasNext || !nextCursor || status !== "idle") return;
    const id = requestId.current;
    setStatus("loadingMore");

    const result = await runAction(
      () => dispatch(searchIngredients({ ...query, cursor: nextCursor })),
      "Không tải thêm được.",
    );
    if (id !== requestId.current) return;

    if (result.ok) {
      setItems((prev) => [...prev, ...result.data.content]);
      setHasNext(result.data.hasNext);
      setNextCursor(result.data.nextCursor);
    } else {
      setError(result.message);
    }
    setStatus("idle");
  }, [dispatch, hasNext, nextCursor, query, status]);

  const isLoading = status === "loading";

  return useMemo(
    () => ({
      items,
      keyword,
      setKeyword,
      error,
      hasNext,
      isLoading,
      isLoadingMore: status === "loadingMore",
      /** Đang tải lần đầu, chưa có dòng nào để hiển thị. */
      isInitialLoading: isLoading && items.length === 0,
      isEmpty: loaded && !isLoading && !error && items.length === 0,
      loadMore,
      retry: load,
    }),
    [items, keyword, error, hasNext, isLoading, status, loaded, loadMore, load],
  );
}
