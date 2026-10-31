import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { excludedIngredientService } from "@/core/di/container";
import { unauthenticated } from "@/features/auth/authSlice";
import type { AppThunk } from "@/store/hooks";
import type { ExcludedIngredientResponse } from "@/types";

export type ExcludedIngredientStatus = "idle" | "loading" | "saving";

interface ExcludedIngredientState {
  items: ExcludedIngredientResponse[];
  loaded: boolean;
  status: ExcludedIngredientStatus;
}

const initialState: ExcludedIngredientState = { items: [], loaded: false, status: "idle" };

const excludedIngredientSlice = createSlice({
  name: "excludedIngredient",
  initialState,
  reducers: {
    statusChanged(state, action: PayloadAction<ExcludedIngredientStatus>) {
      state.status = action.payload;
    },
    itemsLoaded(state, action: PayloadAction<ExcludedIngredientResponse[]>) {
      state.items = action.payload;
      state.loaded = true;
    },
    itemAdded(state, action: PayloadAction<ExcludedIngredientResponse>) {
      state.items.push(action.payload);
    },
    itemRemoved(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    // Dữ liệu cá nhân: đăng xuất thì xoá để tài khoản sau không thấy
    builder.addCase(unauthenticated, () => initialState);
  },
});

export const { statusChanged, itemsLoaded, itemAdded, itemRemoved } = excludedIngredientSlice.actions;
export default excludedIngredientSlice.reducer;

/*
 * Thunk thường (không dùng createAsyncThunk) để lỗi gốc được ném nguyên cho hook.
 */

const withStatus = async <T>(
  dispatch: (a: ReturnType<typeof statusChanged>) => unknown,
  status: ExcludedIngredientStatus,
  run: () => Promise<T>,
): Promise<T> => {
  dispatch(statusChanged(status));
  try {
    return await run();
  } finally {
    dispatch(statusChanged("idle"));
  }
};

export const fetchExcludedIngredients = (): AppThunk<Promise<void>> => async (dispatch) => {
  await withStatus(dispatch, "loading", async () => {
    dispatch(itemsLoaded(await excludedIngredientService.list()));
  });
};

export const addExcludedIngredient =
  (name: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await withStatus(dispatch, "saving", async () => {
      dispatch(itemAdded(await excludedIngredientService.add(name)));
    });
  };

export const removeExcludedIngredient =
  (id: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await withStatus(dispatch, "saving", async () => {
      await excludedIngredientService.remove(id);
      dispatch(itemRemoved(id));
    });
  };
