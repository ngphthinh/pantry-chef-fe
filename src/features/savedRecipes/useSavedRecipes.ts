import { useCallback, useMemo } from "react";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type {
    SavedRecipeCreateRequest,
    SavedRecipeQuery,
    SavedRecipeResponse,
    SavedRecipeUpdateRequest,
} from "@/types";
import {
    addSavedRecipe,
    fetchSavedRecipeDetail,
    fetchSavedRecipes,
    removeSavedRecipe,
    toggleSavedRecipeFavorite,
    updateSavedRecipe,
} from "./savedRecipesSlice";
import {runAction} from "@/core/result/runAction";

type ListQuery = Omit<SavedRecipeQuery, "cursor">;

export function useSavedRecipes() {
    const dispatch = useAppDispatch();
    const items = useAppSelector((s) => s.savedRecipes.items);
    const detail = useAppSelector((s) => s.savedRecipes.detail);
    const status = useAppSelector((s) => s.savedRecipes.status);
    const hasNext = useAppSelector((s) => s.savedRecipes.hasNext);
    const queryKey = useAppSelector((s) => s.savedRecipes.queryKey);

    const load = useCallback(
        (query?: ListQuery) =>
            runAction(() => dispatch(fetchSavedRecipes(query)), "Không tải được danh sách món đã lưu."),
        [dispatch],
    );

    const loadMore = useCallback(
        (query?: ListQuery) =>
            runAction(() => dispatch(fetchSavedRecipes(query, true)), "Không tải thêm được."),
        [dispatch],
    );

    const loadDetail = useCallback(
        (id: string) =>
            runAction(() => dispatch(fetchSavedRecipeDetail(id)), "Không tải được món đã lưu."),
        [dispatch],
    );

    const add = useCallback(
        (body: SavedRecipeCreateRequest) =>
            runAction(() => dispatch(addSavedRecipe(body)), "Không lưu được món này."),
        [dispatch],
    );

    const update = useCallback(
        (id: string, body: SavedRecipeUpdateRequest) =>
            runAction(() => dispatch(updateSavedRecipe(id, body)), "Không cập nhật được."),
        [dispatch],
    );

    const toggleFavorite = useCallback(
        (item: Pick<SavedRecipeResponse, "id" | "favorite">) =>
            runAction(() => dispatch(toggleSavedRecipeFavorite(item)), "Không đổi được yêu thích."),
        [dispatch],
    );

    const remove = useCallback(
        (id: string) => runAction(() => dispatch(removeSavedRecipe(id)), "Không bỏ lưu được."),
        [dispatch],
    );

    return useMemo(
        () => ({
            items,
            detail,
            status,
            hasNext,
            queryKey,
            isLoading: status === "loading",
            isLoadingMore: status === "loadingMore",
            isLoadingDetail: status === "loadingDetail",
            isSaving: status === "saving",
            load,
            loadMore,
            loadDetail,
            add,
            update,
            toggleFavorite,
            remove,
        }),
        [items, detail, status, hasNext, load, loadMore, loadDetail, add, update, toggleFavorite, remove],
    );
}