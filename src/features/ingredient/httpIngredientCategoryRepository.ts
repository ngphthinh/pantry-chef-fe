import type { AxiosInstance } from "axios";

import type { IngredientCategoryRequest, IngredientCategoryResponse } from "@/types";
import type { IIngredientCategoryAdminApi, IIngredientCategoryApi } from "./types";

export class HttpIngredientCategoryRepository
  implements IIngredientCategoryApi, IIngredientCategoryAdminApi
{
  constructor(
    private readonly publicHttp: AxiosInstance,
    private readonly privateHttp: AxiosInstance,
  ) {}

  list = async (): Promise<IngredientCategoryResponse[]> => {
    const { data } = await this.publicHttp.get<IngredientCategoryResponse[]>(
      "/v1/ingredient-categories",
    );
    return data;
  };

  create = async (body: IngredientCategoryRequest): Promise<IngredientCategoryResponse> => {
    const { data } = await this.privateHttp.post<IngredientCategoryResponse>(
      "/v1/ingredient-categories",
      body,
    );
    return data;
  };

  update = async (
    id: string,
    body: IngredientCategoryRequest,
  ): Promise<IngredientCategoryResponse> => {
    const { data } = await this.privateHttp.put<IngredientCategoryResponse>(
      `/v1/ingredient-categories/${id}`,
      body,
    );
    return data;
  };

  remove = async (id: string): Promise<void> => {
    await this.privateHttp.delete(`/v1/ingredient-categories/${id}`); 
  };
}
