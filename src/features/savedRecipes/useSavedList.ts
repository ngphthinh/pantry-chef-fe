import { useCallback, useMemo, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";

import type { SavedRecipeResponse } from "@/types";
import { savedQueryKey } from "./savedRecipesSlice";
import { useSavedRecipes } from "./useSavedRecipes";

interface SavedListFilter {
  favorite?: boolean;
  collectionId?: string;
  keyword?: string;
  minRating?: number;
}

const EMPTY: SavedRecipeResponse[] = [];

export function useSavedList(filter: SavedListFilter = {}) {
  const { favorite, collectionId, keyword, minRating } = filter;
  const {
    items, hasNext, queryKey, isLoading, isLoadingMore, load, loadMore, toggleFavorite, remove,
  } = useSavedRecipes();

  const query = useMemo(
      () => ({ favorite, collectionId, keyword: keyword || undefined, minRating }),
      [favorite, collectionId, keyword, minRating],
  );
  const key = useMemo(() => savedQueryKey(query), [query]);

  const [errorState, setErrorState] = useState<{ key: string; message: string } | null>(null);
  const error = errorState?.key === key ? errorState.message : null;

  const isReady = queryKey === key;

  const loadedKeyRef = useRef(queryKey);
  loadedKeyRef.current = queryKey;

  const refresh = useCallback(async () => {
    const result = await load(query);
    setErrorState(result.ok ? null : { key, message: result.message });
  }, [load, query, key]);

  useFocusEffect(
      useCallback(() => {
        if (loadedKeyRef.current !== key) void refresh();
      }, [key, refresh]),
  );

  const more = useCallback(async () => {
    if (!isReady || !hasNext) return;
    const result = await loadMore(query);
    if (!result.ok) setErrorState({ key, message: result.message });
  }, [isReady, hasNext, loadMore, query, key]);

  return useMemo(
      () => ({
        items: isReady ? items : EMPTY,
        hasNext: isReady && hasNext,
        error,
        isLoading: isLoading || (!isReady && error === null),
        isLoadingMore,
        refresh,
        loadMore: more,
        toggleFavorite,
        remove,
      }),
      [items, hasNext, isReady, error, isLoading, isLoadingMore, refresh, more, toggleFavorite, remove],
  );
}