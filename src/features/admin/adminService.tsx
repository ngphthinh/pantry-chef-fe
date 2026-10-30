import type { ITokenStorage } from "@/core/storage/types";
import type { CursorResponse, FeedbackResponse, UserResponse } from "@/types";
import { isAdminScope } from "./adminAccess";
import { AdminFeedbackQuery, AdminUsersQuery, IAccessInspector, IAdminFeedbackApi, IAdminUsersApi } from "./types";


export class AdminService {
  constructor(
    private readonly users: IAdminUsersApi,
    private readonly feedback: IAdminFeedbackApi,
    private readonly inspector: IAccessInspector,
    private readonly tokens: ITokenStorage,
  ) {}

  /** Token hiện tại còn hiệu lực và có quyền admin. */
  async isAdmin(): Promise<boolean> {
    const accessToken = await this.tokens.getAccessToken();
    if (!accessToken) return false;

    const info = await this.inspector.introspect(accessToken);
    return Boolean(info.active) && isAdminScope(info.scope);
  }

  listUsers = (query: AdminUsersQuery): Promise<CursorResponse<UserResponse>> =>
    this.users.listUsers(query);

  listFeedback = (
    query: AdminFeedbackQuery,
  ): Promise<CursorResponse<FeedbackResponse>> =>
    this.feedback.listFeedback(query);
}
