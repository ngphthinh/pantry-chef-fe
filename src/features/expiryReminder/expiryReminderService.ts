import type { IKeyValueStorage } from "@/core/storage/types";
import {
  DEFAULT_REMINDER_SETTINGS,
  type ExpiryReminderSettings,
  type IExpiringSource,
  type INotificationScheduler,
  type ReminderPermission,
  type ReminderPlan,
} from "./types";

const SETTINGS_KEY = "expiryReminder:settings";
const MAX_NAMES_IN_BODY = 3;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(Math.round(value), min), max);

/** Lần gần nhất đến giờ `hour`: hôm nay nếu còn xa hơn 1 phút, không thì ngày mai. */
export function nextOccurrence(hour: number, now: Date = new Date()): Date {
  const date = new Date(now);
  date.setHours(hour, 0, 0, 0);
  if (date.getTime() <= now.getTime() + 60_000) date.setDate(date.getDate() + 1);
  return date;
}

/**
 * Nhắc nguyên liệu sắp hết hạn bằng thông báo CỤC BỘ (không cần server push).
 * Nội dung được tính tại thời điểm lên lịch, nên cần gọi `apply` lại mỗi khi mở app hoặc đổi dữ liệu tủ.
 */
export class ExpiryReminderService {
  constructor(
    private readonly storage: IKeyValueStorage,
    private readonly scheduler: INotificationScheduler,
    private readonly source: IExpiringSource,
  ) {}

  isSupported = (): boolean => this.scheduler.isSupported();

  getPermission = (): Promise<ReminderPermission> => this.scheduler.getPermission();

  requestPermission = (): Promise<ReminderPermission> => this.scheduler.requestPermission();

  /** Huỷ mọi thông báo nhắc đã lên lịch (không đổi cài đặt đã lưu). */
  cancelAll = (): Promise<void> => this.scheduler.cancelAll();

  loadSettings = async (): Promise<ExpiryReminderSettings> => {
    const raw = await this.storage.get(SETTINGS_KEY);
    if (!raw) return DEFAULT_REMINDER_SETTINGS;
    try {
      const parsed = JSON.parse(raw) as Partial<ExpiryReminderSettings>;
      return this.normalize({ ...DEFAULT_REMINDER_SETTINGS, ...parsed });
    } catch {
      return DEFAULT_REMINDER_SETTINGS;
    }
  };

  saveSettings = async (settings: ExpiryReminderSettings): Promise<ExpiryReminderSettings> => {
    const normalized = this.normalize(settings);
    await this.storage.set(SETTINGS_KEY, JSON.stringify(normalized));
    return normalized;
  };

  /**
   * Lên lịch lại theo cài đặt: huỷ lịch cũ, hỏi BE các món sắp hết hạn rồi đặt một thông báo
   * vào giờ đã chọn. Không có món nào thì không đặt gì.
   */
  apply = async (settings: ExpiryReminderSettings): Promise<ReminderPlan> => {
    await this.scheduler.cancelAll();
    if (!settings.enabled || !this.scheduler.isSupported()) {
      return { scheduled: false, itemCount: 0, fireAt: null };
    }

    const items = await this.source.expiring(settings.daysBefore);
    if (items.length === 0) return { scheduled: false, itemCount: 0, fireAt: null };

    const names = items.slice(0, MAX_NAMES_IN_BODY).map((item) => item.ingredientName);
    const rest = items.length - names.length;
    const list = rest > 0 ? `${names.join(", ")} và ${rest} món khác` : names.join(", ");

    const fireAt = nextOccurrence(settings.hour);
    await this.scheduler.scheduleAt(
      fireAt,
      "Nguyên liệu sắp hết hạn",
      `${list} sắp hết hạn trong ${settings.daysBefore} ngày tới. Dùng sớm để khỏi bỏ phí nhé!`,
    );
    return { scheduled: true, itemCount: items.length, fireAt: fireAt.toISOString() };
  };

  private normalize = (settings: ExpiryReminderSettings): ExpiryReminderSettings => ({
    enabled: !!settings.enabled,
    daysBefore: clamp(settings.daysBefore, 1, 7),
    hour: clamp(settings.hour, 0, 23),
  });
}
