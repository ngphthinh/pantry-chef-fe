import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { collectionRemoved, collectionUpserted } from "@/features/collections/collectionsSlice";
import type { CursorResponse } from "@/types";
import { savedRecipeService } from "@/core/di/container";
import { unauthenticated } from "@/features/auth/authSlice";
import type { AppThunk } from "@/store/hooks";
import type {
    SavedRecipeCreateRequest,
    SavedRecipeDetailResponse,
    SavedRecipeQuery,
    SavedRecipeResponse,
    SavedRecipeUpdateRequest,
} from "@/types";

export type SavedRecipesStatus = "idle" | "loading" | "loadingMore" | "loadingDetail" | "saving";

interface SavedRecipesState {
    items: SavedRecipeResponse[];
    detail: SavedRecipeDetailResponse | null;
    status: SavedRecipesStatus;
    hasNext: boolean;
    nextCursor?: string | null;
    queryKey: string | null;
}

const initialState: SavedRecipesState = {
    items: [],
    detail: null,
    status: "idle",
    hasNext: false,
    queryKey: null,
};

export interface SavedQuery {
    favorite?: boolean;
    collectionId?: string;
    keyword?: string;
    minRating?: number;
}

export function savedQueryKey(q: SavedQuery): string {
    return JSON.stringify([
        q.favorite ?? null,
        q.collectionId ?? null,
        q.keyword ?? null,
        q.minRating ?? null,
    ]);
}

const savedRecipesSlice = createSlice({
    name: "savedRecipes",
    initialState,
    reducers: {
        statusChanged(state, action: PayloadAction<SavedRecipesStatus>) {
            state.status = action.payload;
        },
        pageLoaded(
            state,
            action: PayloadAction<{
                items: SavedRecipeResponse[];
                hasNext: boolean;
                nextCursor?: string | null;
                replace: boolean;
                queryKey: string;
            }>,
        ) {
            const { items, hasNext, nextCursor, replace, queryKey } = action.payload;
            state.items = replace ? items : [...state.items, ...items];
            state.hasNext = hasNext;
            state.nextCursor = nextCursor;
            if(replace) state.queryKey = queryKey;
        },
        invalidated(state) {                        // thêm
            state.queryKey = null;
        },
        detailLoaded(state, action: PayloadAction<SavedRecipeDetailResponse>) {
            state.detail = action.payload;
        },
        itemUpserted(state, action: PayloadAction<SavedRecipeResponse>) {
            const updated = action.payload;
            const index = state.items.findIndex((i) => i.id === updated.id);
            if (index >= 0) state.items[index] = updated;

            // Giữ chi tiết đang mở đồng bộ với danh sách (đánh giá, ghi chú, yêu thích).
            if (state.detail?.id === updated.id) {
                state.detail.rating = updated.rating;
                state.detail.note = updated.note;
                state.detail.favorite = updated.favorite;
            }
        },
        itemRemoved(state, action: PayloadAction<string>) {
            state.items = state.items.filter((i) => i.id !== action.payload);
            if (state.detail?.id === action.payload) state.detail = null;
        },
        cleared: () => initialState,
    },
    extraReducers: (builder) => {
        // Đăng xuất thì xoá sạch dữ liệu của tài khoản cũ.
        builder.addCase(unauthenticated, () => initialState);
        builder.addCase(collectionUpserted, (state) => { state.queryKey = null; });
        builder.addCase(collectionRemoved, (state) => { state.queryKey = null; });
    },
});

export const { statusChanged, pageLoaded, detailLoaded, itemUpserted, itemRemoved, cleared, invalidated } =
    savedRecipesSlice.actions;
export default savedRecipesSlice.reducer;

const withStatus = async <T>(
    dispatch: (a: ReturnType<typeof statusChanged>) => unknown,
    status: SavedRecipesStatus,
    run: () => Promise<T>,
): Promise<T> => {
    dispatch(statusChanged(status));
    try {
        return await run();
    } finally {
        dispatch(statusChanged("idle"));
    }
};

let latestListRequest = 0;

export const fetchSavedRecipes =
    (query: Omit<SavedRecipeQuery, "cursor"> = {}, loadMore = false): AppThunk<Promise<void>> =>
        async (dispatch, getState) => {
            const { hasNext, nextCursor, status } = getState().savedRecipes;
            if (loadMore && (!hasNext || status !== "idle")) return;

            const requestId = ++latestListRequest;

            await withStatus(dispatch, loadMore ? "loadingMore" : "loading", async () => {
                const page = await savedRecipeService.list({
                    ...query,
                    cursor: loadMore ? (nextCursor ?? undefined) : undefined,
                });
                if (requestId !== latestListRequest) return; // đã có yêu cầu mới hơn, bỏ kết quả này
                dispatch(
                    pageLoaded({
                        items: page.content,
                        hasNext: page.hasNext,
                        nextCursor: page.nextCursor,
                        replace: !loadMore,
                        queryKey: savedQueryKey(query),
                    }),
                );
            });
        };

export const fetchSavedRecipeDetail =
    (id: string): AppThunk<Promise<void>> =>
        async (dispatch) => {
            await withStatus(dispatch, "loadingDetail", async () => {
                dispatch(detailLoaded(await savedRecipeService.get(id)));
            });
        };

export const addSavedRecipe =
    (body: SavedRecipeCreateRequest): AppThunk<Promise<SavedRecipeResponse>> =>
        async (dispatch) =>
            withStatus(dispatch, "saving", async () => {
                const created = await savedRecipeService.create(body);
                dispatch(invalidated());
                return created;
            });

export const updateSavedRecipe =
    (id: string, body: SavedRecipeUpdateRequest): AppThunk<Promise<void>> =>
        async (dispatch) => {
            await withStatus(dispatch, "saving", async () => {
                dispatch(itemUpserted(await savedRecipeService.update(id, body)));
            });
        };

export const toggleSavedRecipeFavorite =
    (item: Pick<SavedRecipeResponse, "id" | "favorite">): AppThunk<Promise<void>> =>
        async (dispatch) => {
            await withStatus(dispatch, "saving", async () => {
                // Đảm bảo savedRecipeService có method toggleFavorite hoặc thay thế bằng gọi update tương ứng
                dispatch(itemUpserted(await savedRecipeService.toggleFavorite(item)));
            });
        };

export const removeSavedRecipe =
    (id: string): AppThunk<Promise<void>> =>
        async (dispatch) => {
            await withStatus(dispatch, "saving", async () => {
                await savedRecipeService.remove(id);
                dispatch(itemRemoved(id));
            });
        };

export const fetchSavedRecipePage =
    (query: SavedRecipeQuery): AppThunk<Promise<CursorResponse<SavedRecipeResponse>>> =>
        async () =>
            savedRecipeService.list(query);