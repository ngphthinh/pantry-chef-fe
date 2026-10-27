import type { CuisineResponse } from "@/types";

export interface ICuisineApi {
  list(): Promise<CuisineResponse[]>;
}
