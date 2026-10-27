import type { ITokenStorage } from "@/core/storage/types";
import type { IAuthenticator, IPasswordRecovery, IUserApi } from "./types";

import type {
  LoginRequest,
  UserCreateRequest,
  ResetPasswordRequest,
  UserResponse,
  LogoutRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
} from "@/types";

export class AuthService {
  constructor(
    private readonly authenticator: IAuthenticator,
    private readonly recovery: IPasswordRecovery,
    private readonly users: Pick<IUserApi, "getMe">, 
    private readonly tokens: ITokenStorage,
  ) {}

  async login(input: LoginRequest): Promise<UserResponse> {
    const session = await this.authenticator.login(input);

    await this.tokens.saveAccessToken(session.accessToken);
    await this.tokens.saveRefreshToken(session.refreshToken);

    return session.user;
  }

  async register(input: UserCreateRequest): Promise<UserResponse> {
    return this.authenticator.register(input);
  }

  async logout(req: LogoutRequest): Promise<void> {
    try {
      await this.authenticator.logout(req);
    } finally {
      await this.tokens.clear();
    }
  }

  async restore(): Promise<UserResponse | null> {
    if (!(await this.tokens.getAccessToken())) {
      return null;
    }

    try {
      return await this.users.getMe();
    } catch {
      await this.tokens.clear();
      return null;
    }
  }

  clearLocalSession = async (): Promise<void> => {
    await this.tokens.clear();
  };

  forgotPassword = (input: ForgotPasswordRequest): Promise<void> => {
    return this.recovery.forgotPassword(input);
  };

  resetPassword = (input: ResetPasswordRequest): Promise<void> => {
    return this.recovery.resetPassword(input);
  };

  async changePassword(req: ChangePasswordRequest): Promise<void> {
    await this.recovery.changePassword(req);

    // Chỉ xóa token sau khi API đổi mật khẩu thành công.
    await this.tokens.clear();
  }
}
