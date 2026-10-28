import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { cuisineService } from "@/core/di/container";
import { unauthenticated } from "@/features/auth/authSlice";
import type { AppThunk } from "@/store/hooks";
import type { CuisineRequest, CuisineResponse } from "@/types";

export type CuisineStatus = "idle" | "loading" | "saving";

interface CuisineState {
  items: CuisineResponse[];
  /** Đã tải ít nhất một lần, để các màn hình không tải lại không cần thiết. */
  loaded: boolean;
  status: CuisineStatus;
}

const initialState: CuisineState = { items: [], loaded: false, status: "idle" };

const cuisineSlice = createSlice({
  name: "cuisine",
  initialState,
  reducers: {
    statusChanged(state, action: PayloadAction<CuisineStatus>) {
      state.status = action.payload;
    },
    cuisinesLoaded(state, action: PayloadAction<CuisineResponse[]>) {
      state.items = action.payload;
      state.loaded = true;
    },
    cuisineUpserted(state, action: PayloadAction<CuisineResponse>) {
      const index = state.items.findIndex((c) => c.id === action.payload.id);
      if (index >= 0) state.items[index] = action.payload;
      else state.items.push(action.payload);
    },
    cuisineRemoved(state, action: PayloadAction<string>) {
      state.items = state.items.filter((c) => c.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(unauthenticated, () => initialState);
  },
});

export const { statusChanged, cuisinesLoaded, cuisineUpserted, cuisineRemoved } = cuisineSlice.actions;
export default cuisineSlice.reducer;

/*
 * Thunk thường (không dùng createAsyncThunk) để lỗi gốc được ném nguyên cho hook.
 */

const withStatus = async <T>(
  dispatch: (a: ReturnType<typeof statusChanged>) => unknown,
  status: CuisineStatus,
  run: () => Promise<T>,
): Promise<T> => {
  dispatch(statusChanged(status));
  try {
    return await run();
  } finally {
    dispatch(statusChanged("idle"));
  }
};

/** Chỉ gọi API lần đầu; truyền `force` để tải lại. */
export const fetchCuisines =
  (force = false): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { loaded, status } = getState().cuisine;
    if ((loaded && !force) || status === "loading") return;
    await withStatus(dispatch, "loading", async () => {
      dispatch(cuisinesLoaded(await cuisineService.list()));
    });
  };

export const createCuisine =
  (body: CuisineRequest): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await withStatus(dispatch, "saving", async () => {
      dispatch(cuisineUpserted(await cuisineService.create(body)));
    });
  };

export const updateCuisine =
  (id: string, body: CuisineRequest): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await withStatus(dispatch, "saving", async () => {
      dispatch(cuisineUpserted(await cuisineService.update(id, body)));
    });
  };

export const deleteCuisine =
  (id: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await withStatus(dispatch, "saving", async () => {
      await cuisineService.remove(id);
      dispatch(cuisineRemoved(id));
    });
  };
