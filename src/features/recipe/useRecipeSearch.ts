import { useCallback, useEffect, useMemo, useState } from 'react';
import { getErrorMessage } from '@/core/http/apiError';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { Difficulty } from '@/types';
import { criteriaChanged, fetchSearchResults } from './recipeSlice';

/** Màn "Kết quả tìm theo nguyên liệu": danh sách phân trang + bộ lọc (độ khó, thời gian, ẩm thực). */
export function useRecipeSearch() {
  const dispatch = useAppDispatch();
  const criteria = useAppSelector((s) => s.recipe.criteria);
  const feed = useAppSelector((s) => s.recipe.feeds.search);
  const status = useAppSelector((s) => s.recipe.status.search);
  const [error, setError] = useState<string | null>(null);

  // Mỗi khi tiêu chí đổi thì tải lại từ trang đầu
  const criteriaKey = useMemo(() => JSON.stringify(criteria), [criteria]);

  const reload = useCallback(async () => {
    setError(null);
    try {
      await dispatch(fetchSearchResults(false));
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, [dispatch]);

  useEffect(() => {
    if (criteria.ingredients.length > 0) void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteriaKey]);

  const loadMore = useCallback(async () => {
    try {
      await dispatch(fetchSearchResults(true));
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, [dispatch]);

  const setDifficulty = useCallback(
    (difficulty?: Difficulty) => dispatch(criteriaChanged({ difficulty })),
    [dispatch],
  );
  const setMaxMinutes = useCallback(
    (maxMinutes?: number) => dispatch(criteriaChanged({ maxMinutes })),
    [dispatch],
  );
  const setCuisine = useCallback(
    (cuisineId?: string) => dispatch(criteriaChanged({ cuisineId })),
    [dispatch],
  );
  const removeIngredient = useCallback(
    (name: string) =>
      dispatch(criteriaChanged({ ingredients: criteria.ingredients.filter((n) => n !== name) })),
    [dispatch, criteria.ingredients],
  );

  return {
    ingredients: criteria.ingredients,
    difficulty: criteria.difficulty,
    maxMinutes: criteria.maxMinutes,
    cuisineId: criteria.cuisineId,
    items: feed.items,
    hasNext: feed.hasNext,
    isLoading: status === 'loading',
    isLoadingMore: status === 'loadingMore',
    isEmpty: feed.loaded && feed.items.length === 0 && status === 'idle',
    error,
    reload,
    loadMore,
    setDifficulty,
    setMaxMinutes,
    setCuisine,
    removeIngredient,
  };
}
