import { useCallback, useEffect, useRef, useState } from "react";
import type { SubstitutionRequest } from "@/types";
import { aiValidators } from "./validation";
import { useSubstitutions } from "./useSubstitutions";

type Param = string | string[] | undefined;

interface Initial {
  recipeId?: Param;
  recipeTitle?: Param;
  missingIngredient?: Param;
}

interface FormValues {
  recipeTitle: string;
  missingIngredient: string;
}

// Tham số route có thể là string hoặc mảng string
const first = (v: Param) => (Array.isArray(v) ? v[0] : v) ?? "";

/**
 * Form tìm nguyên liệu thay thế. Nếu được mở từ nơi khác kèm sẵn
 * `missingIngredient` (chạm vào nguyên liệu thiếu) thì tự tìm ngay một lần.
 */
export function useSubstitutionForm(initial: Initial = {}) {
  const { search, clear, isLoading } = useSubstitutions();
  const recipeId = first(initial.recipeId);

  const [values, setValues] = useState<FormValues>({
    recipeTitle: first(initial.recipeTitle),
    missingIngredient: first(initial.missingIngredient),
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormValues, string>>
  >({});
  const [requestError, setRequestError] = useState<string | null>(null);
  const autoRan = useRef(false);

  const setField = useCallback(
    <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  // Có recipeId (mở từ chi tiết công thức) thì tên món là tuỳ chọn, ngược lại bắt buộc
  const titleRequired = !recipeId;

  const submit = useCallback(async (): Promise<void> => {
    const title = values.recipeTitle.trim();
    const next = {
      missingIngredient:
        aiValidators.missingIngredient(values.missingIngredient) ?? undefined,
      recipeTitle:
        aiValidators.recipeTitle(values.recipeTitle) ??
        (titleRequired && !title ? "Vui lòng nhập tên món" : undefined),
    };
    setErrors(next);
    if (next.missingIngredient || next.recipeTitle) return;

    // Khớp SubstitutionRequest: phải có recipeTitle hoặc recipeId
    const input: SubstitutionRequest = title
      ? {
          recipeTitle: title,
          recipeId: recipeId || undefined,
          missingIngredient: values.missingIngredient.trim(),
        }
      : { recipeId, missingIngredient: values.missingIngredient.trim() };

    setRequestError(null);
    try {
      await search(input);
    } catch (error) {
      setRequestError(
        error instanceof Error
          ? error.message
          : "Không thể tìm nguyên liệu thay thế. Vui lòng thử lại.",
      );
    }
  }, [recipeId, search, titleRequired, values]);

  useEffect(() => {
    clear(); // bỏ kết quả của lần mở trước
    if (!autoRan.current && values.missingIngredient.trim()) {
      autoRan.current = true;
      void submit();
    }
    // chỉ chạy một lần khi màn hình mở
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    values,
    errors,
    requestError,
    titleRequired,
    setField,
    submit,
    isSubmitting: isLoading,
  };
}
