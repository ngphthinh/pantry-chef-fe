import type { MealPlanCreateRequest, MealPlanResponse } from "@/types";

export interface IMealPlanApi {
  create(input: MealPlanCreateRequest): Promise<MealPlanResponse>;
}
