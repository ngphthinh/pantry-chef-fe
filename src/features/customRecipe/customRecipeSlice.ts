import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { customRecipeService } from '@/core/di/container';
import { unauthenticated } from '@/features/auth/authSlice';
import type { AppThunk } from '@/store/hooks';
import type {
  CursorResponse,
  PickedImage,
  RecipeCreateRequest,
  RecipeDetailResponse,
  RecipeSummaryResponse,
  RecipeUpdateRequest,
} from '@/types';

export type CustomRecipeStatus =
  | 'idle'
  | 'loading'
  | 'loadingMore'
  | 'saving'
  | 'deleting'
  | 'uploading';

export interface CustomRecipeState {
  items: RecipeSummaryResponse[];
  /** Chi tiết đã tải, khoá theo id (uuid). */
  details: Record<string, RecipeDetailResponse>;
  status: CustomRecipeStatus;
  hasNext: boolean;
  nextCursor: string | null;
  loaded: boolean;
}

const initialState: CustomRecipeState = {
  items: [],
  details: {},
  status: 'idle',
  hasNext: false,
  nextCursor: null,
  loaded: false,
};

/** Dòng danh sách tương ứng với một chi tiết, để danh sách luôn khớp sau khi tạo/sửa/đổi ảnh. */
const toSummary = (d: RecipeDetailResponse): RecipeSummaryResponse => ({
  id: d.id,
  externalId: d.externalId,
  title: d.title,
  imageUrl: d.imageUrl,
  servings: d.servings,
  readyInMinutes: d.readyInMinutes,
  difficulty: d.difficulty,
  custom: d.custom,
  cuisine: d.cuisine,
  usedIngredientCount: null,
  missedIngredientCount: null,
  matchScore: null,
  missingIngredients: null,
});

const customRecipeSlice = createSlice({
  name: 'customRecipe',
  initialState,
  reducers: {
    statusChanged(state, action: PayloadAction<CustomRecipeStatus>) {
      state.status = action.payload;
    },
    pageReceived(
      state,
      action: PayloadAction<{ response: CursorResponse<RecipeSummaryResponse>; append: boolean }>,
    ) {
      const { response, append } = action.payload;
      state.items = append ? [...state.items, ...response.content] : response.content;
      state.hasNext = response.hasNext;
      state.nextCursor = response.nextCursor;
      state.loaded = true;
    },
    detailReceived(state, action: PayloadAction<RecipeDetailResponse>) {
      const detail = action.payload;
      state.details[detail.id] = detail;
      const index = state.items.findIndex((i) => i.id === detail.id);
      if (index !== -1) state.items[index] = toSummary(detail);
    },
    recipeCreated(state, action: PayloadAction<RecipeDetailResponse>) {
      state.details[action.payload.id] = action.payload;
      state.items.unshift(toSummary(action.payload));
    },
    recipeRemoved(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
      delete state.details[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(unauthenticated, () => initialState);
  },
});

export const { statusChanged, pageReceived, detailReceived, recipeCreated, recipeRemoved } =
  customRecipeSlice.actions;

export default customRecipeSlice.reducer;

const withStatus =
  <T>(status: CustomRecipeStatus, run: () => Promise<T>): AppThunk<Promise<T>> =>
  async (dispatch) => {
    dispatch(statusChanged(status));
    try {
      return await run();
    } finally {
      dispatch(statusChanged('idle'));
    }
  };

/** Trang đầu (`append = false`) hoặc trang kế tiếp theo con trỏ UUID đang lưu. */
export const fetchCustomRecipes =
  (append = false): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { hasNext, nextCursor, status } = getState().customRecipe;
    if (append && (!hasNext || status !== 'idle')) return;

    await dispatch(
      withStatus(append ? 'loadingMore' : 'loading', async () => {
        const response = await customRecipeService.list({ cursor: append ? nextCursor : null });
        dispatch(pageReceived({ response, append }));
      }),
    );
  };

export const fetchCustomRecipe =
  (id: string): AppThunk<Promise<RecipeDetailResponse>> =>
  (dispatch) =>
    dispatch(
      withStatus('loading', async () => {
        const detail = await customRecipeService.getById(id);
        dispatch(detailReceived(detail));
        return detail;
      }),
    );

export const createCustomRecipe =
  (body: RecipeCreateRequest): AppThunk<Promise<RecipeDetailResponse>> =>
  (dispatch) =>
    dispatch(
      withStatus('saving', async () => {
        const detail = await customRecipeService.create(body);
        dispatch(recipeCreated(detail));
        return detail;
      }),
    );

export const updateCustomRecipe =
  (id: string, body: RecipeUpdateRequest): AppThunk<Promise<RecipeDetailResponse>> =>
  (dispatch) =>
    dispatch(
      withStatus('saving', async () => {
        const detail = await customRecipeService.update(id, body);
        dispatch(detailReceived(detail));
        return detail;
      }),
    );

export const deleteCustomRecipe =
  (id: string): AppThunk<Promise<void>> =>
  (dispatch) =>
    dispatch(
      withStatus('deleting', async () => {
        await customRecipeService.remove(id);
        dispatch(recipeRemoved(id));
      }),
    );

export const uploadCustomRecipeImage =
  (id: string, image: PickedImage): AppThunk<Promise<RecipeDetailResponse>> =>
  (dispatch) =>
    dispatch(
      withStatus('uploading', async () => {
        const detail = await customRecipeService.uploadImage(id, image);
        dispatch(detailReceived(detail));
        return detail;
      }),
    );
