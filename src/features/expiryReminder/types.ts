import type { PantryItemResponse } from "@/types";

export interface ExpiryReminderSettings {
  enabled: boolean;
  /** Nhắc về những món hết hạn trong N ngày tới (1–7). */
  daysBefore: number;
  /** Giờ nhắc trong ngày (0–23). */
  hour: number;
}

export const DEFAULT_REMINDER_SETTINGS: ExpiryReminderSettings = {
  enabled: false,
  daysBefore: 2,
  hour: 8,
};

export const DAYS_BEFORE_OPTIONS = [1, 2, 3, 5, 7] as const;
export const REMINDER_HOUR_OPTIONS = [7, 8, 9, 12, 18, 20] as const;

export type ReminderPermission = "granted" | "denied" | "undetermined";

/** Kết quả lần lên lịch gần nhất, để màn hình báo cho người dùng biết. */
export interface ReminderPlan {
  scheduled: boolean;
  itemCount: number;
  /** ISO 8601 */
  fireAt: string | null;
}

export interface INotificationScheduler {
  /** Web không có thông báo cục bộ. */
  isSupported(): boolean;
  getPermission(): Promise<ReminderPermission>;
  requestPermission(): Promise<ReminderPermission>;
  /** Huỷ các thông báo nhắc hết hạn đã lên lịch (không đụng thông báo khác). */
  cancelAll(): Promise<void>;
  scheduleAt(date: Date, title: string, body: string): Promise<void>;
}

/** Nguồn dữ liệu món sắp hết hạn: `pantryService` (GET /v1/pantry-items/expiring) đáp ứng interface này. */
export interface IExpiringSource {
  expiring(days?: number): Promise<PantryItemResponse[]>;
}
