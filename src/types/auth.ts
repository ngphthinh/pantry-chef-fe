/** feature/auth/dto — endpoint: /v1/auth/*, /v1/users/me */
import type { MeasurementSystem, ThemeMode } from "./enums";
import type { UUID } from "./common";

// ───────── Request ─────────
export interface LoginRequest {
  email: string;
  /** BE: ≥ 8 ký tự, có hoa, thường, số, ký tự đặc biệt (@ValidPassword). */
  password: string;
}

export interface UserCreateRequest {
  email: string;
  /** BE: ≥ 8 ký tự, có hoa, thường, số, ký tự đặc biệt (@ValidPassword). */
  password: string;
  displayName: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
export interface LogoutRequest {
  accessToken: string;
  refreshToken: string;
}
export interface IntrospectRequest {
  accessToken: string;
}
export interface ForgotPasswordRequest {
  email: string;
}
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

/** PUT /v1/users/me — field nào bỏ trống thì giữ nguyên. displayName: 1–100 ký tự, không toàn khoảng trắng. */
export interface UserUpdateRequest {
  displayName?: string;
  measurementSystem?: MeasurementSystem;
  themeMode?: ThemeMode;
}

// ───────── Response ─────────
export interface UserResponse {
  id: UUID;
  email: string;
  displayName: string;
  avatarUri: string | null;
  measurementSystem: MeasurementSystem;
  themeMode: ThemeMode;
}

export interface AuthenticateResponse {
  accessToken: string;
  refreshToken: string;
  /** Luôn là "Bearer". */
  tokenType: string;
  /** Giây. */
  expiresIn: number;
  user: UserResponse;
}

export interface IntrospectResponse {
  active: boolean;
  exp: number;
  iat: number;
  scope?: string;
  clientId?: string;
  userId?: string;
  sub?: string;
}

export interface PickedImage {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
}



