import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";

import { useSavedRecipes } from "./useSavedRecipes";

interface SavedListFilter {
    favorite?: boolean;
    collectionId?: string;
}

export function useSavedList(filter: SavedListFilter = {}) {
    const { favorite, collectionId } = filter;
    const { items, hasNext, isLoading, isLoadingMore, load, loadMore, toggleFavorite, remove } =
        useSavedRecipes();
    const [error, setError] = useState<string | null>(null);

    const query = useMemo(() => ({ favorite, collectionId }), [favorite, collectionId]);

    const refresh = useCallback(async () => {
        const result = await load(query);
        setError(result.ok ? null : result.message);
    }, [load, query]);

    const more = useCallback(async () => {
        if (!hasNext) return;
        const result = await loadMore(query);
        if (!result.ok) setError(result.message);
    }, [hasNext, loadMore, query]);

    useFocusEffect(
        useCallback(() => {
            void refresh();
        }, [refresh]),
    );

    return useMemo(
        () => ({
            items,
            hasNext,
            error,
            isLoading,
            isLoadingMore,
            refresh,
            loadMore: more,
            toggleFavorite,
            remove
        }),
        [items, hasNext, error, isLoading, isLoadingMore, refresh, more, toggleFavorite, remove],
    );
}