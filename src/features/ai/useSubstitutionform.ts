import { useCallback, useEffect, useRef, useState } from "react";
import type { SubstitutionRequest } from "@/types";
import { aiValidators } from "./validation";
import { useSubstitutions } from "./useSubstitutions";

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

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
  const rawRecipeId = first(initial.recipeId);
  const recipeId =
    rawRecipeId && UUID_REGEX.test(rawRecipeId) ? rawRecipeId : undefined;

  const initialTitle = first(initial.recipeTitle);
  const initialMissing = first(initial.missingIngredient);

  const [values, setValues] = useState<FormValues>({
    recipeTitle: initialTitle,
    missingIngredient: initialMissing,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormValues, string>>
  >({});
  const [requestError, setRequestError] = useState<string | null>(null);
  const lastSearched = useRef<string>("");

  const setField = useCallback(
    <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  // Có recipeId (mở từ chi tiết công thức) thì tên món là tuỳ chọn, ngược lại bắt buộc
  const titleRequired = !recipeId;

  const executeSearch = useCallback(
    async (ingredient: string, titleStr: string): Promise<void> => {
      const trimmedIngredient = ingredient.trim();
      const trimmedTitle = titleStr.trim();

      const next = {
        missingIngredient:
          aiValidators.missingIngredient(trimmedIngredient) ?? undefined,
        recipeTitle:
          aiValidators.recipeTitle(trimmedTitle) ??
          (titleRequired && !trimmedTitle ? "Vui lòng nhập tên món" : undefined),
      };
      setErrors(next);
      if (next.missingIngredient || next.recipeTitle) return;

      // Khớp SubstitutionRequest: phải có recipeTitle hoặc recipeId
      const input: SubstitutionRequest = trimmedTitle
        ? {
            recipeTitle: trimmedTitle,
            ...(recipeId ? { recipeId } : {}),
            missingIngredient: trimmedIngredient,
          }
        : {
            recipeId: recipeId!,
            missingIngredient: trimmedIngredient,
          };

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
    },
    [recipeId, search, titleRequired],
  );

  const submit = useCallback(async (): Promise<void> => {
    await executeSearch(values.missingIngredient, values.recipeTitle);
  }, [executeSearch, values.missingIngredient, values.recipeTitle]);

  // Đồng bộ lại khi params thay đổi hoặc chạy lần đầu khi có missingIngredient
  useEffect(() => {
    const nextTitle = first(initial.recipeTitle);
    const nextMissing = first(initial.missingIngredient);

    if (nextTitle !== values.recipeTitle || nextMissing !== values.missingIngredient) {
      setValues({
        recipeTitle: nextTitle,
        missingIngredient: nextMissing,
      });
    }

    const searchKey = `${nextTitle}::${nextMissing}::${rawRecipeId}`;
    if (nextMissing.trim() && lastSearched.current !== searchKey) {
      lastSearched.current = searchKey;
      clear();
      void executeSearch(nextMissing, nextTitle);
    }
  }, [clear, executeSearch, initial.missingIngredient, initial.recipeId, initial.recipeTitle, rawRecipeId, values.missingIngredient, values.recipeTitle]);

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
