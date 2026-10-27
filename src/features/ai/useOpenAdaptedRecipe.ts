import { useCallback } from "react";
import { useRouter } from "expo-router";

/**
 * Mở màn hình công thức đã điều chỉnh từ bất kỳ màn hình nào.
 * `recipeId` là uuid của công thức (RecipeDetailResponse.id), không phải externalId.
 */
export function useOpenAdaptedRecipe() {
  const router = useRouter();

  return useCallback(
    (recipeId: string) => {
      router.push({ pathname: "/ai/adapted-recipe", params: { recipeId } });
    },
    [router],
  );
}
