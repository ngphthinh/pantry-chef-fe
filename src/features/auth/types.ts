import type {
  LoginRequest,
  LogoutRequest,
  UserCreateRequest,
  AuthenticateResponse,
  UserResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UserUpdateRequest,
  PickedImage,
} from "@/types";

export interface IAuthenticator {
  login(input: LoginRequest): Promise<AuthenticateResponse>;
  register(input: UserCreateRequest): Promise<UserResponse>;
  logout(input: LogoutRequest): Promise<void>;
}

export interface IPasswordRecovery {
  forgotPassword(input: ForgotPasswordRequest): Promise<void>;
  resetPassword(input: ResetPasswordRequest): Promise<void>;
  changePassword(input: ChangePasswordRequest): Promise<void>;
}

export interface IUserApi {
  getMe(): Promise<UserResponse>;
  updateMe(body: UserUpdateRequest): Promise<UserResponse>;
  updateAvatar(image: PickedImage): Promise<UserResponse>;
  deleteMe(): Promise<void>;
}
