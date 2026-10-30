import type {
  CursorResponse,
  FeedbackResponse,
  IntrospectResponse,
  UserResponse,
} from "@/types";

export type FeedbackTypeFilter = "BUG" | "SUGGESTION" | "OTHER";

export interface AdminUsersQuery {
  cursor?: string;
  /** API cho phép 10-50. */
  size?: number;
  keyword?: string;
}

export interface AdminFeedbackQuery {
  cursor?: string;
  /** API cho phép 1-30. */
  size?: number;
  keyword?: string;
  type?: FeedbackTypeFilter;
}

export interface IAdminUsersApi {
  listUsers(query: AdminUsersQuery): Promise<CursorResponse<UserResponse>>;
}

export interface IAdminFeedbackApi {
  listFeedback(
    query: AdminFeedbackQuery,
  ): Promise<CursorResponse<FeedbackResponse>>;
}

export interface IAccessInspector {
  introspect(accessToken: string): Promise<IntrospectResponse>;
}
