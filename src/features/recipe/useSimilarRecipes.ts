import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/core/http/apiError';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSimilar } from './recipeSlice';

/** Món tương tự của một công thức ngoài (tối đa 10, không phân trang). */
export function useSimilarRecipes(externalId: string | undefined) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.recipe.similarItems);
  const similarFor = useAppSelector((s) => s.recipe.similarFor);
  const status = useAppSelector((s) => s.recipe.status.similar);
  const [error, setError] = useState<string | null>(null);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!externalId) return;
    setError(null);
    try {
      await dispatch(fetchSimilar(externalId));
      setLoadedFor(externalId);
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, [dispatch, externalId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const isCurrent = similarFor === externalId;
  return {
    items: isCurrent ? items : [],
    isLoading: status === 'loading',
    isEmpty: isCurrent && loadedFor === externalId && items.length === 0 && status === 'idle' && !error,
    error,
    reload,
  };
}
