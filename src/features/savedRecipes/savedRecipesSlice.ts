import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

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
}

const initialState: SavedRecipesState = {
    items: [],
    detail: null,
    status: "idle",
    hasNext: false,
};

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
            }>,
        ) {
            const { items, hasNext, nextCursor, replace } = action.payload;
            state.items = replace ? items : [...state.items, ...items];
            state.hasNext = hasNext;
            state.nextCursor = nextCursor;
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
    },
});

export const { statusChanged, pageLoaded, detailLoaded, itemUpserted, itemRemoved, cleared } =
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

/** Tải trang đầu (loadMore = false) hoặc trang kế tiếp (loadMore = true). */
export const fetchSavedRecipes =
    (query: Omit<SavedRecipeQuery, "cursor"> = {}, loadMore = false): AppThunk<Promise<void>> =>
        async (dispatch, getState) => {
            const { hasNext, nextCursor, status } = getState().savedRecipes;
            if (loadMore && (!hasNext || status !== "idle")) return;

            await withStatus(dispatch, loadMore ? "loadingMore" : "loading", async () => {
                const page = await savedRecipeService.list({
                    ...query,
                    cursor: loadMore && nextCursor ? nextCursor : undefined,
                });
                dispatch(
                    pageLoaded({
                        items: page.content,
                        hasNext: page.hasNext,
                        nextCursor: page.nextCursor,
                        replace: !loadMore,
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

/** Không đụng vào danh sách; danh sách tự tải lại khi người dùng mở tab Đã lưu. */
export const addSavedRecipe =
    (body: SavedRecipeCreateRequest): AppThunk<Promise<SavedRecipeResponse>> =>
        async (dispatch) =>
            withStatus(dispatch, "saving", () => savedRecipeService.create(body));

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