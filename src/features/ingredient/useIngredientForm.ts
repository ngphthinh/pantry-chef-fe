import { useCallback, useMemo, useState } from "react";
import { runAction } from "@/core/http/actionResult";
import { useAppDispatch } from "@/store/hooks";
import type { IngredientResponse, Unit } from "@/types";
import { createIngredient, updateIngredient } from "./ingredientSlice";
import { ingredientValidators } from "./validation";

interface Options {
  /** Tên điền sẵn, thường là từ khoá người dùng vừa tìm không thấy. Bị bỏ qua khi sửa. */
  initialName?: string;
  /** Nguyên liệu đang sửa. Bỏ trống là thêm mới. Giá trị chỉ đọc lúc hook được dựng, nên mount lại hook khi đổi nguyên liệu. */
  ingredient?: IngredientResponse;
  /** Gọi sau khi thêm hoặc sửa thành công. */
  onCreated: (ingredient: IngredientResponse) => void;
}

interface FormErrors {
  name: string | null;
  category: string | null;
  barcode: string | null;
}

const NO_ERRORS: FormErrors = { name: null, category: null, barcode: null };

/** Form thêm / sửa nguyên liệu (người dùng quản lý nguyên liệu của riêng mình). */
export function useIngredientForm({
  initialName = "",
  ingredient,
  onCreated,
}: Options) {
  const dispatch = useAppDispatch();
  const isEditing = ingredient !== undefined;

  const [name, setNameState] = useState(
    (ingredient?.name ?? initialName).trim(),
  );
  const [categoryId, setCategoryIdState] = useState(
    ingredient?.category.id ?? "",
  );
  const [unit, setUnitState] = useState<Unit | "">(
    ingredient?.defaultUnit ?? "",
  );
  const [barcode, setBarcodeState] = useState(ingredient?.barcode ?? "");
  const [errors, setErrors] = useState<FormErrors>(NO_ERRORS);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setName = useCallback((value: string) => {
    setNameState(value);
    setErrors((e) => ({ ...e, name: null }));
  }, []);

  const setCategoryId = useCallback((value: string) => {
    setCategoryIdState(value);
    setErrors((e) => ({ ...e, category: null }));
  }, []);

  const setUnit = useCallback((value: Unit | "") => setUnitState(value), []);

  /** Mã vạch chỉ gồm chữ số. */
  const setBarcode = useCallback((value: string) => {
    setBarcodeState(value.replace(/\D/g, ""));
    setErrors((e) => ({ ...e, barcode: null }));
  }, []);

  const submit = useCallback(async () => {
    const next: FormErrors = {
      name: ingredientValidators.ingredientName(name),
      category: ingredientValidators.ingredientCategory(categoryId),
      barcode: ingredientValidators.optionalBarcode(barcode),
    };
    setErrors(next);
    if (next.name || next.category || next.barcode) return;

    // Sửa là thay thế toàn bộ (PUT): bỏ trống đơn vị / mã vạch nghĩa là xoá giá trị cũ.
    const body = {
      name: name.trim(),
      categoryId,
      defaultUnit: unit || undefined,
      barcode: barcode.trim() || undefined,
    };

    setIsSubmitting(true);
    setFormError(null);
    const result = await runAction(
      () =>
        ingredient
          ? dispatch(updateIngredient(ingredient.id, body))
          : dispatch(createIngredient(body)),
      isEditing
        ? "Không lưu được nguyên liệu."
        : "Không thêm được nguyên liệu.",
    );
    setIsSubmitting(false);

    if (result.ok) onCreated(result.data);
    else setFormError(result.message);
  }, [
    dispatch,
    ingredient,
    isEditing,
    name,
    categoryId,
    unit,
    barcode,
    onCreated,
  ]);

  return useMemo(
    () => ({
      isEditing,
      name,
      categoryId,
      unit,
      barcode,
      setName,
      setCategoryId,
      setUnit,
      setBarcode,
      errors,
      formError,
      isSubmitting,
      submit,
    }),
    [
      isEditing,
      name,
      categoryId,
      unit,
      barcode,
      setName,
      setCategoryId,
      setUnit,
      setBarcode,
      errors,
      formError,
      isSubmitting,
      submit,
    ],
  );
}
