import { useCallback, useRef, useState } from 'react';
import { getErrorMessage } from '@/core/http/apiError';
import type {
  Difficulty,
  RecipeCreateRequest,
  RecipeDetailResponse,
  Unit,
} from '@/types';
import { useCustomRecipes } from './useCustomRecipes';
import { customRecipeValidators as v, parseNumber } from './validation';

const SECONDS_PER_MINUTE = 60;

export interface IngredientRow {
  key: string;
  name: string;
  amount: string;
  unit: Unit | '';
}

export interface StepRow {
  key: string;
  text: string;
  timerMinutes: string;
}

export interface CustomRecipeFormValues {
  title: string;
  servings: string;
  readyInMinutes: string;
  difficulty: Difficulty | '';
  cuisineId: string;
  ingredients: IngredientRow[];
  steps: StepRow[];
}

export interface CustomRecipeFormErrors {
  title?: string;
  servings?: string;
  readyInMinutes?: string;
  ingredients?: string;
  steps?: string;
}

export type SubmitResult =
  | { ok: true; recipe: RecipeDetailResponse }
  | { ok: false; kind: 'validation' | 'request'; message: string };

/**
 * Logic form tạo/sửa công thức tự tạo: giữ giá trị, thêm/xoá dòng nguyên liệu và bước, kiểm tra,
 * đổi chuỗi -> số (phút -> giây) và gọi API. Truyền `initial` để sửa (PUT thay toàn bộ).
 */
export function useCustomRecipeForm(initial?: RecipeDetailResponse | null) {
  const { create, update, isSaving } = useCustomRecipes();
  const nextKey = useRef(0);
  const newKey = () => `row-${nextKey.current++}`;

  const [values, setValues] = useState<CustomRecipeFormValues>(() => ({
    title: initial?.title ?? '',
    servings: initial?.servings ? String(initial.servings) : '2',
    readyInMinutes: initial?.readyInMinutes ? String(initial.readyInMinutes) : '',
    difficulty: initial?.difficulty ?? '',
    cuisineId: initial?.cuisine?.id ?? '',
    ingredients: initial?.ingredients.length
      ? initial.ingredients.map((i) => ({
          key: newKey(),
          name: i.name,
          amount: i.amount !== null ? String(i.amount) : '',
          unit: i.unit ?? '',
        }))
      : [{ key: newKey(), name: '', amount: '', unit: '' }],
    steps: initial?.steps.length
      ? [...initial.steps]
          .sort((a, b) => a.stepOrder - b.stepOrder)
          .map((s) => ({
            key: newKey(),
            text: s.text,
            timerMinutes: s.timerSeconds ? String(Math.round(s.timerSeconds / SECONDS_PER_MINUTE)) : '',
          }))
      : [{ key: newKey(), text: '', timerMinutes: '' }],
  }));
  const [errors, setErrors] = useState<CustomRecipeFormErrors>({});

  const setField = useCallback(
    <K extends 'title' | 'servings' | 'readyInMinutes' | 'difficulty' | 'cuisineId'>(
      key: K,
      value: CustomRecipeFormValues[K],
    ) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const updateIngredient = useCallback((key: string, patch: Partial<Omit<IngredientRow, 'key'>>) => {
    setValues((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    }));
    setErrors((prev) => ({ ...prev, ingredients: undefined }));
  }, []);

  const addIngredient = useCallback(
    () =>
      setValues((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, { key: newKey(), name: '', amount: '', unit: '' }],
      })),
    [],
  );

  const removeIngredient = useCallback(
    (key: string) =>
      setValues((prev) => ({
        ...prev,
        ingredients: prev.ingredients.length > 1 ? prev.ingredients.filter((r) => r.key !== key) : prev.ingredients,
      })),
    [],
  );

  const updateStep = useCallback((key: string, patch: Partial<Omit<StepRow, 'key'>>) => {
    setValues((prev) => ({
      ...prev,
      steps: prev.steps.map((r) => (r.key === key ? { ...r, ...patch } : r)),
    }));
    setErrors((prev) => ({ ...prev, steps: undefined }));
  }, []);

  const addStep = useCallback(
    () =>
      setValues((prev) => ({
        ...prev,
        steps: [...prev.steps, { key: newKey(), text: '', timerMinutes: '' }],
      })),
    [],
  );

  const removeStep = useCallback(
    (key: string) =>
      setValues((prev) => ({
        ...prev,
        steps: prev.steps.length > 1 ? prev.steps.filter((r) => r.key !== key) : prev.steps,
      })),
    [],
  );

  const validate = useCallback((form: CustomRecipeFormValues): boolean => {
    const ingredientError = form.ingredients
      .map((r, i) => {
        const message = v.ingredientName(r.name) ?? v.ingredientAmount(r.amount);
        return message ? `Nguyên liệu ${i + 1}: ${message}` : null;
      })
      .find(Boolean);
    const stepError = form.steps
      .map((r, i) => {
        const message = v.stepText(r.text) ?? v.stepTimerMinutes(r.timerMinutes);
        return message ? `Bước ${i + 1}: ${message}` : null;
      })
      .find(Boolean);

    const next: CustomRecipeFormErrors = {
      title: v.title(form.title) ?? undefined,
      servings: v.servings(form.servings) ?? undefined,
      readyInMinutes: v.readyInMinutes(form.readyInMinutes) ?? undefined,
      ingredients: ingredientError ?? undefined,
      steps: stepError ?? undefined,
    };
    setErrors(next);
    return Object.values(next).every((e) => !e);
  }, []);

  const toRequest = (form: CustomRecipeFormValues): RecipeCreateRequest => ({
    title: form.title.trim(),
    servings: parseNumber(form.servings),
    readyInMinutes: form.readyInMinutes.trim() ? parseNumber(form.readyInMinutes) : undefined,
    difficulty: form.difficulty || undefined,
    cuisineId: form.cuisineId || undefined,
    ingredients: form.ingredients.map((r) => ({
      name: r.name.trim(),
      amount: r.amount.trim() ? parseNumber(r.amount) : undefined,
      unit: r.unit || undefined,
    })),
    steps: form.steps.map((r) => ({
      text: r.text.trim(),
      timerSeconds: r.timerMinutes.trim() ? Math.round(parseNumber(r.timerMinutes) * SECONDS_PER_MINUTE) : undefined,
    })),
  });

  /** Màn hình chỉ hiển thị kết quả: không tự bắt lỗi hay đổi kiểu dữ liệu. */
  const submit = useCallback(async (): Promise<SubmitResult> => {
    if (!validate(values)) {
      return { ok: false, kind: 'validation', message: 'Vui lòng kiểm tra lại thông tin.' };
    }
    try {
      const body = toRequest(values);
      const recipe = initial ? await update(initial.id, body) : await create(body);
      return { ok: true, recipe };
    } catch (e) {
      return { ok: false, kind: 'request', message: getErrorMessage(e) };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validate, values, initial, update, create]);

  return {
    values,
    errors,
    isEditing: !!initial,
    isSubmitting: isSaving,
    setField,
    addIngredient,
    updateIngredient,
    removeIngredient,
    addStep,
    updateStep,
    removeStep,
    submit,
  };
}
