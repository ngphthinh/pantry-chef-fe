import { Platform } from "react-native";

/** "android 34", "ios 17.5", "web". BE giới hạn 255 ký tự. */
export const getDeviceInfo = (): string =>
  [Platform.OS, Platform.Version].filter(Boolean).join(" ").slice(0, 255);
