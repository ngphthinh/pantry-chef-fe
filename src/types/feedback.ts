/** feature/feedback/dto — endpoint: POST /v1/feedback */
import type { FeedbackType } from './enums';
import type { ISODateTime, UUID } from './common';

export interface FeedbackCreateRequest {
  type: FeedbackType;
  /** ≤ 2000 ký tự */
  message: string;
  /** ≤ 50 ký tự */
  appVersion?: string;
  /** ≤ 255 ký tự */
  deviceInfo?: string;
}

export interface FeedbackUserInfo {
  id: UUID;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface FeedbackResponse {
  id: UUID;
  type: FeedbackType;
  message: string;
  appVersion: string | null;
  deviceInfo: string | null;
  createdAt: ISODateTime;
  user: FeedbackUserInfo | null;
}
