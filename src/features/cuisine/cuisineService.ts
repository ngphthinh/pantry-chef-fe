import type { CuisineResponse } from "@/types";
import type { ICuisineApi } from "./types";

export class CuisineService {
  constructor(private readonly cuisines: ICuisineApi) {}

  list = (): Promise<CuisineResponse[]> => this.cuisines.list();
}
