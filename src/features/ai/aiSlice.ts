import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { aiService, mealPlanService } from "@/core/di/container";
import { unauthenticated } from "@/features/auth/authSlice";
import type { AppThunk } from "@/store/hooks";
import type { AiMealPlanRequest, AiMealPlanResponse } from "@/types";

interface AiState {
  /** Bản nháp từ POST /v1/ai/meal-plan, CHƯA lưu lên server. */
  mealPlanDraft: AiMealPlanResponse | null;
}

const initialState: AiState = { mealPlanDraft: null };

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    mealPlanDraftReceived(state, action: PayloadAction<AiMealPlanResponse>) {
      state.mealPlanDraft = action.payload;
    },
    mealPlanEntryRemoved(state, action: PayloadAction<number>) {
      state.mealPlanDraft?.entries.splice(action.payload, 1);
    },
    mealPlanDraftCleared(state) {
      state.mealPlanDraft = null;
    },
  },
  // Đăng xuất thì bỏ bản nháp, tránh lộ sang tài khoản khác
  extraReducers: (builder) => {
    builder.addCase(unauthenticated, () => initialState);
  },
});

export const {
  mealPlanDraftReceived,
  mealPlanEntryRemoved,
  mealPlanDraftCleared,
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
