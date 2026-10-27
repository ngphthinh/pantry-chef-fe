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
import type { ITokenStorage } from "./types";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

const storage = (): Storage | null =>
  typeof window !== "undefined" ? window.localStorage : null;

export class SecureTokenStorage implements ITokenStorage {
  async saveAccessToken(token: string): Promise<void> {
    storage()?.setItem(ACCESS_TOKEN_KEY, token);
  }

  async getAccessToken(): Promise<string | null> {
    return storage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
  }

  async saveRefreshToken(token: string): Promise<void> {
    storage()?.setItem(REFRESH_TOKEN_KEY, token);
  }

  async getRefreshToken(): Promise<string | null> {
    return storage()?.getItem(REFRESH_TOKEN_KEY) ?? null;
  }

  async clear(): Promise<void> {
    storage()?.removeItem(ACCESS_TOKEN_KEY);
    storage()?.removeItem(REFRESH_TOKEN_KEY);
  }
}
