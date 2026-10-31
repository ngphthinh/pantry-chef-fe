import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { recipeService } from '@/core/di/container';
import { unauthenticated } from '@/features/auth/authSlice';
import type { AppThunk } from '@/store/hooks';
import type {
  CursorResponse,
  Difficulty,
  RecipeDetailResponse,
  RecipeSummaryResponse,
} from '@/types';
import type { RecipeFeedKey } from './types';

export type RecipeTask = RecipeFeedKey | 'random' | 'similar' | 'detail' | 'scale';
export type RecipeStatus = 'idle' | 'loading' | 'loadingMore';

export interface RecipeFeedState {
  items: RecipeSummaryResponse[];
  hasNext: boolean;
  nextCursor: string | null;
  /** Đổi mỗi lần tải lại từ đầu; kết quả của lần tải cũ (đã bị thay thế) sẽ bị bỏ. */
  requestKey: number;
  /** Đã có ít nhất một lần tải xong, để phân biệt "chưa tải" với "không có kết quả". */
  loaded: boolean;
}

export type RecipeSearchMode = 'ingredients' | 'name';

export interface RecipeSearchCriteria {
  /** 'ingredients': tìm theo nguyên liệu; 'name': tìm theo tên món (dùng `keyword`). */
  mode: RecipeSearchMode;
  keyword: string;
  ingredients: string[];
  cuisineId?: string;
  maxMinutes?: number;
  difficulty?: Difficulty;
}

export interface RecipeState {
  feeds: Record<RecipeFeedKey, RecipeFeedState>;
  randomItems: RecipeSummaryResponse[];
  similarItems: RecipeSummaryResponse[];
  similarFor: string | null;
  /** Chi tiết đã tải, khoá theo externalId. */
  details: Record<string, RecipeDetailResponse>;
  status: Record<RecipeTask, RecipeStatus>;
  criteria: RecipeSearchCriteria;
}

const emptyFeed = (): RecipeFeedState => ({
  items: [],
  hasNext: false,
  nextCursor: null,
  requestKey: 0,
  loaded: false,
});

const initialState: RecipeState = {
  feeds: {
    search: emptyFeed(),
    suggestions: emptyFeed(),
    byName: emptyFeed(),
  },
  randomItems: [],
  similarItems: [],
  similarFor: null,
  details: {},
  status: {
    search: 'idle',
    suggestions: 'idle',
    byName: 'idle',
    random: 'idle',
    similar: 'idle',
    detail: 'idle',
    scale: 'idle',
  },
  criteria: { mode: 'ingredients', keyword: '', ingredients: [] },
};

const recipeSlice = createSlice({
  name: 'recipe',
  initialState,
  reducers: {
    statusChanged(state, action: PayloadAction<{ task: RecipeTask; status: RecipeStatus }>) {
      state.status[action.payload.task] = action.payload.status;
    },
    feedReset(state, action: PayloadAction<{ feed: RecipeFeedKey; requestKey: number }>) {
      state.feeds[action.payload.feed] = { ...emptyFeed(), requestKey: action.payload.requestKey };
    },
    feedPageReceived(
      state,
      action: PayloadAction<{
        feed: RecipeFeedKey;
        requestKey: number;
        response: CursorResponse<RecipeSummaryResponse>;
        append: boolean;
      }>,
    ) {
      const { feed, requestKey, response, append } = action.payload;
      const target = state.feeds[feed];
      if (target.requestKey !== requestKey) return; // đã có lần tải mới hơn
      target.items = append ? [...target.items, ...response.content] : response.content;
      target.hasNext = response.hasNext;
      target.nextCursor = response.nextCursor;
      target.loaded = true;
    },
    randomReceived(state, action: PayloadAction<RecipeSummaryResponse[]>) {
      state.randomItems = action.payload;
    },
    similarRequested(state, action: PayloadAction<string>) {
      state.similarFor = action.payload;
      state.similarItems = [];
    },
    similarReceived(state, action: PayloadAction<{ externalId: string; items: RecipeSummaryResponse[] }>) {
      if (state.similarFor !== action.payload.externalId) return;
      state.similarItems = action.payload.items;
    },
    detailReceived(state, action: PayloadAction<{ externalId: string; detail: RecipeDetailResponse }>) {
      state.details[action.payload.externalId] = action.payload.detail;
    },
    criteriaChanged(state, action: PayloadAction<Partial<RecipeSearchCriteria>>) {
      state.criteria = { ...state.criteria, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder.addCase(unauthenticated, () => initialState);
  },
});

export const {
  statusChanged,
  feedReset,
  feedPageReceived,
  randomReceived,
  similarRequested,
  similarReceived,
  detailReceived,
  criteriaChanged,
} = recipeSlice.actions;

export default recipeSlice.reducer;

/*
 * Thunk thường (không dùng createAsyncThunk) để lỗi gốc (ApiError) được ném nguyên cho hook.
 */

let requestCounter = 0;

const withStatus =
  <T>(task: RecipeTask, status: RecipeStatus, run: () => Promise<T>): AppThunk<Promise<T>> =>
  async (dispatch) => {
    dispatch(statusChanged({ task, status }));
    try {
      return await run();
    } finally {
      dispatch(statusChanged({ task, status: 'idle' }));
    }
  };

/**
 * Tải một danh sách phân trang. `append = true` lấy trang kế tiếp từ con trỏ đang lưu;
 * `append = false` tải lại từ đầu và huỷ kết quả của các lần tải cũ.
 */
const loadFeed =
  (
    feed: RecipeFeedKey,
    append: boolean,
    request: (cursor: string | null) => Promise<CursorResponse<RecipeSummaryResponse>>,
  ): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const current = getState().recipe.feeds[feed];
    if (append && (!current.hasNext || getState().recipe.status[feed] !== 'idle')) return;

    let requestKey = current.requestKey;
    if (!append) {
      requestKey = ++requestCounter;
      dispatch(feedReset({ feed, requestKey }));
    }

    await dispatch(
      withStatus(feed, append ? 'loadingMore' : 'loading', async () => {
        const response = await request(append ? current.nextCursor : null);
        dispatch(feedPageReceived({ feed, requestKey, response, append }));
      }),
    );
  };

/** Xoá danh sách đang hiện (và huỷ các lần tải đang chạy của danh sách đó). */
export const clearFeed =
  (feed: RecipeFeedKey): AppThunk =>
  (dispatch) => {
    dispatch(feedReset({ feed, requestKey: ++requestCounter }));
  };

export const fetchSearchResults =
  (append = false): AppThunk<Promise<void>> =>
  (dispatch, getState) => {
    const { ingredients, cuisineId, maxMinutes, difficulty } = getState().recipe.criteria;
    return dispatch(
      loadFeed('search', append, (cursor) =>
        recipeService.search({ ingredients, cuisineId, maxMinutes, difficulty, cursor }),
      ),
    );
  };

export const fetchSuggestions =
  (append = false): AppThunk<Promise<void>> =>
  (dispatch) =>
    dispatch(loadFeed('suggestions', append, (cursor) => recipeService.suggestions({ cursor })));

export const fetchByName =
  (q: string, append = false): AppThunk<Promise<void>> =>
  (dispatch) =>
    dispatch(loadFeed('byName', append, (cursor) => recipeService.byName({ q, cursor })));

export const fetchRandom =
  (count?: number): AppThunk<Promise<void>> =>
  (dispatch) =>
    dispatch(
      withStatus('random', 'loading', async () => {
        dispatch(randomReceived(await recipeService.random(count)));
      }),
    );

export const fetchSimilar =
  (externalId: string): AppThunk<Promise<void>> =>
  (dispatch) => {
    dispatch(similarRequested(externalId));
    return dispatch(
      withStatus('similar', 'loading', async () => {
        const items = await recipeService.similar(externalId);
        dispatch(similarReceived({ externalId, items }));
      }),
    );
  };

/** Dùng bản đã tải trong phiên nếu có; `force` để tải lại từ server. */
export const fetchRecipeDetail =
  (externalId: string, force = false): AppThunk<Promise<RecipeDetailResponse>> =>
  async (dispatch, getState) => {
    const cached = getState().recipe.details[externalId];
    if (cached && !force) return cached;

    return dispatch(
      withStatus('detail', 'loading', async () => {
        const detail = await recipeService.getDetail(externalId);
        dispatch(detailReceived({ externalId, detail }));
        return detail;
      }),
    );
  };

/** Kết quả quy đổi chỉ để hiển thị, không ghi đè bản chi tiết gốc trong cache. */
export const scaleRecipe =
  (externalId: string, servings: number): AppThunk<Promise<RecipeDetailResponse>> =>
  (dispatch) =>
    dispatch(withStatus('scale', 'loading', () => recipeService.scale(externalId, servings)));
