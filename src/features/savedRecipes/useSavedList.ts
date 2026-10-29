import { useCallback, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

import { useSavedRecipes } from "./useSavedRecipes";

interface SavedListFilter {
  favorite?: boolean;
  collectionId?: string;
}

export function useSavedList(filter: SavedListFilter = {}) {
  const { favorite, collectionId } = filter;
  const {
    items,
    hasNext,
    isLoading,
    isLoadingMore,
    load,
    loadMore,
    toggleFavorite,
    remove,
  } = useSavedRecipes();
  const [error, setError] = useState<string | null>(null);

  // Giữ bản mới nhất của load/loadMore/hasNext mà không làm đổi identity của callback
  const loadRef = useRef(load);
  const loadMoreRef = useRef(loadMore);
  const hasNextRef = useRef(hasNext);
  loadRef.current = load;
  loadMoreRef.current = loadMore;
  hasNextRef.current = hasNext;

  const refreshing = useRef(false);
  const moreLoading = useRef(false);

  // Chỉ phụ thuộc giá trị filter (primitive) -> ổn định
  const refresh = useCallback(async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    try {
      const result = await loadRef.current({ favorite, collectionId });
      setError(result.ok ? null : result.message);
    } finally {
      refreshing.current = false;
    }
  }, [favorite, collectionId]);

  const more = useCallback(async () => {
    if (!hasNextRef.current || moreLoading.current || refreshing.current)
      return;
    moreLoading.current = true;
    try {
      const result = await loadMoreRef.current({ favorite, collectionId });
      if (!result.ok) setError(result.message);
    } finally {
      moreLoading.current = false;
    }
  }, [favorite, collectionId]);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  return useMemo(
    () => ({
      items,
      hasNext,
      error,
      isLoading,
      isLoadingMore,
      refresh,
      loadMore: more,
      toggleFavorite,
      remove,
    }),
    [
      items,
      hasNext,
      error,
      isLoading,
      isLoadingMore,
      refresh,
      more,
      toggleFavorite,
      remove,
    ],
  );
}
