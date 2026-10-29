import { useCallback, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

import { savedQueryKey } from "./savedRecipesSlice";
import { useSavedRecipes } from "./useSavedRecipes";

interface SavedListFilter {
  favorite?: boolean;
  collectionId?: string;
  keyword?: string;
  minRating?: number;
}

export function useSavedList(filter: SavedListFilter = {}) {
  const { favorite, collectionId, keyword, minRating } = filter;

  const {
    items, hasNext, queryKey, isLoading, isLoadingMore, load, loadMore, toggleFavorite, remove,
  } = useSavedRecipes();
  const [error, setError] = useState<string | null>(null);

  const query = useMemo(
      () => ({ favorite, collectionId, keyword: keyword || undefined, minRating }),
      [favorite, collectionId, keyword, minRating],
  );
  const key = useMemo(() => savedQueryKey(query), [query]);

  // Dùng ref để việc "danh sách vừa tải xong" không kích hoạt lại effect bên dưới.
  const loadedKeyRef = useRef(queryKey);
  loadedKeyRef.current = queryKey;

  const refresh = useCallback(async () => {
    const result = await load(query);
    setError(result.ok ? null : result.message);
  }, [load, query]);

  // Chỉ tải khi bộ lọc đổi hoặc danh sách đã cũ. Quay lại từ màn hình chi tiết thì không tải lại.
  useFocusEffect(
      useCallback(() => {
        if (loadedKeyRef.current !== key) void refresh();
      }, [key, refresh]),
  );

  const more = useCallback(async () => {
    if (!hasNext) return;
    const result = await loadMore(query);
    if (!result.ok) setError(result.message);
  }, [hasNext, loadMore, query]);

  return useMemo(
      () => ({ items, hasNext, error, isLoading, isLoadingMore, refresh, loadMore: more, toggleFavorite, remove }),
      [items, hasNext, error, isLoading, isLoadingMore, refresh, more, toggleFavorite, remove],
  );
}