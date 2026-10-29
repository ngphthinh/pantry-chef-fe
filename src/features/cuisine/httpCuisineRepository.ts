import type { AxiosInstance } from "axios";

import type { CuisineRequest, CuisineResponse } from "@/types";
import type { ICuisineAdminApi, ICuisineApi } from "./types";

export class HttpCuisineRepository implements ICuisineApi, ICuisineAdminApi {
  constructor(
    private readonly publicHttp: AxiosInstance,
    private readonly privateHttp: AxiosInstance,
  ) {}

  list = async (): Promise<CuisineResponse[]> => {
    const { data } = await this.publicHttp.get<CuisineResponse[]>("/v1/cuisines");
    return data;
  };

  create = async (body: CuisineRequest): Promise<CuisineResponse> => {
    const { data } = await this.privateHttp.post<CuisineResponse>("/v1/cuisines", body);
    return data;
  };

  update = async (id: string, body: CuisineRequest): Promise<CuisineResponse> => {
    const { data } = await this.privateHttp.put<CuisineResponse>(`/v1/cuisines/${id}`, body);
    return data;
  };

  remove = async (id: string): Promise<void> => {
    await this.privateHttp.delete(`/v1/cuisines/${id}`); // 204, không có body
  };
}