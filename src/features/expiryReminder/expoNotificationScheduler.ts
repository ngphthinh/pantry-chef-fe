import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import type { INotificationScheduler, ReminderPermission } from "./types";

const CHANNEL_ID = "expiry-reminder";
/** Đánh dấu thông báo của tính năng này để chỉ huỷ đúng những cái đó. */
const KIND = "expiry-reminder";

if (Platform.OS !== "web") {
  // Cho phép hiện thông báo cả khi đang mở app
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

const toPermission = (p: Notifications.NotificationPermissionsStatus): ReminderPermission =>
  p.granted ? "granted" : p.status === "undetermined" ? "undetermined" : "denied";

export class ExpoNotificationScheduler implements INotificationScheduler {
  isSupported = (): boolean => Platform.OS !== "web";

  getPermission = async (): Promise<ReminderPermission> =>
    toPermission(await Notifications.getPermissionsAsync());

  requestPermission = async (): Promise<ReminderPermission> =>
    toPermission(await Notifications.requestPermissionsAsync());

  cancelAll = async (): Promise<void> => {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      scheduled
        .filter((n) => n.content.data?.kind === KIND)
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );
  };

  scheduleAt = async (date: Date, title: string, body: string): Promise<void> => {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: "Nhắc nguyên liệu sắp hết hạn",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data: { kind: KIND } },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date,
        channelId: CHANNEL_ID,
      },
    });
  };
}
