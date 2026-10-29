import { useCallback, useRef, useState } from "react";

import { runAction } from "@/core/result/runAction";
import { useAppDispatch } from "@/store/hooks";
import type { SavedRecipeResponse } from "@/types";
import { fetchSavedRecipePage } from "./savedRecipesSlice";

/** Danh sách món đã lưu dùng riêng cho hộp chọn, không đụng vào store. */
export function useSavedPicker() {
    const dispatch = useAppDispatch();
    const [items, setItems] = useState<SavedRecipeResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const pageRef = useRef<{ cursor?: string; hasNext: boolean }>({ hasNext: false });
    const busyRef = useRef(false);

    const fetchPage = useCallback(
        async (more: boolean) => {
            if (busyRef.current || (more && !pageRef.current.hasNext)) return;
            busyRef.current = true;
            setIsLoading(true);

            const result = await runAction(
                () =>
                    dispatch(
                        fetchSavedRecipePage({ size: 30, cursor: more ? pageRef.current.cursor : undefined }),
                    ),
                "Không tải được danh sách món đã lưu.",
            );

            if (result.ok) {
                pageRef.current = { cursor: result.data.nextCursor ?? undefined, hasNext: result.data.hasNext };
                setItems((prev) => (more ? [...prev, ...result.data.content] : result.data.content));
                setError(null);
            } else {
                setError(result.message);
            }
            busyRef.current = false;
            setIsLoading(false);
        },
        [dispatch],
    );

    const load = useCallback(() => fetchPage(false), [fetchPage]);
    const loadMore = useCallback(() => fetchPage(true), [fetchPage]);

    return { items, error, isLoading, load, loadMore };
}