import { getErrorMessage } from '@/core/http/apiError';
import { useState } from 'react';

type Validator<T> = (value: string, all: T) => string | null;

/** Quản lý state form + validate + submit, dùng chung cho mọi màn hình auth (SRP, DRY). */
export function useForm<T extends Record<string, string>>(
  initial: T,
  rules: { [K in keyof T]?: Validator<T> },
  onSubmit: (values: T) => Promise<void>,
) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string | null>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setValue = (key: keyof T) => (text: string) => setValues((v) => ({ ...v, [key]: text }));

  const submit = async () => {
    const next: Partial<Record<keyof T, string | null>> = {};
    (Object.keys(rules) as (keyof T)[]).forEach((k) => { next[k] = rules[k]?.(values[k], values) ?? null; });
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;

    setLoading(true);
    setFormError(null);
    try { await onSubmit(values); } catch (e) { setFormError(getErrorMessage(e)); } finally { setLoading(false); }
  };

  return { values, errors, formError, loading, setValue, submit };
}
