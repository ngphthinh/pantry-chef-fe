import type { AxiosInstance } from "axios";

import type { CursorResponse, FeedbackCreateRequest, FeedbackResponse } from "@/types";
import type { FeedbackQuery, IFeedbackApi } from "./types";

export class HttpFeedbackRepository implements IFeedbackApi {
  constructor(private readonly privateHttp: AxiosInstance) {}

  create = async (body: FeedbackCreateRequest): Promise<void> => {
    await this.privateHttp.post("/v1/feedback", body); // 204, không có body
  };

  list = async (query: FeedbackQuery): Promise<CursorResponse<FeedbackResponse>> => {
    const { data } = await this.privateHttp.get<CursorResponse<FeedbackResponse>>("/v1/feedback", {
      params: query,
    });
    return data;
  };
}
