import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { customRecipeService } from "@/core/di/container";
import { unauthenticated } from "@/features/auth/authSlice";
import type { AppThunk } from "@/store/hooks";
import type {
  PickedImage,
  RecipeCreateRequest,
  RecipeDetailResponse,
  RecipeSummaryResponse,
  RecipeUpdateRequest,
} from "@/types";
import type { SaveRecipeResult } from "./types";

export type CustomRecipeStatus =
  | "idle"
  | "loading"
  | "loadingMore"
  | "loadingDetail"
  | "saving";

interface CustomRecipeState {
  items: RecipeSummaryResponse[];
  hasNext: boolean;
  nextCursor: string | null;
  detail: RecipeDetailResponse | null;
  status: CustomRecipeStatus;
}

const initialState: CustomRecipeState = {
  items: [],
  hasNext: false,
  nextCursor: null,
  detail: null,
  status: "idle",
};

const customRecipeSlice = createSlice({
  name: "customRecipe",
  initialState,
  reducers: {
    statusChanged(state, action: PayloadAction<CustomRecipeStatus>) {
      state.status = action.payload;
    },
    recipesLoaded(
      state,
      action: PayloadAction<{
        items: RecipeSummaryResponse[];
        hasNext: boolean;
        nextCursor: string | null;
        replace: boolean;
      }>,
    ) {
      const { items, hasNext, nextCursor, replace } = action.payload;
      state.items = replace ? items : [...state.items, ...items];
      state.hasNext = hasNext;
      state.nextCursor = nextCursor;
    },
    recipeRemoved(state, action: PayloadAction<string>) {
      state.items = state.items.filter((r) => r.id !== action.payload);
      if (state.detail?.id === action.payload) state.detail = null;
    },
    detailLoaded(state, action: PayloadAction<RecipeDetailResponse>) {
      state.detail = action.payload;
    },
    detailCleared(state) {
      state.detail = null;
    },
  },
  // Đăng xuất thì bỏ dữ liệu của tài khoản cũ.
  extraReducers: (builder) => {
    builder.addCase(unauthenticated, () => initialState);
  },
});

export const {
  statusChanged,
  recipesLoaded,
  recipeRemoved,
  detailLoaded,
  detailCleared,
} = customRecipeSlice.actions;
export default customRecipeSlice.reducer;

/*
 * Thunk thường (không dùng createAsyncThunk) để lỗi gốc được ném nguyên cho hook.
 * Danh sách chỉ giữ bản tóm tắt nên sau khi tạo/sửa, màn danh sách tự tải lại khi được focus.
 */

const withStatus = async <T>(
  dispatch: (a: ReturnType<typeof statusChanged>) => unknown,
  status: CustomRecipeStatus,
  run: () => Promise<T>,
): Promise<T> => {
  dispatch(statusChanged(status));
  try {
    return await run();
  } finally {
    dispatch(statusChanged("idle"));
  }
};

/** Tải trang đầu, hoặc trang kế tiếp khi `loadMore = true`. */
export const fetchCustomRecipes =
  (loadMore = false): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { hasNext, nextCursor } = getState().customRecipe;
    if (loadMore && (!hasNext || !nextCursor)) return;

    await withStatus(
      dispatch,
      loadMore ? "loadingMore" : "loading",
      async () => {
        const page = await customRecipeService.getRecipes({
          cursor: loadMore ? (nextCursor ?? undefined) : undefined,
        });
        dispatch(
          recipesLoaded({
            items: page.content,
            hasNext: page.hasNext,
            nextCursor: page.nextCursor,
            replace: !loadMore,
          }),
        );
      },
    );
  };

export const fetchCustomRecipeDetail =
  (id: string): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    // Đổi sang công thức khác thì bỏ dữ liệu cũ để không nháy nội dung của công thức trước.
    if (getState().customRecipe.detail?.id !== id) dispatch(detailCleared());
    await withStatus(dispatch, "loadingDetail", async () => {
      dispatch(detailLoaded(await customRecipeService.getRecipe(id)));
    });
  };

export const createCustomRecipe =
  (
    body: RecipeCreateRequest,
    image?: PickedImage | null,
  ): AppThunk<Promise<SaveRecipeResult>> =>
  async (dispatch) =>
    withStatus(dispatch, "saving", async () => {
      const result = await customRecipeService.createRecipe(body, image);
      dispatch(detailLoaded(result.recipe));
      return result;
    });

export const updateCustomRecipe =
  (
    id: string,
    body: RecipeUpdateRequest,
    image?: PickedImage | null,
  ): AppThunk<Promise<SaveRecipeResult>> =>
  async (dispatch) =>
    withStatus(dispatch, "saving", async () => {
      const result = await customRecipeService.updateRecipe(id, body, image);
      dispatch(detailLoaded(result.recipe));
      return result;
    });

export const deleteCustomRecipe =
  (id: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await withStatus(dispatch, "saving", async () => {
      await customRecipeService.removeRecipe(id);
      dispatch(recipeRemoved(id));
    });
  };
