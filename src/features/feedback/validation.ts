import { FEEDBACK_MAX_LENGTH } from "./feedbackTypes";

export const feedbackValidators = {
  message: (v: string) => {
    const text = v.trim();
    if (!text) return "Vui lòng nhập nội dung phản hồi";
    return text.length <= FEEDBACK_MAX_LENGTH ? null : `Nội dung tối đa ${FEEDBACK_MAX_LENGTH} ký tự`;
  },
};
