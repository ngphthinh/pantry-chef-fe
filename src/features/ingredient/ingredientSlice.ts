import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { ingredientService } from "@/core/di/container";
import { unauthenticated } from "@/features/auth/authSlice";
import type { AppThunk } from "@/store/hooks";
import type { CursorResponse, IngredientCategoryResponse, IngredientResponse } from "@/types";
import type { IngredientQuery } from "./types";

export type IngredientStatus = "idle" | "loadingCategories" | "lookingUp";

interface IngredientState {
  categories: IngredientCategoryResponse[];
  /** Đã tải nhóm ít nhất một lần, để các màn hình không tải lại không cần thiết. */
  categoriesLoaded: boolean;
  status: IngredientStatus;
}

const initialState: IngredientState = { categories: [], categoriesLoaded: false, status: "idle" };

const ingredientSlice = createSlice({
  name: "ingredient",
  initialState,
  reducers: {
    statusChanged(state, action: PayloadAction<IngredientStatus>) {
      state.status = action.payload;
    },
    categoriesLoaded(state, action: PayloadAction<IngredientCategoryResponse[]>) {
      state.categories = action.payload;
      state.categoriesLoaded = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(unauthenticated, () => initialState);
  },
});

export const { statusChanged, categoriesLoaded } = ingredientSlice.actions;
export default ingredientSlice.reducer;

/*
 * Thunk thường (không dùng createAsyncThunk) để lỗi gốc được ném nguyên cho hook.
 */

const withStatus = async <T>(
  dispatch: (a: ReturnType<typeof statusChanged>) => unknown,
  status: IngredientStatus,
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
export const fetchIngredientCategories =
  (force = false): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { categoriesLoaded: loaded, status } = getState().ingredient;
    if ((loaded && !force) || status === "loadingCategories") return;
    await withStatus(dispatch, "loadingCategories", async () => {
      dispatch(categoriesLoaded(await ingredientService.listCategories()));
    });
  };

/**
 * Kết quả tìm kiếm KHÔNG lưu vào store: mỗi màn hình (chọn nguyên liệu, nguyên liệu loại trừ...)
 * có từ khoá và danh sách riêng, lưu chung sẽ ghi đè lẫn nhau. Hook `useIngredientSearch` giữ danh sách.
 */
export const searchIngredients =
  (query: IngredientQuery): AppThunk<Promise<CursorResponse<IngredientResponse>>> =>
  async () =>
    ingredientService.search(query);

export const lookupIngredientByBarcode =
  (code: string): AppThunk<Promise<IngredientResponse>> =>
  async (dispatch) =>
    withStatus(dispatch, "lookingUp", () => ingredientService.getByBarcode(code));
