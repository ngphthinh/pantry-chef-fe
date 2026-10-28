import { useCallback, useEffect } from "react";

import { useSavedList } from "@/features/savedRecipes/useSavedList";
import { useCollections } from "./useCollections";

export function useCollectionDetail(id: string) {
    const { findById, load, removeRecipe, remove, isSaving } = useCollections();
    const { items, hasNext, error, isLoading, isLoadingMore, refresh, loadMore } = useSavedList({
        collectionId: id,
    });

    const collection = findById(id);

    // API không có GET /collections/{id}: mở thẳng màn hình này thì store còn rỗng nên phải tải danh sách.
    useEffect(() => {
        void load();
    }, [load]);



    const removeFromCollection = useCallback(
        async (savedRecipeId: string) => {
            const result = await removeRecipe(id, savedRecipeId);
            if (result.ok) await refresh(); // danh sách món trong store đang là bản cũ
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