import { useCallback, useState } from 'react';
import type { MealPlanEntryResponse, MealType } from '@/types';
import { useMealPlan } from './useMealPlan';
import { mealPlanValidators } from './validation';

export interface MealPlanEntryFormValues {
  date: string;
  mealType: MealType;
  recipeId?: string;
  recipeTitle?: string;
  servings: string;
}

export function useMealPlanEntryForm(
  initialEntry?: MealPlanEntryResponse | null,
  defaultDate?: string,
  defaultMealType?: MealType,
) {
  const { addEntry, updateEntry, isSaving } = useMealPlan();

  const [values, setValues] = useState<MealPlanEntryFormValues>({
    date: initialEntry?.date ?? defaultDate ?? new Date().toISOString().split('T')[0],
    mealType: initialEntry?.mealType ?? defaultMealType ?? 'DINNER',
    recipeId: initialEntry?.recipeId ?? undefined,
    recipeTitle: initialEntry?.recipeTitle ?? '',
    servings: initialEntry?.servings ? String(initialEntry.servings) : '2',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof MealPlanEntryFormValues, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setField = useCallback(
    <K extends keyof MealPlanEntryFormValues>(field: K, val: MealPlanEntryFormValues[K]) => {
      setValues((prev) => ({ ...prev, [field]: val }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    },
    [],
  );

  const validate = useCallback(() => {
    const errs: Partial<Record<keyof MealPlanEntryFormValues, string>> = {};

    const dateErr = mealPlanValidators.date(values.date);
    if (dateErr) errs.date = dateErr;

    const mealTypeErr = mealPlanValidators.mealType(values.mealType);
    if (mealTypeErr) errs.mealType = mealTypeErr;

    const servingsErr = mealPlanValidators.servings(values.servings);
    if (servingsErr) errs.servings = servingsErr;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [values]);

  const submit = useCallback(async () => {
    setSubmitError(null);
    if (!validate()) return null;

    try {
      const parsedServings = values.servings ? parseInt(values.servings, 10) : 2;

      if (initialEntry) {
        return await updateEntry(initialEntry.id, {
          date: values.date,
          mealType: values.mealType,
          servings: parsedServings,
        });
      } else {
        return await addEntry({
          date: values.date,
          mealType: values.mealType,
          recipeId: values.recipeId,
          servings: parsedServings,
        });
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
    isSaving,
    setField,
    submit,
  };
}
