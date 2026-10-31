import type { ExcludedIngredientCreateRequest, ExcludedIngredientResponse } from "@/types";

export interface IExcludedIngredientApi {
  list(): Promise<ExcludedIngredientResponse[]>;
  add(body: ExcludedIngredientCreateRequest): Promise<ExcludedIngredientResponse>;
  remove(id: string): Promise<void>;
}
