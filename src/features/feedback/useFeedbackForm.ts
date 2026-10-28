import { useCallback, useMemo, useState } from "react";
import { APP_VERSION } from "@/core/config/appInfo";
import type { ActionResult } from "@/core/http/actionResult";
import { FeedbackType } from "@/types";
import { getDeviceInfo } from "./deviceInfo";
import { FEEDBACK_MAX_LENGTH } from "./feedbackTypes";
import { useFeedback } from "./useFeedback";
import { feedbackValidators } from "./validation";

interface FormValues {
  type: FeedbackType;
  message: string;
}

const EMPTY: FormValues = { type: FeedbackType.SUGGESTION, message: "" };

export function useFeedbackForm() {
  const { send, isSending } = useFeedback();
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const setType = useCallback((type: FeedbackType) => setValues((prev) => ({ ...prev, type })), []);

  const setMessage = useCallback((message: string) => {
    setValues((prev) => ({ ...prev, message }));
    setError(null);
  }, []);

  /** Màn hình chỉ cần hiển thị kết quả; phiên bản app và thiết bị được đính kèm tự động. */
  const submit = useCallback(async (): Promise<ActionResult> => {
    const invalid = feedbackValidators.message(values.message);
    if (invalid) {
      setError(invalid);
      return { ok: false, message: invalid };
    }
    const result = await send({
      type: values.type,
      message: values.message,
      appVersion: APP_VERSION,
      deviceInfo: getDeviceInfo(),
    });
    if (!result.ok) {
      setError(result.message);
      return result;
    }
    setValues(EMPTY);
    return { ok: true, data: undefined };
  }, [send, values]);

  const remaining = useMemo(() => FEEDBACK_MAX_LENGTH - values.message.length, [values.message]);

  return { values, error, remaining, setType, setMessage, submit, isSubmitting: isSending };
}
