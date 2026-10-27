import { useCallback, useState } from 'react';
import type { PantryItemResponse, StorageLocation, Unit } from '@/types';
import { usePantry } from './usePantry';
import { pantryValidators } from './validation';

export interface PantryFormValues {
  ingredientId: string;
  ingredientName: string;
  quantity: string;
  unit: Unit;
  location: StorageLocation;
  expiryDate: string;
  photoUri: string;
}

export function usePantryForm(initialItem?: PantryItemResponse | null) {
  const { create, update, isSaving } = usePantry();

  const [values, setValues] = useState<PantryFormValues>({
    ingredientId: initialItem?.ingredientId ?? '',
    ingredientName: initialItem?.ingredientName ?? '',
    quantity: initialItem?.quantity ? String(initialItem.quantity) : '',
    unit: (initialItem?.unit as Unit) ?? 'PCS',
    location: (initialItem?.location as StorageLocation) ?? 'FRIDGE',
    expiryDate: initialItem?.expiryDate ?? '',
    photoUri: initialItem?.photoUri ?? '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof PantryFormValues, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setField = useCallback(<K extends keyof PantryFormValues>(field: K, val: PantryFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: val }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const validate = useCallback(() => {
    const errs: Partial<Record<keyof PantryFormValues, string>> = {};

    const ingredientErr = pantryValidators.ingredientId(values.ingredientId);
    if (ingredientErr) errs.ingredientId = ingredientErr;

    const quantityErr = pantryValidators.quantity(values.quantity);
    if (quantityErr) errs.quantity = quantityErr;

    const unitErr = pantryValidators.unit(values.unit);
    if (unitErr) errs.unit = unitErr;

    const expiryErr = pantryValidators.expiryDate(values.expiryDate);
    if (expiryErr) errs.expiryDate = expiryErr;

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [values]);

  const submit = useCallback(async () => {
    setSubmitError(null);
    if (!validate()) return null;

    try {
      const parsedQuantity = parseFloat(values.quantity);
      if (initialItem) {
        return await update(initialItem.id, {
          quantity: parsedQuantity,
          unit: values.unit,
          location: values.location,
          expiryDate: values.expiryDate || undefined,
          photoUri: values.photoUri || undefined,
        });
      } else {
        return await create({
          ingredientId: values.ingredientId,
          quantity: parsedQuantity,
          unit: values.unit,
          location: values.location,
          expiryDate: values.expiryDate || undefined,
          photoUri: values.photoUri || undefined,
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu món';
      setSubmitError(msg);
      throw err;
    }
  }, [create, update, initialItem, validate, values]);

  return {
    values,
    errors,
    submitError,
    isSaving,
    setField,
    submit,
  };
}
