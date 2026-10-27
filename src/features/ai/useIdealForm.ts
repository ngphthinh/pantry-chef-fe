import { useCallback, useState } from "react";
import { aiValidators } from "./validation";
import { useAiIdeas } from "./useAiIdeals";

interface FormValues {
  limit: string;
  maxCookingMinutes: string;
  cuisine: string;
}

const DEFAULTS: FormValues = { limit: "5", maxCookingMinutes: "", cuisine: "" };

export type SubmitResult =
  | { ok: true }
  | { ok: false; kind: "validation" | "request"; message: string };

export function useIdeasForm() {
  const { generate, isLoading } = useAiIdeas();
  const [values, setValues] = useState<FormValues>(DEFAULTS);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormValues, string>>
  >({});

  const setField = useCallback(
    <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const submit = useCallback(async (): Promise<SubmitResult> => {
    const next = {
      limit: aiValidators.limit(values.limit) ?? undefined,
      maxCookingMinutes:
        aiValidators.maxMinutes(values.maxCookingMinutes) ?? undefined,
    };
    setErrors(next);

    if (next.limit || next.maxCookingMinutes) {
      return {
        ok: false,
        kind: "validation",
        message: "Vui lòng kiểm tra lại thông tin.",
      };
    }

    try {
      await generate({
        limit: Number(values.limit),
        maxCookingMinutes: values.maxCookingMinutes.trim()
          ? Number(values.maxCookingMinutes)
          : undefined,
        cuisine: values.cuisine.trim() || undefined,
      });
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        kind: "request",
        message:
          error instanceof Error
            ? error.message
            : "Không thể tạo gợi ý món. Vui lòng thử lại.",
      };
    }
  }, [generate, values]);

  return { values, errors, setField, submit, isSubmitting: isLoading };
}
