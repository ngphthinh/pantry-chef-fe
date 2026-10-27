import type { AxiosInstance } from "axios";
import type { CuisineResponse, CursorResponse } from "@/types";
import type { ICuisineApi } from "./types";

export class HttpCuisineRepository implements ICuisineApi {
  constructor(private readonly privateHttp: AxiosInstance) {}

  list = async (): Promise<CuisineResponse[]> => {
    const { data } = await this.privateHttp.get<
      CuisineResponse[] | CursorResponse<CuisineResponse>
    >("/v1/cuisines");
    return Array.isArray(data) ? data : data.content;
  };
}
