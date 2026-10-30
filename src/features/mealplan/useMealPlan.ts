import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type {
  AiMealPlanRequest,
  MealPlanCreateRequest,
  MealPlanEntryCreateRequest,
  MealPlanEntryResponse,
  MealPlanEntryUpdateRequest,
  MealType,
} from '@/types';
import {
  addMealPlanEntry,
  copyMealPlan,
  createMealPlan,
  deleteMealPlan,
  deleteMealPlanEntry,
  fetchMealPlanById,
  fetchMealPlanByWeek,
  fetchShoppingPreview,
  formatLocalDate,
  generateAiMealPlan,
  getMondayOfWeek,
  updateMealPlanEntry,
  weekSelected,
} from './mealPlanSlice';

export interface DayPlan {
  date: string;
  dayName: string;
  formattedDate: string;
  isToday: boolean;
  breakfast?: MealPlanEntryResponse;
  lunch?: MealPlanEntryResponse;
  dinner?: MealPlanEntryResponse;
  entries: MealPlanEntryResponse[];
}

const DAY_NAMES = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

export function useMealPlan() {
  const dispatch = useAppDispatch();
  const currentPlan = useAppSelector((s) => s.mealPlan.currentPlan);
  const shoppingPreview = useAppSelector((s) => s.mealPlan.shoppingPreview);
  const aiDraft = useAppSelector((s) => s.mealPlan.aiDraft);
  const status = useAppSelector((s) => s.mealPlan.status);
  const selectedWeekStart = useAppSelector((s) => s.mealPlan.selectedWeekStart);

  const loadWeek = useCallback(
    (weekStart: string = selectedWeekStart) => dispatch(fetchMealPlanByWeek(weekStart)),
    [dispatch, selectedWeekStart],
  );

  const loadPlanById = useCallback(
    (id: string) => dispatch(fetchMealPlanById(id)),
    [dispatch],
  );

  const changeWeek = useCallback(
    (offsetWeeks: number) => {
      const [year, month, day] = selectedWeekStart.split('-').map(Number);
      const d = new Date(year, month - 1, day, 12, 0, 0);
      d.setDate(d.getDate() + offsetWeeks * 7);
      const newWeekStart = getMondayOfWeek(d);
      dispatch(weekSelected(newWeekStart));
      dispatch(fetchMealPlanByWeek(newWeekStart));
    },
    [dispatch, selectedWeekStart],
  );

  const goToPrevWeek = useCallback(() => changeWeek(-1), [changeWeek]);
  const goToNextWeek = useCallback(() => changeWeek(1), [changeWeek]);
  const goToCurrentWeek = useCallback(() => {
    const currentMonday = getMondayOfWeek();
    dispatch(weekSelected(currentMonday));
    dispatch(fetchMealPlanByWeek(currentMonday));
  }, [dispatch]);
  const goToSpecificWeek = useCallback(
    (dateOrMonday: string | Date) => {
      const d =
        typeof dateOrMonday === 'string'
          ? (() => {
              const [y, m, day] = dateOrMonday.split('-').map(Number);
              return new Date(y, m - 1, day, 12, 0, 0);
            })()
          : dateOrMonday;
      const monday = getMondayOfWeek(d);
      dispatch(weekSelected(monday));
      dispatch(fetchMealPlanByWeek(monday));
    },
    [dispatch],
  );

  // Tính 7 ngày trong tuần được chọn theo giờ địa phương
  const daysOfWeek: DayPlan[] = useMemo(() => {
    const [year, month, day] = selectedWeekStart.split('-').map(Number);
    // Khởi tạo tại 12:00 trưa để loại trừ hoàn toàn việc bị lệch ngày do múi giờ
    const startDate = new Date(year, month - 1, day, 12, 0, 0);

    const todayStr = formatLocalDate(new Date());
    const entries = currentPlan?.entries ?? [];

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = formatLocalDate(d);

      const dayEntries = entries.filter((e) => e.date === dateStr);
      const breakfast = dayEntries.find((e) => e.mealType === 'BREAKFAST');
      const lunch = dayEntries.find((e) => e.mealType === 'LUNCH');
      const dinner = dayEntries.find((e) => e.mealType === 'DINNER');

      const dateNumber = d.getDate();
      const monthNumber = d.getMonth() + 1;

      return {
        date: dateStr,
        dayName: DAY_NAMES[i],
        formattedDate: `${dateNumber}/${monthNumber}`,
        isToday: dateStr === todayStr,
        breakfast,
        lunch,
        dinner,
        entries: dayEntries,
      };
    });
  }, [selectedWeekStart, currentPlan]);

  const addEntry = useCallback(
    async (body: MealPlanEntryCreateRequest) => {
      let planId = currentPlan?.id;
      if (!planId) {
        // Tự động tạo plan nếu chưa có
        const newPlan = await dispatch(
          createMealPlan({
            weekStart: selectedWeekStart,
            entries: [body],
          }),
        );
        return newPlan.entries[0];
      }
      return dispatch(addMealPlanEntry(planId, body));
    },
    [dispatch, currentPlan, selectedWeekStart],
  );

  const toggleCooked = useCallback(
    (entryId: string, currentCooked: boolean) => {
      if (!currentPlan) return;
      return dispatch(
        updateMealPlanEntry(currentPlan.id, entryId, { cooked: !currentCooked }),
      );
    },
    [dispatch, currentPlan],
  );

  const updateEntry = useCallback(
    (entryId: string, body: MealPlanEntryUpdateRequest) => {
      if (!currentPlan) return;
      return dispatch(updateMealPlanEntry(currentPlan.id, entryId, body));
    },
    [dispatch, currentPlan],
  );

  const removeEntry = useCallback(
    (entryId: string) => {
      if (!currentPlan) return;
      return dispatch(deleteMealPlanEntry(currentPlan.id, entryId));
    },
    [dispatch, currentPlan],
  );

  const copyToWeek = useCallback(
    (toWeekStart: string) => {
      if (!currentPlan) return;
      return dispatch(copyMealPlan(currentPlan.id, toWeekStart));
    },
    [dispatch, currentPlan],
  );

  const removePlan = useCallback(() => {
    if (!currentPlan) return;
    return dispatch(deleteMealPlan(currentPlan.id));
  }, [dispatch, currentPlan]);

  const loadShoppingList = useCallback(async () => {
    if (!currentPlan) return [];
    return dispatch(fetchShoppingPreview(currentPlan.id));
  }, [dispatch, currentPlan]);

  const generateAiDraft = useCallback(
    (request: AiMealPlanRequest) => dispatch(generateAiMealPlan(request)),
    [dispatch],
  );

  const saveAiDraftAsPlan = useCallback(
    async (customWeekStart?: string) => {
      if (!aiDraft) return null;
      const targetWeek = customWeekStart ?? selectedWeekStart;
      const entries: MealPlanEntryCreateRequest[] = aiDraft.entries.map((e) => ({
        date: e.date.split('T')[0],
        mealType: e.mealType,
        recipeId: e.recipeId,
        servings: e.servings ?? 2,
      }));

      const plan = await dispatch(
        createMealPlan({
          weekStart: targetWeek,
          entries,
        }),
      );
      return plan;
    },
    [dispatch, aiDraft, selectedWeekStart],
  );

  return {
    currentPlan,
    shoppingPreview,
    aiDraft,
    status,
    selectedWeekStart,
    daysOfWeek,
    isLoading: status === 'loading',
    isSaving: status === 'saving',
    isGeneratingAi: status === 'generatingAi',
    loadWeek,
    loadPlanById,
    changeWeek,
    goToPrevWeek,
    goToNextWeek,
    goToCurrentWeek,
    goToSpecificWeek,
    addEntry,
    toggleCooked,
    updateEntry,
    removeEntry,
    copyToWeek,
    removePlan,
    loadShoppingList,
    generateAiDraft,
    saveAiDraftAsPlan,
  };
}
