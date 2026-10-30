import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  parseDecimal,
  parseInteger,
  formatDecimal,
} from "@/core/format/decimal";
import type { ActionResult } from "@/core/http/actionResult";
import { useCuisine } from "@/features/cuisine/useCuisine";
import type {
  Difficulty,
  PickedImage,
  RecipeCreateRequest,
  RecipeDetailResponse,
  Unit,
} from "@/types";
import { useCustomRecipe } from "./useCustomRecipe";
import { useCustomRecipeDetail } from "./useCustomRecipeDetail";
import { useRecipeImagePicker } from "./useRecipeImagePicker";
import { customRecipeValidators } from "./validation";

export interface IngredientRow {
  /** Khoá ổn định cho danh sách, không gửi lên BE. */
  key: string;
  name: string;
  amount: string;
  unit: Unit | "";
}

export interface StepRow {
  key: string;
  text: string;
  /** Nhập theo phút cho dễ; BE lưu theo giây. */
  timerMinutes: string;
}

interface FormValues {
  title: string;
  servings: string;
  readyInMinutes: string;
  difficulty: Difficulty | "";
  cuisineId: string;
  ingredients: IngredientRow[];
  steps: StepRow[];
}

interface FormErrors {
  title?: string;
  servings?: string;
  readyInMinutes?: string;
  ingredients?: string;
  steps?: string;
}

export interface SaveOutcome {
  id: string;
  /** Công thức đã lưu nhưng ảnh chưa tải lên được. */
  imageFailed: boolean;
}

let rowSeq = 0;
const nextKey = () => `row-${++rowSeq}`;

const blankIngredient = (): IngredientRow => ({
  key: nextKey(),
  name: "",
  amount: "",
  unit: "",
});
const blankStep = (): StepRow => ({
  key: nextKey(),
  text: "",
  timerMinutes: "",
});

const emptyValues = (): FormValues => ({
  title: "",
  servings: "2",
  readyInMinutes: "",
  difficulty: "",
  cuisineId: "",
  ingredients: [blankIngredient()],
  steps: [blankStep()],
});

const fromDetail = (recipe: RecipeDetailResponse): FormValues => ({
  title: recipe.title,
  servings: recipe.servings === null ? "" : String(recipe.servings),
  readyInMinutes:
    recipe.readyInMinutes === null ? "" : String(recipe.readyInMinutes),
  difficulty: recipe.difficulty ?? "",
  cuisineId: recipe.cuisine?.id ?? "",
  ingredients: recipe.ingredients.length
    ? recipe.ingredients.map((i) => ({
        key: nextKey(),
        name: i.name,
        amount: i.amount === null ? "" : formatDecimal(i.amount),
        unit: i.unit ?? "",
      }))
    : [blankIngredient()],
  steps: recipe.steps.length
    ? [...recipe.steps]
        .sort((a, b) => a.stepOrder - b.stepOrder)
        .map((s) => ({
          key: nextKey(),
          text: s.text,
          timerMinutes:
            s.timerSeconds === null ? "" : formatDecimal(s.timerSeconds / 60),
        }))
    : [blankStep()],
});

/** Đổi giá trị trong form thành body gửi BE. Dòng bỏ trống bị bỏ qua. */
const toRequest = (values: FormValues): RecipeCreateRequest => ({
  title: values.title.trim(),
  servings: parseInteger(values.servings) ?? 1,
  readyInMinutes: parseInteger(values.readyInMinutes) ?? undefined,
  difficulty: values.difficulty || undefined,
  cuisineId: values.cuisineId || undefined,
  ingredients: values.ingredients
    .filter((r) => r.name.trim())
    .map((r) => {
      const amount = parseDecimal(r.amount) ?? undefined;
      // Có đơn vị mà không có số lượng thì vô nghĩa ("vừa đủ" không đi kèm đơn vị).
      return {
        name: r.name.trim(),
        amount,
        unit: amount !== undefined ? r.unit || undefined : undefined,
      };
    }),
  steps: values.steps
    .filter((r) => r.text.trim())
    .map((r) => {
      const minutes = parseDecimal(r.timerMinutes);
      return {
        text: r.text.trim(),
        timerSeconds: minutes !== null ? Math.round(minutes * 60) : undefined,
      };
    }),
});

/**
 * Form tạo / sửa công thức tự tạo. Truyền `recipeId` để vào chế độ sửa: hook tự tải công thức
 * và điền sẵn vào form.
 */
export function useCustomRecipeForm(recipeId?: string) {
  const isEdit = Boolean(recipeId);
  const { create, update, isSaving } = useCustomRecipe();
  const detail = useCustomRecipeDetail(recipeId);
  const cuisines = useCuisine();
  const { pick } = useRecipeImagePicker();

  const [values, setValues] = useState<FormValues>(emptyValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [image, setImage] = useState<PickedImage | null>(null);
  const hydrated = useRef(false);

  const { load: loadDetail, recipe } = detail;
  const { load: loadCuisines } = cuisines;

  useEffect(() => {
    void loadCuisines();
  }, [loadCuisines]);

  useEffect(() => {
    if (recipeId) void loadDetail();
  }, [recipeId, loadDetail]);

  // Điền sẵn một lần khi công thức cần sửa về tới; các lần cập nhật sau không ghi đè phần đang gõ dở.
  useEffect(() => {
    if (recipe && !hydrated.current) {
      hydrated.current = true;
      setValues(fromDetail(recipe));
    }
  }, [recipe]);

  const setField = useCallback(
    <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  // ───────── Nguyên liệu ─────────

  const addIngredient = useCallback(
    () =>
      setValues((prev) => ({
        ...prev,
        ingredients: [...prev.ingredients, blankIngredient()],
      })),
    [],
  );

  const updateIngredient = useCallback(
    (key: string, patch: Partial<Omit<IngredientRow, "key">>) => {
      setValues((prev) => ({
        ...prev,
        ingredients: prev.ingredients.map((r) =>
          r.key === key ? { ...r, ...patch } : r,
        ),
      }));
      setErrors((prev) => ({ ...prev, ingredients: undefined }));
    },
    [],
  );

  /** Luôn giữ lại ít nhất một dòng để người dùng còn chỗ nhập. */
  const removeIngredient = useCallback((key: string) => {
    setValues((prev) => {
      const rest = prev.ingredients.filter((r) => r.key !== key);
      return { ...prev, ingredients: rest.length ? rest : [blankIngredient()] };
    });
  }, []);

  // ───────── Các bước ─────────

  const addStep = useCallback(
    () =>
      setValues((prev) => ({ ...prev, steps: [...prev.steps, blankStep()] })),
    [],
  );

  const updateStep = useCallback(
    (key: string, patch: Partial<Omit<StepRow, "key">>) => {
      setValues((prev) => ({
        ...prev,
        steps: prev.steps.map((r) => (r.key === key ? { ...r, ...patch } : r)),
      }));
      setErrors((prev) => ({ ...prev, steps: undefined }));
    },
    [],
  );

  const removeStep = useCallback((key: string) => {
    setValues((prev) => {
      const rest = prev.steps.filter((r) => r.key !== key);
      return { ...prev, steps: rest.length ? rest : [blankStep()] };
    });
  }, []);

  // ───────── Ảnh ─────────

  /** Chọn ảnh mới; trả thông báo lỗi nếu có (rỗng khi người dùng tự huỷ). */
  const pickImage = useCallback(async (): Promise<string | null> => {
    const result = await pick();
    if (result.ok) {
      setImage(result.image);
      return null;
    }
    return result.message ?? null;
  }, [pick]);

  // ───────── Lưu ─────────

  const validate = useCallback((v: FormValues): boolean => {
    const next: FormErrors = {
      title: customRecipeValidators.title(v.title) ?? undefined,
      servings: customRecipeValidators.servings(v.servings) ?? undefined,
      readyInMinutes:
        customRecipeValidators.readyInMinutes(v.readyInMinutes) ?? undefined,
      ingredients:
        customRecipeValidators.ingredients(v.ingredients) ?? undefined,
      steps: customRecipeValidators.steps(v.steps) ?? undefined,
    };
    setErrors(next);
    return Object.values(next).every((e) => !e);
  }, []);

  const submit = useCallback(async (): Promise<ActionResult<SaveOutcome>> => {
    if (!validate(values))
      return { ok: false, message: "Vui lòng kiểm tra lại thông tin." };

    const body = toRequest(values);
    const result = recipeId
      ? await update(recipeId, body, image)
      : await create(body, image);
    if (!result.ok) return result;

    return {
      ok: true,
      data: { id: result.data.recipe.id, imageFailed: result.data.imageFailed },
    };
  }, [create, image, recipeId, update, validate, values]);

  const cuisineOptions = useMemo(
    () => cuisines.items.map((c) => ({ value: c.id, label: c.name })),
    [cuisines.items],
  );

  return {
    isEdit,
    values,
    errors,
    cuisineOptions,
    /** Ảnh mới chọn, hoặc ảnh hiện có của công thức khi sửa. */
    imageUri: image?.uri ?? recipe?.imageUrl ?? null,
    isLoading: detail.isLoading,
    loadError: detail.loadError,
    isSubmitting: isSaving,
    setField,
    addIngredient,
    updateIngredient,
    removeIngredient,
    addStep,
    updateStep,
    removeStep,
    pickImage,
    submit,
    reload: loadDetail,
  };
}
