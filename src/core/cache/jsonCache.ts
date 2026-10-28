import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const PREFIX = "cache:";


export const jsonCache = {
    async read<T>(key: string): Promise<T | null> {
        try {
            const raw = await AsyncStorage.getItem(PREFIX + key);
            return raw ? (JSON.parse(raw) as T) : null;
        } catch {
            return null;
        }
    },

    async write(key: string, value: unknown): Promise<void> {
        try {
            await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
        } catch {
        }
    },

    async remove(key: string): Promise<void> {
        try {
            await AsyncStorage.removeItem(PREFIX + key);
        } catch {
        }
    },

    /** Xoá mọi khoá bắt đầu bằng `prefix` (không kể PREFIX chung). */
    async removeByPrefix(prefix: string): Promise<void> {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const targets = keys.filter((k) => k.startsWith(PREFIX + prefix));
            if (targets.length > 0) await AsyncStorage.multiRemove(targets);
        } catch {
        }
    },

    /** Gọi khi đăng xuất để tài khoản sau không thấy dữ liệu tài khoản trước. */
    clearAll: (): Promise<void> => jsonCache.removeByPrefix(""),
};

/** Lỗi do không có kết nối (không nhận được response nào, kể cả timeout). */
export const isOfflineError = (error: unknown): boolean =>
    axios.isAxiosError(error) && !error.response;