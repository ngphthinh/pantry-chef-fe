import type { AiMealPlanRequest, AiMealPlanResponse } from "@/types";
import type { IAiMealPlanApi } from "./types";

export class AiService {
  constructor(private readonly mealPlanApi: IAiMealPlanApi) {}

  generateMealPlan = (input: AiMealPlanRequest): Promise<AiMealPlanResponse> =>
    this.mealPlanApi.generateMealPlan(input);
}
