import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { pantryService } from '@/core/di/container';
import type { AppThunk } from '@/store/hooks';
import type {
  CursorResponse,
  PantryItemBatchCreateRequest,
  PantryItemCreateRequest,
  PantryItemResponse,
  PantryItemUpdateRequest,
  PickedImage,
} from '@/types';
import type { PantryQuery } from './types';

export type PantryStatus =
  | 'idle'
  | 'loading'
  | 'saving'
  | 'consuming'
  | 'deleting'
  | 'uploading';

export interface PantryState {
  items: PantryItemResponse[];
  expiringItems: PantryItemResponse[];
  selectedItem: PantryItemResponse | null;
  status: PantryStatus;
  hasNext: boolean;
  nextCursor: string | null;
  error: string | null;
}

const initialState: PantryState = {
  items: [],
  expiringItems: [],
  selectedItem: null,
  status: 'idle',
  hasNext: false,
  nextCursor: null,
  error: null,
};

const pantrySlice = createSlice({
  name: 'pantry',
  initialState,
  reducers: {
    statusChanged(state, action: PayloadAction<PantryStatus>) {
      state.status = action.payload;
    },
    itemsReceived(
      state,
      action: PayloadAction<{ response: CursorResponse<PantryItemResponse>; append: boolean }>,
    ) {
      const { response, append } = action.payload;
      if (append) {
        state.items = [...state.items, ...response.content];
      } else {
        state.items = response.content;
      }
      state.hasNext = response.hasNext;
      state.nextCursor = response.nextCursor;
      state.error = null;
    },
    expiringItemsReceived(state, action: PayloadAction<PantryItemResponse[]>) {
      state.expiringItems = action.payload;
    },
    selectedItemReceived(state, action: PayloadAction<PantryItemResponse | null>) {
      state.selectedItem = action.payload;
    },
    itemCreated(state, action: PayloadAction<PantryItemResponse>) {
      state.items.unshift(action.payload);
      if (state.selectedItem?.id === action.payload.id) {
        state.selectedItem = action.payload;
      }
    },
    batchItemsCreated(state, action: PayloadAction<PantryItemResponse[]>) {
      state.items = [...action.payload, ...state.items];
    },
    itemUpdated(state, action: PayloadAction<PantryItemResponse>) {
      const updated = action.payload;
      const index = state.items.findIndex((i) => i.id === updated.id);
      if (index !== -1) {
        state.items[index] = updated;
      }
      const expIndex = state.expiringItems.findIndex((i) => i.id === updated.id);
      if (expIndex !== -1) {
        state.expiringItems[expIndex] = updated;
      }
      if (state.selectedItem?.id === updated.id) {
        state.selectedItem = updated;
      }
    },
    itemRemoved(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.items = state.items.filter((i) => i.id !== id);
      state.expiringItems = state.expiringItems.filter((i) => i.id !== id);
      if (state.selectedItem?.id === id) {
        state.selectedItem = null;
      }
    },
  },
});

export const {
  statusChanged,
  itemsReceived,
  expiringItemsReceived,
  selectedItemReceived,
  itemCreated,
  batchItemsCreated,
  itemUpdated,
  itemRemoved,
} = pantrySlice.actions;

export default pantrySlice.reducer;

const withStatus =
  <T>(status: PantryStatus, run: () => Promise<T>): AppThunk<Promise<T>> =>
  async (dispatch) => {
    dispatch(statusChanged(status));
    try {
      return await run();
    } finally {
      dispatch(statusChanged('idle'));
    }
  };

export const fetchPantryItems =
  (query: PantryQuery = {}, append = false): AppThunk<Promise<CursorResponse<PantryItemResponse>>> =>
  (dispatch) =>
    dispatch(
      withStatus('loading', async () => {
        const response = await pantryService.list(query);
        dispatch(itemsReceived({ response, append }));
        return response;
      }),
    );

export const fetchExpiringItems =
  (days = 3): AppThunk<Promise<PantryItemResponse[]>> =>
  (dispatch) =>
    dispatch(
      withStatus('loading', async () => {
        const result = await pantryService.expiring(days);
        dispatch(expiringItemsReceived(result));
        return result;
      }),
    );

export const fetchPantryItemById =
  (id: string): AppThunk<Promise<PantryItemResponse>> =>
  (dispatch) =>
    dispatch(
      withStatus('loading', async () => {
        const result = await pantryService.getById(id);
        dispatch(selectedItemReceived(result));
        return result;
      }),
    );

export const createPantryItem =
  (body: PantryItemCreateRequest): AppThunk<Promise<PantryItemResponse>> =>
  (dispatch) =>
    dispatch(
      withStatus('saving', async () => {
        const result = await pantryService.create(body);
        dispatch(itemCreated(result));
        return result;
      }),
    );

export const createPantryBatch =
  (body: PantryItemBatchCreateRequest): AppThunk<Promise<PantryItemResponse[]>> =>
  (dispatch) =>
    dispatch(
      withStatus('saving', async () => {
        const result = await pantryService.createBatch(body);
        dispatch(batchItemsCreated(result));
        return result;
      }),
    );

export const updatePantryItem =
  (id: string, body: PantryItemUpdateRequest): AppThunk<Promise<PantryItemResponse>> =>
  (dispatch) =>
    dispatch(
      withStatus('saving', async () => {
        const result = await pantryService.update(id, body);
        dispatch(itemUpdated(result));
        return result;
      }),
    );

export const consumePantryItem =
  (id: string, quantity: number): AppThunk<Promise<PantryItemResponse>> =>
  (dispatch) =>
    dispatch(
      withStatus('consuming', async () => {
        const result = await pantryService.consume(id, quantity);
        dispatch(itemUpdated(result));
        return result;
      }),
    );

export const deletePantryItem =
  (id: string): AppThunk<Promise<void>> =>
  (dispatch) =>
    dispatch(
      withStatus('deleting', async () => {
        await pantryService.remove(id);
        dispatch(itemRemoved(id));
      }),
    );

export const uploadPantryPhoto =
  (id: string, image: PickedImage): AppThunk<Promise<PantryItemResponse>> =>
  (dispatch) =>
    dispatch(
      withStatus('uploading', async () => {
        const result = await pantryService.uploadPhoto(id, image);
        dispatch(itemUpdated(result));
        return result;
      }),
    );
