import type { AiMealPlanRequest, AiMealPlanResponse } from "@/types";

export interface IAiMealPlanApi {
  generateMealPlan(input: AiMealPlanRequest): Promise<AiMealPlanResponse>;
}
