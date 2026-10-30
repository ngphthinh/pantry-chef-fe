import { Alert, Platform } from "react-native";

export function notify(title: string, message: string): void {
    if (Platform.OS === "web") window.alert(`${title}\n${message}`);
    else Alert.alert(title, message);
}

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    destructive?: boolean;
}

/** Trả về true nếu người dùng đồng ý. */
export function confirmAction(opts: ConfirmOptions): Promise<boolean> {
    const { title, message, confirmText = "Đồng ý", destructive = false } = opts;

    if (Platform.OS === "web") return Promise.resolve(window.confirm(`${title}\n${message}`));

    return new Promise((resolve) => {
        Alert.alert(
            title,
            message,
            [
                { text: "Huỷ", style: "cancel", onPress: () => resolve(false) },
                { text: confirmText, style: destructive ? "destructive" : "default", onPress: () => resolve(true) },
            ],
            { cancelable: true, onDismiss: () => resolve(false) },
        );
    });
}