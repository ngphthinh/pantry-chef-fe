import { useCallback, useState } from "react";
import type { ActionResult } from "@/core/http/actionResult";
import { shoppingValidators } from "./validation";

/**
 * Form một ô tên, dùng cho cả "tạo danh sách" lẫn "đổi tên".
 * Việc lưu thật sự do `save` quyết định (truyền vào từ useShopping / useShoppingDetail).
 */
export function useShoppingListForm<T>(save: (name: string) => Promise<ActionResult<T>>, initialName = "") {
  const [name, setNameState] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const setName = useCallback((value: string) => {
    setNameState(value);
    setError(null);
  }, []);

  /** Đặt lại ô nhập, ví dụ khi bắt đầu đổi tên một danh sách có sẵn. */
  const reset = useCallback((value = "") => {
    setNameState(value);
    setError(null);
  }, []);

  const submit = useCallback(async (): Promise<ActionResult<T>> => {
    const invalid = shoppingValidators.listName(name);
    if (invalid) {
      setError(invalid);
      return { ok: false, message: invalid };
    }
    setSubmitting(true);
    try {
      const result = await save(name);
      if (result.ok) setNameState("");
      else setError(result.message);
      return result;
    } finally {
      setSubmitting(false);
    }
  }, [name, save]);

  return { name, error, isSubmitting, setName, reset, submit };
}
