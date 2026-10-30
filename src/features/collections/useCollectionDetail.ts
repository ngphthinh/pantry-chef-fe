import { useCallback, useEffect } from "react";

import { useSavedList } from "@/features/savedRecipes/useSavedList";
import { useCollections } from "./useCollections";

export function useCollectionDetail(id: string) {
  const { findById, loadOne, removeRecipe, remove, isSaving } =
    useCollections();
  const { items, hasNext, error, isLoading, isLoadingMore, refresh, loadMore } =
    useSavedList({
      collectionId: id,
    });

  const collection = findById(id);

  useEffect(() => {
    void loadOne(id);
  }, [id, loadOne]);

  const removeFromCollection = useCallback(
    async (savedRecipeId: string) => {
      const result = await removeRecipe(id, savedRecipeId);
      if (result.ok) await refresh();
      return result;
    },
    [id, refresh, removeRecipe],
  );

  const deleteCollection = useCallback(() => remove(id), [id, remove]);

  return {
    collection,
    items,
    hasNext,
    error,
    isLoading,
    isLoadingMore,
    isSaving,
    refresh,
    loadMore,
    removeFromCollection,
    deleteCollection,
  };
}
