import { Alert, Platform } from "react-native";

/** Alert.alert không chạy trên web nên dùng window.alert / window.confirm. */
export function showAlert(title: string, message?: string): void {
  if (Platform.OS === "web") {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmText?: string;
  destructive?: boolean;
}

/** Hỏi xác nhận, trả true nếu người dùng đồng ý. */
export function confirmDialog({
  title,
  message,
  confirmText = "Đồng ý",
  destructive = false,
}: ConfirmOptions): Promise<boolean> {
  if (Platform.OS === "web") {
    return Promise.resolve(
      window.confirm(message ? `${title}\n\n${message}` : title),
    );
  }
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: "Hủy", style: "cancel", onPress: () => resolve(false) },
        {
          text: confirmText,
          style: destructive ? "destructive" : "default",
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
export function notify(title: string, message: string): void {
  if (Platform.OS === "web") window.alert(`${title}\n${message}`);
  else Alert.alert(title, message);
}

/** Trả về true nếu người dùng đồng ý. */
export function confirmAction(opts: ConfirmOptions): Promise<boolean> {
  const { title, message, confirmText = "Đồng ý", destructive = false } = opts;

  if (Platform.OS === "web")
    return Promise.resolve(window.confirm(`${title}\n${message}`));

  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: "Huỷ", style: "cancel", onPress: () => resolve(false) },
        {
          text: confirmText,
          style: destructive ? "destructive" : "default",
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
