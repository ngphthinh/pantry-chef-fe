import { useCallback, useMemo } from "react";
import { runAction } from "@/core/http/actionResult";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { FeedbackCreateRequest } from "@/types";
import { sendFeedback } from "./feedbackSlice";

export function useFeedback() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.feedback.status);

  const send = useCallback(
    (body: FeedbackCreateRequest) =>
      runAction(() => dispatch(sendFeedback(body)), "Không thể gửi phản hồi."),
    [dispatch],
  );

  return useMemo(() => ({ isSending: status === "sending", send }), [status, send]);
}
