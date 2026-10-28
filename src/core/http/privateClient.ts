import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { forbiddenEvent, unauthorizedEvent } from "../events/emitter";
import type { ITokenStorage } from "../storage/types";
import { toApiError } from "./apiError";

// Chỉnh cho khớp với cách bạn đang gọi các endpoint auth khác
const REFRESH_PATH = "/v1/auth/refresh-token";

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/** Axios cho endpoint cần đăng nhập: gắn Bearer token, tự refresh khi 401. */
export function createPrivateClient(
  baseURL: string,
  tokens: ITokenStorage,
): AxiosInstance {
  const client = axios.create({ baseURL, timeout: 15000 });

  // Nhiều request cùng 401 thì chỉ refresh một lần, các request còn lại chờ chung
  let refreshing: Promise<string> | null = null;

  async function refreshAccessToken(): Promise<string> {
    const refreshToken = await tokens.getRefreshToken();
    if (!refreshToken) throw new Error("NO_REFRESH_TOKEN");

    // Dùng axios thuần (không qua interceptor) để tránh vòng lặp 401
    const res = await axios.post(
      `${baseURL}${REFRESH_PATH}`,
      { refreshToken },
      { timeout: 15000 },
    );

    const data = res.data?.data ?? res.data; // ApiResponse<T> => { code, message, data }
    await tokens.saveAccessToken(data.accessToken);
    if (data.refreshToken) await tokens.saveRefreshToken(data.refreshToken);
    return data.accessToken as string;
  }

  client.interceptors.request.use(async (config) => {
    const token = await tokens.getAccessToken();
    console.log(
        "TOKEN?",
        config.url,
        token ? `có, dài ${String(token).length}, đầu: ${String(token).slice(0, 12)}` : "KHÔNG CÓ",
    );
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    (res) => {
      if (
        res.data &&
        typeof res.data === "object" &&
        "code" in res.data &&
        "data" in res.data &&
        "message" in res.data
      ) {
        res.data = res.data.data;
      }

      return res;
    },
    async (error) => {
      const status = error.response?.status;
      const original = error.config as RetryableConfig | undefined;

      if (status === 403) forbiddenEvent.emit();

      const canRefresh =
        status === 401 &&
        original &&
        !original._retry &&
        !original.url?.includes(REFRESH_PATH);

      if (canRefresh) {
        original._retry = true;
        try {
          refreshing ??= refreshAccessToken().finally(() => {
            refreshing = null;
          });
          const newToken = await refreshing;
          original.headers.Authorization = `Bearer ${newToken}`;
          return client(original); // gọi lại request cũ
        } catch (e) {
          console.log("REFRESH FAILED:", e);
          await tokens.clear();
          unauthorizedEvent.emit();
          return Promise.reject(toApiError(error));
        }
      }

      if (status === 401) {
        await tokens.clear();
        unauthorizedEvent.emit();
      }
      return Promise.reject(toApiError(error));
    },
  );

  return client;
}
