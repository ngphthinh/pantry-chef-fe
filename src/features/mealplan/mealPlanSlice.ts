import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { mealPlanService } from '@/core/di/container';
import type { AppThunk } from '@/store/hooks';
import type {
  AiMealPlanRequest,
  AiMealPlanResponse,
  MealPlanCreateRequest,
  MealPlanEntryCreateRequest,
  MealPlanEntryResponse,
  MealPlanEntryUpdateRequest,
  MealPlanResponse,
  ShoppingItemResponse,
} from '@/types';

export type MealPlanStatus =
  | 'idle'
  | 'loading'
  | 'saving'
  | 'deleting'
  | 'generatingAi';

export interface MealPlanState {
  currentPlan: MealPlanResponse | null;
  shoppingPreview: ShoppingItemResponse[];
  aiDraft: AiMealPlanResponse | null;
  status: MealPlanStatus;
  selectedWeekStart: string;
  error: string | null;
}

// Định dạng ngày theo giờ địa phương YYYY-MM-DD (tránh lệch ngày do UTC của toISOString)
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Lấy ngày thứ Hai của tuần theo giờ địa phương
export function getMondayOfWeek(date: Date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay(); // 0: CN, 1: T2, ..., 6: T7
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return formatLocalDate(d);
}

const initialState: MealPlanState = {
  currentPlan: null,
  shoppingPreview: [],
  aiDraft: null,
  status: 'idle',
  selectedWeekStart: getMondayOfWeek(),
  error: null,
};

const mealPlanSlice = createSlice({
  name: 'mealPlan',
  initialState,
  reducers: {
    statusChanged(state, action: PayloadAction<MealPlanStatus>) {
      state.status = action.payload;
    },
    weekSelected(state, action: PayloadAction<string>) {
      state.selectedWeekStart = action.payload;
    },
    planReceived(state, action: PayloadAction<MealPlanResponse | null>) {
      state.currentPlan = action.payload;
      state.error = null;
    },
    entryAdded(state, action: PayloadAction<MealPlanEntryResponse>) {
      if (state.currentPlan) {
        state.currentPlan.entries.push(action.payload);
      }
    },
    entryUpdated(state, action: PayloadAction<MealPlanEntryResponse>) {
      if (state.currentPlan) {
        const index = state.currentPlan.entries.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.currentPlan.entries[index] = action.payload;
        }
      }
    },
    entryRemoved(state, action: PayloadAction<string>) {
      if (state.currentPlan) {
        state.currentPlan.entries = state.currentPlan.entries.filter((e) => e.id !== action.payload);
      }
    },
    shoppingPreviewReceived(state, action: PayloadAction<ShoppingItemResponse[]>) {
      state.shoppingPreview = action.payload;
    },
    aiDraftReceived(state, action: PayloadAction<AiMealPlanResponse | null>) {
      state.aiDraft = action.payload;
    },
  },
});

export const {
  statusChanged,
  weekSelected,
  planReceived,
  entryAdded,
  entryUpdated,
  entryRemoved,
  shoppingPreviewReceived,
  aiDraftReceived,
} = mealPlanSlice.actions;

export default mealPlanSlice.reducer;

const withStatus =
  <T>(status: MealPlanStatus, run: () => Promise<T>): AppThunk<Promise<T>> =>
  async (dispatch) => {
    dispatch(statusChanged(status));
    try {
      return await run();
    } finally {
      dispatch(statusChanged('idle'));
    }
  };

export const fetchMealPlanByWeek =
  (weekStart: string): AppThunk<Promise<MealPlanResponse | null>> =>
  (dispatch) =>
    dispatch(
      withStatus('loading', async () => {
        dispatch(weekSelected(weekStart));
        try {
          const plan = await mealPlanService.getByWeek(weekStart);
          dispatch(planReceived(plan));
          return plan;
        } catch {
          dispatch(planReceived(null));
          return null;
        }
      }),
    );

export const createMealPlan =
  (body: MealPlanCreateRequest): AppThunk<Promise<MealPlanResponse>> =>
  (dispatch) =>
    dispatch(
      withStatus('saving', async () => {
        const plan = await mealPlanService.create(body);
        dispatch(planReceived(plan));
        return plan;
      }),
    );

export const copyMealPlan =
  (id: string, toWeekStart: string): AppThunk<Promise<MealPlanResponse>> =>
  (dispatch) =>
    dispatch(
      withStatus('saving', async () => {
        const copied = await mealPlanService.copy(id, toWeekStart);
        return copied;
      }),
    );

export const deleteMealPlan =
  (id: string): AppThunk<Promise<void>> =>
  (dispatch) =>
    dispatch(
      withStatus('deleting', async () => {
        await mealPlanService.remove(id);
        dispatch(planReceived(null));
      }),
    );

export const addMealPlanEntry =
  (id: string, body: MealPlanEntryCreateRequest): AppThunk<Promise<MealPlanEntryResponse>> =>
  (dispatch) =>
    dispatch(
      withStatus('saving', async () => {
        const entry = await mealPlanService.addEntry(id, body);
        dispatch(entryAdded(entry));
        return entry;
      }),
    );

export const updateMealPlanEntry =
  (
    id: string,
    entryId: string,
    body: MealPlanEntryUpdateRequest,
  ): AppThunk<Promise<MealPlanEntryResponse>> =>
  (dispatch) =>
    dispatch(
      withStatus('saving', async () => {
        const entry = await mealPlanService.updateEntry(id, entryId, body);
        dispatch(entryUpdated(entry));
        return entry;
      }),
    );

export const deleteMealPlanEntry =
  (id: string, entryId: string): AppThunk<Promise<void>> =>
  (dispatch) =>
    dispatch(
      withStatus('deleting', async () => {
        await mealPlanService.removeEntry(id, entryId);
        dispatch(entryRemoved(entryId));
      }),
    );

export const fetchShoppingPreview =
  (id: string): AppThunk<Promise<ShoppingItemResponse[]>> =>
  (dispatch) =>
    dispatch(
      withStatus('loading', async () => {
        const items = await mealPlanService.getShoppingList(id);
        dispatch(shoppingPreviewReceived(items));
        return items;
      }),
    );

export const generateAiMealPlan =
  (body: AiMealPlanRequest): AppThunk<Promise<AiMealPlanResponse>> =>
  (dispatch) =>
    dispatch(
      withStatus('generatingAi', async () => {
        const draft = await mealPlanService.generateAiDraft(body);
        dispatch(aiDraftReceived(draft));
        return draft;
      }),
    );
