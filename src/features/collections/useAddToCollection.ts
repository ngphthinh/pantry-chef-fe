import { useCallback, useState } from "react";

import { useCollections } from "./useCollections";

/** savedRecipeId là id của bản ghi đã lưu (SavedRecipeResponse.id), không phải recipeId. */
export function useAddToCollection(savedRecipeId: string) {
    const { items, isLoading, isSaving, load, addRecipe } = useCollections();
    const [addedIds, setAddedIds] = useState<string[]>([]);

    const add = useCallback(
        async (collectionId: string) => {
            const result = await addRecipe(collectionId, savedRecipeId);
            if (result.ok) setAddedIds((prev) => [...prev, collectionId]);
            return result;
        },
        [addRecipe, savedRecipeId],
    );

    return { collections: items, addedIds, isLoading, isAdding: isSaving, load, add };
}