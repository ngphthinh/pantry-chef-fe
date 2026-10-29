import type { AxiosInstance } from "axios";

import type { ExcludedIngredientCreateRequest, ExcludedIngredientResponse } from "@/types";
import type { IExcludedIngredientApi } from "./types";

export class HttpExcludedIngredientRepository implements IExcludedIngredientApi {
  constructor(private readonly privateHttp: AxiosInstance) {}

  list = async (): Promise<ExcludedIngredientResponse[]> => {
    const { data } = await this.privateHttp.get<ExcludedIngredientResponse[]>(
      "/v1/users/me/excluded-ingredients",
    );
    return data;
  };

  add = async (body: ExcludedIngredientCreateRequest): Promise<ExcludedIngredientResponse> => {
    const { data } = await this.privateHttp.post<ExcludedIngredientResponse>(
      "/v1/users/me/excluded-ingredients",
      body,
    );
    return data;
  };

  remove = async (id: string): Promise<void> => {
    await this.privateHttp.delete(`/v1/users/me/excluded-ingredients/${id}`); // 204
  };
}
