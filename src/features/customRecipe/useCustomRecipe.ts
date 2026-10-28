import { useCallback, useMemo, useState } from "react";
import { runAction } from "@/core/http/actionResult";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { PickedImage, RecipeCreateRequest, RecipeSummaryResponse, RecipeUpdateRequest } from "@/types";
import {
  createCustomRecipe,
  fetchCustomRecipes,
  updateCustomRecipe,
} from "./customRecipeSlice";
import { formatRecipeMeta } from "./recipeFormat";

/** Một dòng trong danh sách, đã có sẵn nhãn hiển thị. */
export interface CustomRecipeRow {
  id: string;
  title: string;
  imageUrl: string | null;
  meta: string;
}

/** Danh sách công thức tự tạo và các thao tác tạo/sửa/xoá (màn `recipe/custom/index`, `form`). */
export function useCustomRecipe() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.customRecipe.items);
  const hasNext = useAppSelector((s) => s.customRecipe.hasNext);
  const status = useAppSelector((s) => s.customRecipe.status);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const result = await runAction(() => dispatch(fetchCustomRecipes()), "Không tải được công thức tự tạo.");
    setLoadError(result.ok ? null : result.message);
    return result;
  }, [dispatch]);

  const loadMore = useCallback(async () => {
    const result = await runAction(() => dispatch(fetchCustomRecipes(true)), "Không tải thêm được.");
    setLoadError(result.ok ? null : result.message);
    return result;
  }, [dispatch]);

  const create = useCallback(
    (body: RecipeCreateRequest, image?: PickedImage | null) =>
      runAction(() => dispatch(createCustomRecipe(body, image)), "Không thể lưu công thức."),
    [dispatch],
  );

  const update = useCallback(
    (id: string, body: RecipeUpdateRequest, image?: PickedImage | null) =>
      runAction(() => dispatch(updateCustomRecipe(id, body, image)), "Không thể lưu công thức."),
    [dispatch],
  );

  const recipes = useMemo<CustomRecipeRow[]>(
    () =>
      items
        .filter((r): r is RecipeSummaryResponse & { id: string } => r.id !== null)
        .map((r) => ({
          id: r.id,
          title: r.title,
          imageUrl: r.imageUrl,
          meta: formatRecipeMeta(r.readyInMinutes, r.difficulty),
        })),
    [items],
  );

  return useMemo(
    () => ({
      recipes,
      hasNext,
      isLoading: status === "loading",
      isLoadingMore: status === "loadingMore",
      isSaving: status === "saving",
      loadError,
      load,
      loadMore,
      create,
      update,
    }),
    [recipes, hasNext, status, loadError, load, loadMore, create, update],
  );
}
