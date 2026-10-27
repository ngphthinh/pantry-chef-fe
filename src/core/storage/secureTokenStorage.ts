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
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import type { IKeyValueStorage, ITokenStorage } from "./types";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

/** Web: expo-secure-store không chạy được nên dùng localStorage (không có khi SSR). */
const webBackend: IKeyValueStorage = {
  get: async (key) => globalThis.localStorage?.getItem(key) ?? null,
  set: async (key, value) => globalThis.localStorage?.setItem(key, value),
  remove: async (key) => globalThis.localStorage?.removeItem(key),
};

/** iOS/Android: Keychain / Keystore qua expo-secure-store. */
const nativeBackend: IKeyValueStorage = {
  get: (key) => SecureStore.getItemAsync(key),
  set: (key, value) => SecureStore.setItemAsync(key, value),
  remove: (key) => SecureStore.deleteItemAsync(key),
};

export class SecureTokenStorage implements ITokenStorage {
  constructor(
    private readonly backend: IKeyValueStorage = Platform.OS === "web"
      ? webBackend
      : nativeBackend,
  ) {}

  saveAccessToken(token: string): Promise<void> {
    return this.backend.set(ACCESS_TOKEN_KEY, token);
  }

  getAccessToken(): Promise<string | null> {
    return this.backend.get(ACCESS_TOKEN_KEY);
  }

  saveRefreshToken(token: string): Promise<void> {
    return this.backend.set(REFRESH_TOKEN_KEY, token);
  }

  getRefreshToken(): Promise<string | null> {
    return this.backend.get(REFRESH_TOKEN_KEY);
  }

  async clear(): Promise<void> {
    await Promise.all([
      this.backend.remove(ACCESS_TOKEN_KEY),
      this.backend.remove(REFRESH_TOKEN_KEY),
    ]);
  }
}
