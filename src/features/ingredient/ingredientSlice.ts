import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { ingredientService } from "@/core/di/container";
import { unauthenticated } from "@/features/auth/authSlice";
import type { AppThunk } from "@/store/hooks";
import type {
  CursorResponse,
  IngredientCategoryRequest,
  IngredientCategoryResponse,
  IngredientCreateRequest,
  IngredientResponse,
  IngredientUpdateRequest,
} from "@/types";
import type { IngredientQuery } from "./types";

export type IngredientStatus =
  | "idle"
  | "loadingCategories"
  | "lookingUp"
  | "saving";

interface IngredientState {
  categories: IngredientCategoryResponse[];
  categoriesLoaded: boolean;
  status: IngredientStatus;
}

const initialState: IngredientState = {
  categories: [],
  categoriesLoaded: false,
  status: "idle",
};

const ingredientSlice = createSlice({
  name: "ingredient",
  initialState,
  reducers: {
    statusChanged(state, action: PayloadAction<IngredientStatus>) {
      state.status = action.payload;
    },
    categoriesLoaded(
      state,
      action: PayloadAction<IngredientCategoryResponse[]>,
    ) {
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

export const fetchIngredientCategories =
  (force = false): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { categoriesLoaded: loaded, status } = getState().ingredient;
    if ((loaded && !force) || status === "loadingCategories") return;
    await withStatus(dispatch, "loadingCategories", async () => {
      dispatch(categoriesLoaded(await ingredientService.listCategories()));
    });
  };

export const searchIngredients =
  (
    query: IngredientQuery,
  ): AppThunk<Promise<CursorResponse<IngredientResponse>>> =>
  async () =>
    ingredientService.search(query);

export const fetchIngredientById =
  (id: string): AppThunk<Promise<IngredientResponse>> =>
  async (dispatch) =>
    withStatus(dispatch, "lookingUp", () => ingredientService.getById(id));

export const lookupIngredientByBarcode =
  (code: string): AppThunk<Promise<IngredientResponse>> =>
  async (dispatch) =>
    withStatus(dispatch, "lookingUp", () =>
      ingredientService.getByBarcode(code),
    );

export const createIngredient =
  (body: IngredientCreateRequest): AppThunk<Promise<IngredientResponse>> =>
  async (dispatch) =>
    withStatus(dispatch, "saving", () => ingredientService.create(body));

export const updateIngredient =
  (
    id: string,
    body: IngredientUpdateRequest,
  ): AppThunk<Promise<IngredientResponse>> =>
  async (dispatch) =>
    withStatus(dispatch, "saving", () => ingredientService.update(id, body));

export const deleteIngredient =
  (id: string): AppThunk<Promise<void>> =>
  async (dispatch) =>
    withStatus(dispatch, "saving", () => ingredientService.remove(id));

export const saveIngredientCategory =
  (
    id: string | null,
    body: IngredientCategoryRequest,
  ): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await withStatus(dispatch, "saving", async () => {
      if (id) await ingredientService.updateCategory(id, body);
      else await ingredientService.createCategory(body);
      dispatch(categoriesLoaded(await ingredientService.listCategories()));
    });
  };

export const deleteIngredientCategory =
  (id: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await withStatus(dispatch, "saving", async () => {
      await ingredientService.removeCategory(id);
      dispatch(categoriesLoaded(await ingredientService.listCategories()));
    });
  };
