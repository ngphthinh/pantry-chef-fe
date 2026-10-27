import type { AxiosInstance } from "axios";
import type { MealPlanCreateRequest, MealPlanResponse } from "@/types";
import type { IMealPlanApi } from "./types";

export class HttpMealPlanRepository implements IMealPlanApi {
  constructor(private readonly privateHttp: AxiosInstance) {}

  create = async (input: MealPlanCreateRequest): Promise<MealPlanResponse> => {
    const { data } = await this.privateHttp.post<MealPlanResponse>(
      "/v1/meal-plans",
      input,
    );
    return data;
  };
}
