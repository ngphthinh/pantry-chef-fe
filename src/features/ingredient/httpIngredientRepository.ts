import type { AxiosInstance } from "axios";

import type {
  CursorResponse,
  IngredientCreateRequest,
  IngredientResponse,
  IngredientUpdateRequest,
} from "@/types";
import type { IIngredientAdminApi, IIngredientApi, IngredientQuery } from "./types";

export class HttpIngredientRepository implements IIngredientApi, IIngredientAdminApi {
  constructor(private readonly privateHttp: AxiosInstance) {}

  search = async (query: IngredientQuery): Promise<CursorResponse<IngredientResponse>> => {
    const { data } = await this.privateHttp.get<CursorResponse<IngredientResponse>>(
      "/v1/ingredients/search",
      { params: query },
    );
    return data;
  };

  getById = async (id: string): Promise<IngredientResponse> => {
    const { data } = await this.privateHttp.get<IngredientResponse>(`/v1/ingredients/${id}`);
    return data;
  };

  getByBarcode = async (code: string): Promise<IngredientResponse> => {
    const { data } = await this.privateHttp.get<IngredientResponse>(
      `/v1/ingredients/barcode/${encodeURIComponent(code)}`,
    );
    return data;
  };

  create = async (body: IngredientCreateRequest): Promise<IngredientResponse> => {
    const { data } = await this.privateHttp.post<IngredientResponse>("/v1/ingredients", body);
    return data;
  };

  update = async (id: string, body: IngredientUpdateRequest): Promise<IngredientResponse> => {
    const { data } = await this.privateHttp.put<IngredientResponse>(`/v1/ingredients/${id}`, body);
    return data;
  };

  remove = async (id: string): Promise<void> => {
    await this.privateHttp.delete(`/v1/ingredients/${id}`);
  };
}
