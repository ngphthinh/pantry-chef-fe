import type {
  CursorResponse,
  FeedbackCreateRequest,
  FeedbackResponse,
  FeedbackType,
} from "@/types";

export interface FeedbackQuery {
  cursor?: string;
  size?: number;
  keyword?: string;
  type?: FeedbackType;
}

export interface IFeedbackApi {
  create(body: FeedbackCreateRequest): Promise<void>;
  list(query: FeedbackQuery): Promise<CursorResponse<FeedbackResponse>>;
}
