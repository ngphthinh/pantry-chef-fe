import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { unitService } from "@/core/di/container";
import { unauthenticated } from "@/features/auth/authSlice";
import type { AppThunk } from "@/store/hooks";
import type { UnitConvertResponse } from "@/types";
import type { UnitConvertQuery } from "./types";

export type UnitStatus = "idle" | "converting";

interface UnitState {
  status: UnitStatus;
  result: UnitConvertResponse | null;
}

const initialState: UnitState = { status: "idle", result: null };

const unitSlice = createSlice({
  name: "unit",
  initialState,
  reducers: {
    statusChanged(state, action: PayloadAction<UnitStatus>) {
      state.status = action.payload;
    },
    converted(state, action: PayloadAction<UnitConvertResponse>) {
      state.result = action.payload;
    },
    resultCleared(state) {
      state.result = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(unauthenticated, () => initialState);
  },
});

export const { statusChanged, converted, resultCleared } = unitSlice.actions;
export default unitSlice.reducer;

/*
 * Thunk thường (không dùng createAsyncThunk) để lỗi gốc được ném nguyên cho hook.
 */

export const convertUnit =
  (query: UnitConvertQuery): AppThunk<Promise<UnitConvertResponse>> =>
  async (dispatch) => {
    dispatch(statusChanged("converting"));
    try {
      const result = await unitService.convert(query);
      dispatch(converted(result));
      return result;
    } finally {
      dispatch(statusChanged("idle"));
    }
  };
