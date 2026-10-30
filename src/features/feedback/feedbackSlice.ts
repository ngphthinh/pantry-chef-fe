import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { feedbackService } from "@/core/di/container";
import { unauthenticated } from "@/features/auth/authSlice";
import type { AppThunk } from "@/store/hooks";
import type { FeedbackCreateRequest } from "@/types";

export type FeedbackStatus = "idle" | "sending";

const initialState = { status: "idle" as FeedbackStatus };

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    statusChanged(state, action: PayloadAction<FeedbackStatus>) {
      state.status = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(unauthenticated, () => initialState);
  },
});

export const { statusChanged } = feedbackSlice.actions;
export default feedbackSlice.reducer;

/*
 * Thunk thường (không dùng createAsyncThunk) để lỗi gốc được ném nguyên cho hook.
 */

export const sendFeedback =
  (body: FeedbackCreateRequest): AppThunk<Promise<void>> =>
  async (dispatch) => {
    dispatch(statusChanged("sending"));
    try {
      await feedbackService.create(body);
    } finally {
      dispatch(statusChanged("idle"));
    }
  };
