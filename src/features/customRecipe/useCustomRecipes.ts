import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { PickedImage, RecipeCreateRequest, RecipeUpdateRequest } from '@/types';
import {
  createCustomRecipe,
  deleteCustomRecipe,
  fetchCustomRecipe,
  fetchCustomRecipes,
  updateCustomRecipe,
  uploadCustomRecipeImage,
} from './customRecipeSlice';

/**
 * Công thức tự tạo của người dùng (dữ liệu cho các màn `recipe/custom/*` của Thiệu).
 * Mọi hàm ném lỗi gốc (ApiError); màn hình/hook form bắt lỗi và hiển thị.
 */
export function useCustomRecipes() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.customRecipe.items);
  const details = useAppSelector((s) => s.customRecipe.details);
  const status = useAppSelector((s) => s.customRecipe.status);
  const hasNext = useAppSelector((s) => s.customRecipe.hasNext);
  const loaded = useAppSelector((s) => s.customRecipe.loaded);

  const load = useCallback(() => dispatch(fetchCustomRecipes(false)), [dispatch]);
  const loadMore = useCallback(() => dispatch(fetchCustomRecipes(true)), [dispatch]);
  const loadDetail = useCallback((id: string) => dispatch(fetchCustomRecipe(id)), [dispatch]);
  const create = useCallback(
    (body: RecipeCreateRequest) => dispatch(createCustomRecipe(body)),
    [dispatch],
  );
  const update = useCallback(
    (id: string, body: RecipeUpdateRequest) => dispatch(updateCustomRecipe(id, body)),
    [dispatch],
  );
  const remove = useCallback((id: string) => dispatch(deleteCustomRecipe(id)), [dispatch]);
  const uploadImage = useCallback(
    (id: string, image: PickedImage) => dispatch(uploadCustomRecipeImage(id, image)),
    [dispatch],
  );

  return useMemo(
    () => ({
      items,
      details,
      hasNext,
      isLoading: status === 'loading',
      isLoadingMore: status === 'loadingMore',
      isSaving: status === 'saving',
      isDeleting: status === 'deleting',
      isUploading: status === 'uploading',
      isEmpty: loaded && items.length === 0 && status === 'idle',
      load,
      loadMore,
      loadDetail,
      create,
      update,
      remove,
      uploadImage,
    }),
    [items, details, hasNext, status, loaded, load, loadMore, loadDetail, create, update, remove, uploadImage],
  );
}
