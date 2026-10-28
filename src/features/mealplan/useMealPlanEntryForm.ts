import { useCallback, useState } from 'react';
import { recipeService } from '@/core/di/container';
import type {
  MealPlanEntryCreateRequest,
  MealPlanEntryResponse,
  MealPlanEntryUpdateRequest,
  MealType,
  RecipeDetailResponse,
  RecipeSummaryResponse,
} from '@/types';
import { useMealPlan } from './useMealPlan';
import { mealPlanValidators } from './validation';

export interface MealPlanEntryFormValues {
  date: string;
  mealType: MealType;
  recipeId?: string;
  externalId?: string;
  recipeTitle?: string;
  recipeImageUrl?: string | null;
  servings: string;
}

export function useMealPlanEntryForm(
  initialEntry?: MealPlanEntryResponse | null,
  defaultDate?: string,
  defaultMealType?: MealType,
  defaultRecipeId?: string,
  defaultRecipeTitle?: string,
) {
  const { addEntry, updateEntry, isSaving: isMealPlanSaving } = useMealPlan();

  const [values, setValues] = useState<MealPlanEntryFormValues>({
    date: initialEntry?.date ?? defaultDate ?? new Date().toISOString().split('T')[0],
    mealType: initialEntry?.mealType ?? defaultMealType ?? 'DINNER',
    recipeId: initialEntry?.recipeId ?? defaultRecipeId ?? undefined,
    externalId: undefined,
    recipeTitle: initialEntry?.recipeTitle ?? defaultRecipeTitle ?? '',
    recipeImageUrl: initialEntry?.recipeImageUrl ?? null,
    servings: initialEntry?.servings ? String(initialEntry.servings) : '2',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof MealPlanEntryFormValues, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);

  const setField = useCallback(
    <K extends keyof MealPlanEntryFormValues>(field: K, val: MealPlanEntryFormValues[K]) => {
      setValues((prev) => ({ ...prev, [field]: val }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setSubmitError(null);
    },
    [],
  );

  /**
   * Chọn công thức từ Recipe API (Tùng - 5.1).
   * - Nếu recipe đã có UUID trong DB (recipe.id), gán trực tiếp.
   * - Nếu là recipe ngoài (recipe.externalId, recipe.id null), gọi GET /v1/recipes/{externalId}
   *   để backend lưu/cache vào DB và trả về id (UUID).
   */
  const selectRecipe = useCallback(
    async (recipe: RecipeSummaryResponse | RecipeDetailResponse) => {
      setIsLoadingRecipe(true);
      setSubmitError(null);
      try {
        let finalRecipeId = recipe.id ?? undefined;
        let finalTitle = recipe.title;
        let finalImage = recipe.imageUrl;
        let finalServings = recipe.servings ? String(recipe.servings) : values.servings;

        if (!finalRecipeId && recipe.externalId) {
          // Gọi chi tiết để backend đồng bộ vào DB và lấy UUID nội bộ
          const detail = await recipeService.getDetail(recipe.externalId);
          finalRecipeId = detail.id;
          finalTitle = detail.title || finalTitle;
          finalImage = detail.imageUrl || finalImage;
          if (detail.servings) {
            finalServings = String(detail.servings);
          }
        }

        setValues((prev) => ({
          ...prev,
          recipeId: finalRecipeId,
          externalId: recipe.externalId ?? undefined,
          recipeTitle: finalTitle,
          recipeImageUrl: finalImage,
          servings: finalServings || prev.servings,
        }));

        setErrors((prev) => ({
          ...prev,
          recipeId: undefined,
          recipeTitle: undefined,
        }));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Không thể lấy thông tin chi tiết công thức';
        setSubmitError(msg);
      } finally {
        setIsLoadingRecipe(false);
      }
    },
    [values.servings],
  );

  const clearRecipe = useCallback(() => {
    setValues((prev) => ({
      ...prev,
      recipeId: undefined,
      externalId: undefined,
      recipeTitle: '',
      recipeImageUrl: null,
    }));
    setErrors((prev) => ({
      ...prev,
      recipeId: undefined,
    }));
  }, []);

  const validate = useCallback(() => {
    const errs: Partial<Record<keyof MealPlanEntryFormValues, string>> = {};

    const dateErr = mealPlanValidators.date(values.date);
    if (dateErr) errs.date = dateErr;

    const mealTypeErr = mealPlanValidators.mealType(values.mealType);
    if (mealTypeErr) errs.mealType = mealTypeErr;

    const servingsErr = mealPlanValidators.servings(values.servings);
    if (servingsErr) errs.servings = servingsErr;

    const recipeErr = mealPlanValidators.recipeId(values.recipeId);
    if (recipeErr) errs.recipeId = recipeErr;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [values]);

  const submit = useCallback(async () => {
    setSubmitError(null);
    if (!validate()) return null;

    try {
      const parsedServings =
        values.servings && values.servings.trim() ? parseInt(values.servings.trim(), 10) : undefined;
      const cleanRecipeId = values.recipeId && values.recipeId.trim() ? values.recipeId.trim() : undefined;

      if (initialEntry) {
        const updatePayload: MealPlanEntryUpdateRequest = {
          date: values.date.trim(),
          mealType: values.mealType,
          servings: parsedServings,
        };
        return await updateEntry(initialEntry.id, updatePayload);
      } else {
        const createPayload: MealPlanEntryCreateRequest = {
          date: values.date.trim(),
          mealType: values.mealType,
          recipeId: cleanRecipeId,
          servings: parsedServings,
        };
        return await addEntry(createPayload);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu bữa ăn';
      setSubmitError(msg);
      throw err;
    }
  }, [addEntry, updateEntry, initialEntry, validate, values]);

  return {
    values,
    errors,
    submitError,
    isSaving: isMealPlanSaving || isLoadingRecipe,
    isLoadingRecipe,
    setField,
    selectRecipe,
    clearRecipe,
    submit,
  };
}
