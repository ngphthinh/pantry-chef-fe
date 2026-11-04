import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { PickedImage, RecipeCreateRequest, RecipeUpdateRequest } from '@/types';
import {
  createCustomRecipe,
  deleteCustomRecipe,
  fetchCustomRecipeDetail,
  fetchCustomRecipes,
  updateCustomRecipe,
} from './customRecipeSlice';

/**
 * Công thức tự tạo của người dùng (dữ liệu cho các màn `recipe/custom/*`).
 */
export function useCustomRecipes() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.customRecipe.items);
  const detail = useAppSelector((s) => s.customRecipe.detail);
  const status = useAppSelector((s) => s.customRecipe.status);
  const hasNext = useAppSelector((s) => s.customRecipe.hasNext);

  const load = useCallback(() => dispatch(fetchCustomRecipes(false)), [dispatch]);
  const loadMore = useCallback(() => dispatch(fetchCustomRecipes(true)), [dispatch]);
  const loadDetail = useCallback((id: string) => dispatch(fetchCustomRecipeDetail(id)), [dispatch]);
  const create = useCallback(
    (body: RecipeCreateRequest, image?: PickedImage | null) =>
      dispatch(createCustomRecipe(body, image)),
    [dispatch],
  );
  const update = useCallback(
    (id: string, body: RecipeUpdateRequest, image?: PickedImage | null) =>
      dispatch(updateCustomRecipe(id, body, image)),
    [dispatch],
  );
  const remove = useCallback((id: string) => dispatch(deleteCustomRecipe(id)), [dispatch]);

  return useMemo(
    () => ({
      items,
      detail,
      hasNext,
      isLoading: status === 'loading',
      isLoadingMore: status === 'loadingMore',
      isSaving: status === 'saving',
      isEmpty: items.length === 0 && status === 'idle',
      load,
      loadMore,
      loadDetail,
      create,
      update,
      remove,
    }),
    [items, detail, hasNext, status, load, loadMore, loadDetail, create, update, remove],
  );
}
