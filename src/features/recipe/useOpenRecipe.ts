import { useCallback } from 'react';
import { useRouter, type Href } from 'expo-router';
import type { RecipeSummaryResponse } from '@/types';
import { recipeHref } from './recipeLabels';

/** Mở màn chi tiết phù hợp với một dòng danh sách (công thức ngoài hoặc tự tạo). */
export function useOpenRecipe() {
  const router = useRouter();
  return useCallback(
    (recipe: RecipeSummaryResponse) => {
      const href = recipeHref(recipe);
      if (href) router.push(href as Href);
    },
    [router],
  );
}
