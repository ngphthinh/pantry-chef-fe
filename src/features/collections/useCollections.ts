import { useCallback, useMemo } from "react";

import { runAction } from "@/core/result/runAction";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    addRecipeToCollection,
    createCollection,
    fetchCollections,
    removeCollection,
    removeRecipeFromCollection,
    renameCollection,
} from "./collectionsSlice";

export function useCollections() {
    const dispatch = useAppDispatch();
    const items = useAppSelector((s) => s.collections.items);
    const status = useAppSelector((s) => s.collections.status);

    const load = useCallback(
        () => runAction(() => dispatch(fetchCollections()), "Không tải được bộ sưu tập."),
        [dispatch],
    );

    const create = useCallback(
        (name: string) =>
            runAction(() => dispatch(createCollection({ name })), "Không tạo được bộ sưu tập."),
        [dispatch],
    );

    const rename = useCallback(
        (id: string, name: string) =>
            runAction(() => dispatch(renameCollection(id, { name })), "Không đổi được tên."),
        [dispatch],
    );

    const remove = useCallback(
        (id: string) => runAction(() => dispatch(removeCollection(id)), "Không xoá được bộ sưu tập."),
        [dispatch],
    );

    const addRecipe = useCallback(
        (id: string, savedRecipeId: string) =>
            runAction(
                () => dispatch(addRecipeToCollection(id, savedRecipeId)),
                "Không thêm được món vào bộ sưu tập.",
            ),
        [dispatch],
    );

    const removeRecipe = useCallback(
        (id: string, savedRecipeId: string) =>
            runAction(
                () => dispatch(removeRecipeFromCollection(id, savedRecipeId)),
                "Không bỏ được món khỏi bộ sưu tập.",
            ),
        [dispatch],
    );

    /** Màn hình collection/[id] lấy tên và số món từ danh sách đã tải (API không có GET /{id}). */
    const findById = useCallback((id: string) => items.find((c) => c.id === id) ?? null, [items]);

    return useMemo(
        () => ({
            items,
            status,
            isLoading: status === "loading",
            isSaving: status === "saving",
            load,
            create,
            rename,
            remove,
            addRecipe,
            removeRecipe,
            findById,
        }),
        [items, status, load, create, rename, remove, addRecipe, removeRecipe, findById],
    );
}