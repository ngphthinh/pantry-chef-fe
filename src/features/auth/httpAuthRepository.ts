import type { AxiosInstance } from "axios";

import type {
  LoginRequest,
  UserCreateRequest,
  AuthenticateResponse,
  UserResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  LogoutRequest,
  ChangePasswordRequest,
} from "@/types";
import type { IAuthenticator, IPasswordRecovery } from "./types";

export class HttpAuthRepository implements IAuthenticator, IPasswordRecovery {
  constructor(
    private readonly publicHttp: AxiosInstance,
    private readonly privateHttp: AxiosInstance,
  ) {}

  login = async (input: LoginRequest): Promise<AuthenticateResponse> => {
    const response = await this.publicHttp.post<AuthenticateResponse>(
      "/v1/auth/login",
      input,
    );

    return response.data;
  };

  register = async (input: UserCreateRequest): Promise<UserResponse> => {
    const response = await this.publicHttp.post<UserResponse>(
      "/v1/auth/register",
      input,
    );

    return response.data;
  };

  forgotPassword = async (input: ForgotPasswordRequest): Promise<void> => {
    await this.publicHttp.patch("/v1/auth/forgot-password", input);
  };

  resetPassword = async (input: ResetPasswordRequest): Promise<void> => {
    await this.publicHttp.patch("/v1/auth/reset-password", input);
  };

  changePassword = async (input: ChangePasswordRequest): Promise<void> => {
    await this.privateHttp.patch("/v1/auth/change-password", input);
  };

  logout = async (req: LogoutRequest): Promise<void> => {
    await this.publicHttp.post("/v1/auth/logout", req);
  };
}
