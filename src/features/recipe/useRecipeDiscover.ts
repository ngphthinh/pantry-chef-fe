import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/core/http/apiError';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchByName, fetchPopular, fetchRandom } from './recipeSlice';

export type DiscoverMode = 'popular' | 'random' | 'name';

const RANDOM_COUNT = 6;
const KEYWORD_DEBOUNCE_MS = 400;

/** Màn "Khám phá món": phổ biến, ngẫu nhiên hoặc tìm theo tên (gõ xong 0,4 giây mới gọi API). */
export function useRecipeDiscover(initialKeyword = '') {
  const dispatch = useAppDispatch();
  const popular = useAppSelector((s) => s.recipe.feeds.popular);
  const byName = useAppSelector((s) => s.recipe.feeds.byName);
  const randomItems = useAppSelector((s) => s.recipe.randomItems);
  const status = useAppSelector((s) => s.recipe.status);

  const [mode, setModeState] = useState<DiscoverMode>(initialKeyword.trim() ? 'name' : 'popular');
  const [keyword, setKeyword] = useState(initialKeyword);
  const [query, setQuery] = useState(initialKeyword.trim());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(keyword.trim()), KEYWORD_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [keyword]);

  const run = useCallback(async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, []);

  useEffect(() => {
    if (mode === 'popular') void run(() => dispatch(fetchPopular(false)));
    if (mode === 'random') void run(() => dispatch(fetchRandom(RANDOM_COUNT)));
    if (mode === 'name' && query) void run(() => dispatch(fetchByName(query, false)));
  }, [mode, query, dispatch, run]);

  const setMode = useCallback((next: DiscoverMode) => setModeState(next), []);

  const loadMore = useCallback(() => {
    if (mode === 'popular') return run(() => dispatch(fetchPopular(true)));
    if (mode === 'name' && query) return run(() => dispatch(fetchByName(query, true)));
    return Promise.resolve();
  }, [mode, query, dispatch, run]);

  const reroll = useCallback(
    () => run(() => dispatch(fetchRandom(RANDOM_COUNT))),
    [dispatch, run],
  );

  const feed = mode === 'popular' ? popular : mode === 'name' ? byName : null;
  const task = mode === 'popular' ? status.popular : mode === 'name' ? status.byName : status.random;

  return {
    mode,
    setMode,
    keyword,
    setKeyword,
    items: mode === 'random' ? randomItems : (feed?.items ?? []),
    hasNext: feed?.hasNext ?? false,
    isLoading: task === 'loading',
    isLoadingMore: task === 'loadingMore',
    needsKeyword: mode === 'name' && !query,
    isEmpty: mode === 'name' && !!query && byName.loaded && byName.items.length === 0 && task === 'idle',
    error,
    loadMore,
    reroll,
  };
}
