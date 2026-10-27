export interface IKeyValueStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

export interface ITokenStorage {
  saveAccessToken(token: string): Promise<void>;
  getAccessToken(): Promise<string | null>;

  saveRefreshToken(token: string): Promise<void>;
  getRefreshToken(): Promise<string | null>;

  clear(): Promise<void>;
}
