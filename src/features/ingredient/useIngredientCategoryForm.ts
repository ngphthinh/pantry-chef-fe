import { useCallback, useMemo, useState } from "react";
import type { ActionResult } from "@/core/http/actionResult";
import type {
  IngredientCategoryRequest,
  IngredientCategoryResponse,
} from "@/types";
import { ingredientValidators } from "./validation";

type SaveCategory = (
  id: string | null,
  body: IngredientCategoryRequest,
) => Promise<ActionResult<unknown>>;

/** Form thêm / sửa nhóm nguyên liệu dạng hộp thoại. `save` lấy từ `useIngredientCategoryManager`. */
export function useIngredientCategoryForm(save: SaveCategory) {
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<IngredientCategoryResponse | null>(
    null,
  );
  const [code, setCodeState] = useState("");
  const [name, setNameState] = useState("");
  const [errors, setErrors] = useState<{
    code: string | null;
    name: string | null;
  }>({
    code: null,
    name: null,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const open = useCallback((category?: IngredientCategoryResponse) => {
    setEditing(category ?? null);
    setCodeState(category?.code ?? "");
    setNameState(category?.name ?? "");
    setErrors({ code: null, name: null });
    setFormError(null);
    setVisible(true);
  }, []);

  const close = useCallback(() => setVisible(false), []);

  /** Mã luôn viết hoa, khoảng trắng đổi thành gạch dưới. */
  const setCode = useCallback((value: string) => {
    setCodeState(value.toUpperCase().replace(/\s+/g, "_"));
    setErrors((e) => ({ ...e, code: null }));
  }, []);

  const setName = useCallback((value: string) => {
    setNameState(value);
    setErrors((e) => ({ ...e, name: null }));
  }, []);

  const submit = useCallback(async () => {
    const next = {
      code: ingredientValidators.categoryCode(code),
      name: ingredientValidators.categoryName(name),
    };
    setErrors(next);
    if (next.code || next.name) return;

    setIsSubmitting(true);
    setFormError(null);
    const result = await save(editing?.id ?? null, {
      code: code.trim(),
      name: name.trim(),
    });
    setIsSubmitting(false);

    if (result.ok) setVisible(false);
    else setFormError(result.message);
  }, [code, name, editing, save]);

  return useMemo(
    () => ({
      visible,
      isEditing: editing !== null,
      code,
      name,
      setCode,
      setName,
      errors,
      formError,
      isSubmitting,
      open,
      close,
      submit,
    }),
    [
      visible,
      editing,
      code,
      name,
      setCode,
      setName,
      errors,
      formError,
      isSubmitting,
      open,
      close,
      submit,
    ],
  );
}
