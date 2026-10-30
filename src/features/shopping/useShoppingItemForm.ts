import { useCallback, useState } from "react";
import { formatDecimal, parseDecimal } from "@/core/format/decimal";
import type { ActionResult } from "@/core/http/actionResult";
import { Unit, type ShoppingItemCreateRequest, type ShoppingItemResponse } from "@/types";
import type { ShoppingItemPatch } from "./shoppingService";
import { shoppingValidators } from "./validation";

interface FormValues {
  name: string;
  quantity: string;
  unit: Unit;
}

const EMPTY: FormValues = { name: "", quantity: "", unit: Unit.PCS };

interface ItemFormActions {
  addItem: (body: ShoppingItemCreateRequest) => Promise<ActionResult<unknown>>;
  updateItem: (item: ShoppingItemResponse, patch: ShoppingItemPatch) => Promise<ActionResult<unknown>>;
}

/** Form thêm mới / sửa một mục. Có `editing` thì là sửa, không thì là thêm. */
export function useShoppingItemForm({ addItem, updateItem }: ItemFormActions) {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<{ name?: string; quantity?: string; submit?: string }>({});
  const [editing, setEditing] = useState<ShoppingItemResponse | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const setField = useCallback(<K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors({});
  }, []);

  const startEdit = useCallback((item: ShoppingItemResponse) => {
    setEditing(item);
    setValues({
      name: item.name,
      quantity: item.quantity === null || item.quantity <= 0 ? "" : formatDecimal(item.quantity),
      unit: item.unit ?? Unit.PCS,
    });
    setErrors({});
  }, []);

  const cancelEdit = useCallback(() => {
    setEditing(null);
    setValues(EMPTY);
    setErrors({});
  }, []);

  const submit = useCallback(async (): Promise<ActionResult<unknown>> => {
    const next = {
      name: shoppingValidators.itemName(values.name) ?? undefined,
      quantity: shoppingValidators.quantity(values.quantity) ?? undefined,
    };
    if (next.name || next.quantity) {
      setErrors(next);
      return { ok: false, message: next.name ?? next.quantity ?? "" };
    }

    const quantity = parseDecimal(values.quantity) ?? undefined;
    setSubmitting(true);
    try {
      const result = editing
        ? await updateItem(editing, { name: values.name, quantity, unit: quantity ? values.unit : undefined })
        : await addItem({ name: values.name, quantity, unit: quantity ? values.unit : undefined });

      if (result.ok) {
        setEditing(null);
        setValues(EMPTY);
        setErrors({});
      } else {
        setErrors({ submit: result.message });
      }
      return result;
    } finally {
      setSubmitting(false);
    }
  }, [addItem, editing, updateItem, values]);

  return { values, errors, editing, isSubmitting, setField, startEdit, cancelEdit, submit };
}
