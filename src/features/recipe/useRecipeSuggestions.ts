import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/core/http/apiError';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSuggestions } from './recipeSlice';

/** Màn "Gợi ý theo tủ": server tự lấy nguyên liệu trong tủ và bỏ nguyên liệu loại trừ. */
export function useRecipeSuggestions() {
  const dispatch = useAppDispatch();
  const feed = useAppSelector((s) => s.recipe.feeds.suggestions);
  const status = useAppSelector((s) => s.recipe.status.suggestions);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      await dispatch(fetchSuggestions(false));
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, [dispatch]);

  const loadMore = useCallback(async () => {
    try {
      await dispatch(fetchSuggestions(true));
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, [dispatch]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return {
    items: feed.items,
    hasNext: feed.hasNext,
    isLoading: status === 'loading',
    isLoadingMore: status === 'loadingMore',
    isEmpty: feed.loaded && feed.items.length === 0 && status === 'idle',
    error,
    reload,
    loadMore,
  };
}
