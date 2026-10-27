import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { aiService, mealPlanService } from "@/core/di/container";
import { unauthenticated } from "@/features/auth/authSlice";
import type { AppThunk } from "@/store/hooks";
import type {
  AdaptRecipeRequest,
  AiMealPlanRequest,
  AiMealPlanResponse,
  PickedImage,
  RecipeIdeaResponse,
  RecipeIdeasRequest,
  AiRecipeDetailResponse,
  RecognizedIngredientResponse,
  SubstitutionRequest,
  SubstitutionResponse,
} from "@/types";

export type AiStatus = "idle" | "loading";

interface AiState {
  /** Bản nháp từ POST /v1/ai/meal-plan, CHƯA lưu lên server. */
  mealPlanDraft: AiMealPlanResponse | null;
  /** Kết quả nhận diện nguyên liệu từ ảnh (POST /v1/ai/recognize). */
  recognized: RecognizedIngredientResponse[];

  /** Gợi ý món từ POST /v1/ai/recipe-ideas. */
  ideas: RecipeIdeaResponse[];
  /** Trạng thái tải của phần gợi ý món. */
  status: AiStatus;
  /** Đã bấm tạo ít nhất một lần, để phân biệt "chưa tạo" với "tạo xong nhưng rỗng". */
  generated: boolean;

  /** Nguyên liệu thay thế từ POST /v1/ai/substitutions (tối đa 3). */
  substitutions: SubstitutionResponse[];
  /** Trạng thái tải riêng, không dùng chung với phần gợi ý món. */
  substitutionStatus: AiStatus;
  /** Đã tìm ít nhất một lần, để phân biệt "chưa tìm" với "tìm xong nhưng rỗng". */
  substitutionsSearched: boolean;

  /** Công thức đã điều chỉnh từ POST /v1/ai/adapt-recipe. */
  adaptedRecipe: AiRecipeDetailResponse | null;
  /** Trạng thái tải riêng của phần điều chỉnh công thức. */
  adaptStatus: AiStatus;
}

const initialState: AiState = {
  mealPlanDraft: null,
  recognized: [],
  ideas: [],
  status: "idle",
  generated: false,
  substitutions: [],
  substitutionStatus: "idle",
  substitutionsSearched: false,
  adaptedRecipe: null,
  adaptStatus: "idle",
};

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    // --- Thực đơn AI ---
    mealPlanDraftReceived(state, action: PayloadAction<AiMealPlanResponse>) {
      state.mealPlanDraft = action.payload;
    },
    mealPlanEntryRemoved(state, action: PayloadAction<number>) {
      state.mealPlanDraft?.entries.splice(action.payload, 1);
    },
    mealPlanDraftCleared(state) {
      state.mealPlanDraft = null;
    },

    // --- Nhận diện nguyên liệu ---
    recognitionReceived(
      state,
      action: PayloadAction<RecognizedIngredientResponse[]>,
    ) {
      state.recognized = action.payload;
    },
    recognitionCleared(state) {
      state.recognized = [];
    },

    // --- Gợi ý món ---
    statusChanged(state, action: PayloadAction<AiStatus>) {
      state.status = action.payload;
    },
    ideasLoaded(state, action: PayloadAction<RecipeIdeaResponse[]>) {
      state.ideas = action.payload;
      state.generated = true;
    },
    // Chỉ xoá phần gợi ý, không đụng tới bản nháp thực đơn / kết quả nhận diện
    ideasCleared(state) {
      state.ideas = [];
      state.generated = false;
    },

    // --- Nguyên liệu thay thế ---
    substitutionStatusChanged(state, action: PayloadAction<AiStatus>) {
      state.substitutionStatus = action.payload;
    },
    substitutionsLoaded(state, action: PayloadAction<SubstitutionResponse[]>) {
      state.substitutions = action.payload;
      state.substitutionsSearched = true;
    },
    substitutionsCleared(state) {
      state.substitutions = [];
      state.substitutionsSearched = false;
    },

    // --- Công thức đã điều chỉnh ---
    adaptStatusChanged(state, action: PayloadAction<AiStatus>) {
      state.adaptStatus = action.payload;
    },
    adaptedRecipeLoaded(state, action: PayloadAction<AiRecipeDetailResponse>) {
      state.adaptedRecipe = action.payload;
    },
    adaptedRecipeCleared(state) {
      state.adaptedRecipe = null;
    },
  },
  // Đăng xuất thì bỏ toàn bộ dữ liệu AI, tránh lộ sang tài khoản khác
  extraReducers: (builder) => {
    builder.addCase(unauthenticated, () => initialState);
  },
});

export const {
  mealPlanDraftReceived,
  mealPlanEntryRemoved,
  mealPlanDraftCleared,
  recognitionReceived,
  recognitionCleared,
  statusChanged,
  ideasLoaded,
  ideasCleared,
  substitutionStatusChanged,
  substitutionsLoaded,
  substitutionsCleared,
  adaptStatusChanged,
  adaptedRecipeLoaded,
  adaptedRecipeCleared,
} = aiSlice.actions;
export default aiSlice.reducer;

/* Thunk thường: lỗi gốc (ApiError) được ném nguyên cho màn hình. */

export const generateMealPlanDraft =
  (input: AiMealPlanRequest): AppThunk<Promise<void>> =>
  async (dispatch) => {
    dispatch(mealPlanDraftReceived(await aiService.generateMealPlan(input)));
  };

/** Lưu bản nháp (đã chỉnh) bằng POST /v1/meal-plans rồi xoá nháp. */
export const saveMealPlanDraft =
  (): AppThunk<Promise<void>> => async (dispatch, getState) => {
    const draft = getState().ai.mealPlanDraft;
    if (!draft || draft.entries.length === 0) return;

    await mealPlanService.createFromAiDraft(draft);
    dispatch(mealPlanDraftCleared());
  };

/** Gửi ảnh lên AI, lưu và trả về danh sách nguyên liệu nhận diện được. */
export const recognizeIngredients =
  (image: PickedImage): AppThunk<Promise<RecognizedIngredientResponse[]>> =>
  async (dispatch) => {
    const result = await aiService.recognizeIngredients(image);
    dispatch(recognitionReceived(result));
    return result;
  };

/** Tạo gợi ý món từ tủ đồ (POST /v1/ai/recipe-ideas). */
export const generateIdeas =
  (input: RecipeIdeasRequest): AppThunk<Promise<void>> =>
  async (dispatch) => {
    dispatch(statusChanged("loading"));
    try {
      dispatch(ideasLoaded(await aiService.recipeIdeas(input)));
    } finally {
      dispatch(statusChanged("idle"));
    }
  };

/** Tìm nguyên liệu thay thế (POST /v1/ai/substitutions). */
export const fetchSubstitutions =
  (input: SubstitutionRequest): AppThunk<Promise<void>> =>
  async (dispatch) => {
    dispatch(substitutionStatusChanged("loading"));
    try {
      dispatch(substitutionsLoaded(await aiService.substitutions(input)));
    } finally {
      dispatch(substitutionStatusChanged("idle"));
    }
  };

/** Điều chỉnh công thức theo nguyên liệu loại trừ (POST /v1/ai/adapt-recipe). */
export const adaptRecipe =
  (recipeId: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const input: AdaptRecipeRequest = { recipeId };
    dispatch(adaptStatusChanged("loading"));
    try {
      dispatch(adaptedRecipeLoaded(await aiService.adaptRecipe(input)));
    } finally {
      dispatch(adaptStatusChanged("idle"));
    }
  };
