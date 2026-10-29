import { useCallback, useState } from "react";
import type { ActionResult } from "@/core/http/actionResult";
import type { CuisineResponse } from "@/types";
import { useCuisine } from "./useCuisine";
import { cuisineValidators } from "./validation";

interface FormValues {
  code: string;
  name: string;
}

interface FormErrors {
  code?: string;
  name?: string;
  submit?: string;
}

const EMPTY: FormValues = { code: "", name: "" };

/** Form thêm / sửa ẩm thực (admin). Có `editing` thì là sửa, không thì là thêm. */
export function useCuisineForm() {
  const { create, update, isSaving } = useCuisine();
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});
  const [editing, setEditing] = useState<CuisineResponse | null>(null);

  /** Mã luôn in hoa, khoảng trắng đổi thành "_" để người nhập không phải nhớ luật của BE. */
  const setCode = useCallback((code: string) => {
    setValues((prev) => ({ ...prev, code: code.toUpperCase().replace(/\s+/g, "_") }));
    setErrors({});
  }, []);

  const setName = useCallback((name: string) => {
    setValues((prev) => ({ ...prev, name }));
    setErrors({});
  }, []);

  const startEdit = useCallback((cuisine: CuisineResponse) => {
    setEditing(cuisine);
    setValues({ code: cuisine.code, name: cuisine.name });
    setErrors({});
  }, []);

  const cancelEdit = useCallback(() => {
    setEditing(null);
    setValues(EMPTY);
    setErrors({});
  }, []);

  const submit = useCallback(async (): Promise<ActionResult<unknown>> => {
    const next: FormErrors = {
      code: cuisineValidators.code(values.code) ?? undefined,
      name: cuisineValidators.name(values.name) ?? undefined,
    };
    if (next.code || next.name) {
      setErrors(next);
      return { ok: false, message: next.code ?? next.name ?? "" };
    }

    const body = { code: values.code, name: values.name };
    const result = editing ? await update(editing.id, body) : await create(body);
    if (result.ok) {
      setEditing(null);
      setValues(EMPTY);
      setErrors({});
    } else {
      setErrors({ submit: result.message });
    }
    return result;
  }, [create, editing, update, values]);

  return { values, errors, editing, isSubmitting: isSaving, setCode, setName, startEdit, cancelEdit, submit };
}
