import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { collectionService } from "@/core/di/container";
import { unauthenticated } from "@/features/auth/authSlice";
import type { AppThunk } from "@/store/hooks";
import type {
    CollectionCreateRequest,
    CollectionResponse,
    CollectionUpdateRequest,
} from "@/types";

export type CollectionsStatus = "idle" | "loading" | "saving";

interface CollectionsState {
    items: CollectionResponse[];
    status: CollectionsStatus;
}

const initialState: CollectionsState = { items: [], status: "idle" };

const collectionsSlice = createSlice({
    name: "collections",
    initialState,
    reducers: {
        statusChanged(state, action: PayloadAction<CollectionsStatus>) {
            state.status = action.payload;
        },
        listLoaded(state, action: PayloadAction<CollectionResponse[]>) {
            state.items = action.payload;
        },
        collectionUpserted(state, action: PayloadAction<CollectionResponse>) {
            const index = state.items.findIndex((c) => c.id === action.payload.id);
            if (index >= 0) state.items[index] = action.payload;
            else state.items.push(action.payload);
        },
        collectionRemoved(state, action: PayloadAction<string>) {
            state.items = state.items.filter((c) => c.id !== action.payload);
        },
        cleared: () => initialState,
    },
    extraReducers: (builder) => {
        builder.addCase(unauthenticated, () => initialState);
    },
});

export const { statusChanged, listLoaded, collectionUpserted, collectionRemoved, cleared } =
    collectionsSlice.actions;
export default collectionsSlice.reducer;

/* Thunk thường (không dùng createAsyncThunk) để lỗi gốc được ném nguyên cho hook. */

const withStatus = async <T>(
    dispatch: (a: ReturnType<typeof statusChanged>) => unknown,
    status: CollectionsStatus,
    run: () => Promise<T>,
): Promise<T> => {
    dispatch(statusChanged(status));
    try {
        return await run();
    } finally {
        dispatch(statusChanged("idle"));
    }
};

export const fetchCollections = (): AppThunk<Promise<void>> => async (dispatch) => {
    await withStatus(dispatch, "loading", async () => {
        dispatch(listLoaded(await collectionService.list()));
    });
};

export const createCollection =
    (body: CollectionCreateRequest): AppThunk<Promise<CollectionResponse>> =>
        async (dispatch) =>
            withStatus(dispatch, "saving", async () => {
                const created = await collectionService.create(body);
                dispatch(collectionUpserted(created));
                return created;
            });

export const renameCollection =
    (id: string, body: CollectionUpdateRequest): AppThunk<Promise<void>> =>
        async (dispatch) => {
            await withStatus(dispatch, "saving", async () => {
                dispatch(collectionUpserted(await collectionService.update(id, body)));
            });
        };

export const removeCollection =
    (id: string): AppThunk<Promise<void>> =>
        async (dispatch) => {
            await withStatus(dispatch, "saving", async () => {
                await collectionService.remove(id);
                dispatch(collectionRemoved(id));
            });
        };

/** Response trả về đã có recipeCount mới nên chỉ cần upsert, không phải tải lại danh sách. */
export const addRecipeToCollection =
    (id: string, savedRecipeId: string): AppThunk<Promise<void>> =>
        async (dispatch) => {
            await withStatus(dispatch, "saving", async () => {
                dispatch(collectionUpserted(await collectionService.addRecipe(id, savedRecipeId)));
            });
        };

export const removeRecipeFromCollection =
    (id: string, savedRecipeId: string): AppThunk<Promise<void>> =>
        async (dispatch) => {
            await withStatus(dispatch, "saving", async () => {
                dispatch(collectionUpserted(await collectionService.removeRecipe(id, savedRecipeId)));
            });
        };