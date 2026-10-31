import { useCallback, useEffect, useMemo, useState } from 'react';
import { getErrorMessage } from '@/core/http/apiError';
import { usePantry } from '@/features/pantry/usePantry';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { Difficulty } from '@/types';
import {
  clearFeed,
  criteriaChanged,
  fetchByName,
  fetchSearchResults,
} from './recipeSlice';

/** Đổi nguyên liệu/bộ lọc liên tục thì chỉ gọi API sau khi người dùng dừng một chút. */
const RELOAD_DEBOUNCE_MS = 350;

/**
 * Màn "Kết quả": hai chế độ.
 * - theo nguyên liệu: thêm/bỏ nguyên liệu ngay tại màn này (chip lấy từ tủ) + bộ lọc độ khó, thời gian, ẩm thực;
 * - theo tên món: sửa từ khoá ngay tại màn này.
 * Mọi thay đổi tự tải lại danh sách từ trang đầu.
 */
export function useRecipeSearch() {
  const dispatch = useAppDispatch();
  const criteria = useAppSelector((s) => s.recipe.criteria);
  const searchFeed = useAppSelector((s) => s.recipe.feeds.search);
  const nameFeed = useAppSelector((s) => s.recipe.feeds.byName);
  const status = useAppSelector((s) => s.recipe.status);
  const { items: pantryItems, loadItems } = usePantry();
  const [error, setError] = useState<string | null>(null);

  const isNameMode = criteria.mode === 'name';
  const keyword = criteria.keyword.trim();
  const feedKey = isNameMode ? 'byName' : 'search';
  const feed = isNameMode ? nameFeed : searchFeed;
  const task = isNameMode ? status.byName : status.search;
  const hasInput = isNameMode ? keyword.length > 0 : criteria.ingredients.length > 0;

  // Chip nguyên liệu: toàn bộ tủ, cộng các nguyên liệu đang chọn nhưng không có trong tủ
  const ingredientChips = useMemo(() => {
    const seen = new Set<string>();
    const chips: string[] = [];
    const add = (name: string) => {
      const key = name.trim().toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        chips.push(name);
      }
    };
    pantryItems.forEach((item) => add(item.ingredientName));
    criteria.ingredients.forEach(add);
    return chips;
  }, [pantryItems, criteria.ingredients]);

  useEffect(() => {
    if (pantryItems.length === 0) void loadItems().catch(() => undefined);
    // chỉ chạy khi vào màn
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reload = useCallback(async () => {
    setError(null);
    try {
      await dispatch(isNameMode ? fetchByName(keyword, false) : fetchSearchResults(false));
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, [dispatch, isNameMode, keyword]);

  // Tiêu chí đổi thì tải lại; bỏ hết nguyên liệu/từ khoá thì xoá danh sách
  const criteriaKey = useMemo(() => JSON.stringify(criteria), [criteria]);
  useEffect(() => {
    if (!hasInput) {
      setError(null);
      dispatch(clearFeed(feedKey));
      return;
    }
    const timer = setTimeout(() => void reload(), RELOAD_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteriaKey]);

  const loadMore = useCallback(async () => {
    try {
      await dispatch(isNameMode ? fetchByName(keyword, true) : fetchSearchResults(true));
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, [dispatch, isNameMode, keyword]);

  const toggleIngredient = useCallback(
    (name: string) =>
      dispatch(
        criteriaChanged({
          ingredients: criteria.ingredients.includes(name)
            ? criteria.ingredients.filter((n) => n !== name)
            : [...criteria.ingredients, name],
        }),
      ),
    [dispatch, criteria.ingredients],
  );
  const setKeyword = useCallback(
    (text: string) => dispatch(criteriaChanged({ keyword: text })),
    [dispatch],
  );
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

  return {
    isNameMode,
    keyword: criteria.keyword,
    ingredients: criteria.ingredients,
    ingredientChips,
    difficulty: criteria.difficulty,
    maxMinutes: criteria.maxMinutes,
    cuisineId: criteria.cuisineId,
    items: feed.items,
    hasNext: feed.hasNext,
    hasInput,
    isLoading: task === 'loading',
    isLoadingMore: task === 'loadingMore',
    isEmpty: hasInput && feed.loaded && feed.items.length === 0 && task === 'idle',
    error,
    reload,
    loadMore,
    toggleIngredient,
    setKeyword,
    setDifficulty,
    setMaxMinutes,
    setCuisine,
  };
}
