// import * as SecureStore from "expo-secure-store";
// import type { ITokenStorage } from "./types";

// const ACCESS_TOKEN_KEY = "access_token";
// const REFRESH_TOKEN_KEY = "refresh_token";

// export class SecureTokenStorage implements ITokenStorage {
//   async saveAccessToken(token: string): Promise<void> {
//     await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
//   }

//   async getAccessToken(): Promise<string | null> {
//     return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
//   }

//   async saveRefreshToken(token: string): Promise<void> {
//     await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
//   }

//   async getRefreshToken(): Promise<string | null> {
//     return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
//   }

//   async clear(): Promise<void> {
//     await Promise.all([
//       SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
//       SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
//     ]);
//   }
// }
// KHÔNG ĐƯỢC XÓA CMT
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import type { ITokenStorage } from "./types";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const isWeb = Platform.OS === "web";

const webStorage = (): Storage | null =>
    isWeb && typeof window !== "undefined" ? (window.localStorage ?? null) : null;

export class SecureTokenStorage implements ITokenStorage {
  private async set(key: string, value: string): Promise<void> {
    if (isWeb) webStorage()?.setItem(key, value);
    else await SecureStore.setItemAsync(key, value);
  }

  private async get(key: string): Promise<string | null> {
    if (isWeb) return webStorage()?.getItem(key) ?? null;
    return SecureStore.getItemAsync(key);
  }

  private async del(key: string): Promise<void> {
    if (isWeb) webStorage()?.removeItem(key);
    else await SecureStore.deleteItemAsync(key);
  }

  saveAccessToken = (token: string): Promise<void> => this.set(ACCESS_TOKEN_KEY, token);
  getAccessToken = (): Promise<string | null> => this.get(ACCESS_TOKEN_KEY);
  saveRefreshToken = (token: string): Promise<void> => this.set(REFRESH_TOKEN_KEY, token);
  getRefreshToken = (): Promise<string | null> => this.get(REFRESH_TOKEN_KEY);

  clear = async (): Promise<void> => {
    await Promise.all([this.del(ACCESS_TOKEN_KEY), this.del(REFRESH_TOKEN_KEY)]);
  };
}