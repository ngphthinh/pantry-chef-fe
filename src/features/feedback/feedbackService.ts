import type { CursorResponse, FeedbackCreateRequest, FeedbackResponse } from "@/types";
import type { FeedbackQuery, IFeedbackApi } from "./types";

export class FeedbackService {
  constructor(private readonly feedback: IFeedbackApi) {}

  /** BE cũng `trim()` nhưng cắt ở đây để độ dài kiểm tra ở form là độ dài thật được gửi đi. */
  create = (body: FeedbackCreateRequest): Promise<void> =>
    this.feedback.create({ ...body, message: body.message.trim() });

  list = (query: FeedbackQuery): Promise<CursorResponse<FeedbackResponse>> =>
    this.feedback.list(query);
}
