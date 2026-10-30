import type { AxiosInstance } from "axios";

import type {
  CursorResponse,
  FeedbackResponse,
  IntrospectResponse,
  UserResponse,
} from "@/types";
import {
  AdminFeedbackQuery,
  AdminUsersQuery,
  IAccessInspector,
  IAdminFeedbackApi,
  IAdminUsersApi,
} from "./types";

export class HttpAdminRepository
  implements IAdminUsersApi, IAdminFeedbackApi, IAccessInspector
{
  constructor(
    private readonly publicHttp: AxiosInstance,
    private readonly privateHttp: AxiosInstance,
  ) {}

  listUsers = async (
    query: AdminUsersQuery,
  ): Promise<CursorResponse<UserResponse>> => {
    const response = await this.privateHttp.get<CursorResponse<UserResponse>>(
      "/v1/users/admin",
      { params: query },
    );

    return response.data;
  };

  listFeedback = async (
    query: AdminFeedbackQuery,
  ): Promise<CursorResponse<FeedbackResponse>> => {
    const response = await this.privateHttp.get<
      CursorResponse<FeedbackResponse>
    >("/v1/feedback", { params: query });

    return response.data;
  };

  introspect = async (accessToken: string): Promise<IntrospectResponse> => {
    const response = await this.privateHttp.post<IntrospectResponse>(
      "/v1/auth/introspect",
      { accessToken },
    );

    return response.data;
  };
}
