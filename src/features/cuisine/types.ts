import type { CuisineRequest, CuisineResponse } from "@/types";

export interface ICuisineApi {
  /** Công khai, không cần đăng nhập. */
  list(): Promise<CuisineResponse[]>;
}

/** Chỉ ADMIN mới gọi được. */
export interface ICuisineAdminApi {
  create(body: CuisineRequest): Promise<CuisineResponse>;
  update(id: string, body: CuisineRequest): Promise<CuisineResponse>;
  remove(id: string): Promise<void>;
}