import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { shoppingService } from "@/core/di/container";
import { unauthenticated } from "@/features/auth/authSlice";
import type { AppThunk } from "@/store/hooks";
import type {
  PantryItemResponse,
  ShoppingItemCreateRequest,
  ShoppingItemResponse,
  ShoppingListDetailResponse,
  ShoppingListResponse,
} from "@/types";
import type { ShoppingItemPatch } from "./shoppingService";

export type ShoppingStatus = "idle" | "loading" | "loadingMore" | "loadingDetail" | "saving";

interface ShoppingState {
  lists: ShoppingListResponse[];
  hasNext: boolean;
  nextCursor: string | null;
  detail: ShoppingListDetailResponse | null;
  status: ShoppingStatus;
}

const initialState: ShoppingState = {
  lists: [],
  hasNext: false,
  nextCursor: null,
  detail: null,
  status: "idle",
};

const shoppingSlice = createSlice({
  name: "shopping",
  initialState,
  reducers: {
    statusChanged(state, action: PayloadAction<ShoppingStatus>) {
      state.status = action.payload;
    },
    listsLoaded(
      state,
      action: PayloadAction<{
        items: ShoppingListResponse[];
        hasNext: boolean;
        nextCursor: string | null;
        replace: boolean;
      }>,
    ) {
      const { items, hasNext, nextCursor, replace } = action.payload;
      state.lists = replace ? items : [...state.lists, ...items];
      state.hasNext = hasNext;
      state.nextCursor = nextCursor;
    },
    listUpserted(state, action: PayloadAction<ShoppingListResponse>) {
      const index = state.lists.findIndex((l) => l.id === action.payload.id);
      if (index >= 0) state.lists[index] = action.payload;
      else state.lists.unshift(action.payload);
      if (state.detail?.id === action.payload.id) state.detail.name = action.payload.name;
    },
    listRemoved(state, action: PayloadAction<string>) {
      state.lists = state.lists.filter((l) => l.id !== action.payload);
      if (state.detail?.id === action.payload) state.detail = null;
    },
    detailLoaded(state, action: PayloadAction<ShoppingListDetailResponse>) {
      state.detail = action.payload;
    },
    detailCleared(state) {
      state.detail = null;
    },
    itemUpserted(state, action: PayloadAction<ShoppingItemResponse>) {
      if (!state.detail) return;
      const index = state.detail.items.findIndex((i) => i.id === action.payload.id);
      if (index >= 0) state.detail.items[index] = action.payload;
      else state.detail.items.push(action.payload);
    },
    itemRemoved(state, action: PayloadAction<string>) {
      if (!state.detail) return;
      state.detail.items = state.detail.items.filter((i) => i.id !== action.payload);
    },
  },
  // Đăng xuất thì bỏ dữ liệu của tài khoản cũ.
  extraReducers: (builder) => {
    builder.addCase(unauthenticated, () => initialState);
  },
});

export const {
  statusChanged,
  listsLoaded,
  listUpserted,
  listRemoved,
  detailLoaded,
  detailCleared,
  itemUpserted,
  itemRemoved,
} = shoppingSlice.actions;
export default shoppingSlice.reducer;

/*
 * Thunk thường (không dùng createAsyncThunk) để lỗi gốc được ném nguyên cho hook.
 */

const withStatus = async <T>(
  dispatch: (a: ReturnType<typeof statusChanged>) => unknown,
  status: ShoppingStatus,
  run: () => Promise<T>,
): Promise<T> => {
  dispatch(statusChanged(status));
  try {
    return await run();
  } finally {
    dispatch(statusChanged("idle"));
  }
};

// ───────── Danh sách ─────────

/** Tải trang đầu, hoặc trang kế tiếp khi `loadMore = true`. */
export const fetchShoppingLists =
  (loadMore = false): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { hasNext, nextCursor } = getState().shopping;
    if (loadMore && (!hasNext || !nextCursor)) return;

    await withStatus(dispatch, loadMore ? "loadingMore" : "loading", async () => {
      const page = await shoppingService.getLists({ cursor: loadMore ? (nextCursor ?? undefined) : undefined });
      dispatch(
        listsLoaded({
          items: page.content,
          hasNext: page.hasNext,
          nextCursor: page.nextCursor,
          replace: !loadMore,
        }),
      );
    });
  };

export const createShoppingList =
  (name: string): AppThunk<Promise<ShoppingListResponse>> =>
  async (dispatch) =>
    withStatus(dispatch, "saving", async () => {
      const created = await shoppingService.createList({ name });
      dispatch(listUpserted(created));
      return created;
    });

export const renameShoppingList =
  (id: string, name: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await withStatus(dispatch, "saving", async () => {
      dispatch(listUpserted(await shoppingService.renameList(id, name)));
    });
  };

/** Tạo từ thực đơn (BE đã trừ đồ trong tủ). Lưu luôn chi tiết để mở ngay mà không phải tải lại. */
export const createShoppingListFromMealPlan =
  (mealPlanId: string): AppThunk<Promise<ShoppingListDetailResponse>> =>
  async (dispatch) =>
    withStatus(dispatch, "saving", async () => {
      const detail = await shoppingService.createListFromMealPlan(mealPlanId);
      dispatch(listUpserted({ id: detail.id, name: detail.name }));
      dispatch(detailLoaded(detail));
      return detail;
    });

/** Tạo từ một công thức. Lưu luôn chi tiết để mở ngay mà không phải tải lại. */
export const createShoppingListFromRecipe =
  (recipeId: string): AppThunk<Promise<ShoppingListDetailResponse>> =>
  async (dispatch) =>
    withStatus(dispatch, "saving", async () => {
      const detail = await shoppingService.createListFromRecipe(recipeId);
      dispatch(listUpserted({ id: detail.id, name: detail.name }));
      dispatch(detailLoaded(detail));
      return detail;
    });

export const deleteShoppingList =
  (id: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await withStatus(dispatch, "saving", async () => {
      await shoppingService.removeList(id);
      dispatch(listRemoved(id));
    });
  };

// ───────── Chi tiết và mục ─────────

export const fetchShoppingListDetail =
  (id: string): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    // Đổi sang danh sách khác thì bỏ dữ liệu cũ để không nháy nội dung của danh sách trước.
    if (getState().shopping.detail?.id !== id) dispatch(detailCleared());
    await withStatus(dispatch, "loadingDetail", async () => {
      dispatch(detailLoaded(await shoppingService.getList(id)));
    });
  };

export const addShoppingItem =
  (listId: string, body: ShoppingItemCreateRequest): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await withStatus(dispatch, "saving", async () => {
      dispatch(itemUpserted(await shoppingService.addItem(listId, body)));
    });
  };

export const updateShoppingItem =
  (listId: string, item: ShoppingItemResponse, patch: ShoppingItemPatch): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await withStatus(dispatch, "saving", async () => {
      dispatch(itemUpserted(await shoppingService.updateItem(listId, item, patch)));
    });
  };

/** Không đặt trạng thái "saving" để tích mua nhiều mục liên tiếp không bị khoá giao diện. */
export const toggleShoppingItem =
  (listId: string, item: ShoppingItemResponse): AppThunk<Promise<void>> =>
  async (dispatch) => {
    dispatch(itemUpserted(await shoppingService.toggleItem(listId, item)));
  };

/** Chuyển các mục đã mua vào tủ rồi tải lại chi tiết, vì BE xoá các mục đã chuyển khỏi danh sách. */
export const moveShoppingItemsToPantry =
  (listId: string): AppThunk<Promise<PantryItemResponse[]>> =>
  async (dispatch) =>
    withStatus(dispatch, "saving", async () => {
      const moved = await shoppingService.moveBoughtToPantry(listId);
      dispatch(detailLoaded(await shoppingService.getList(listId)));
      return moved;
    });

export const deleteShoppingItem =
  (listId: string, itemId: string): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await shoppingService.removeItem(listId, itemId);
    dispatch(itemRemoved(itemId));
  };
