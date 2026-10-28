import { FeedbackType } from "@/types";

export const FEEDBACK_MAX_LENGTH = 2000;

export interface FeedbackTypeOption {
  value: FeedbackType;
  label: string;
}

export const FEEDBACK_TYPE_OPTIONS: readonly FeedbackTypeOption[] = [
  { value: FeedbackType.BUG, label: "Báo lỗi" },
  { value: FeedbackType.SUGGESTION, label: "Góp ý" },
  { value: FeedbackType.OTHER, label: "Khác" },
];
