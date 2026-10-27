import type { AxiosInstance } from "axios";
import type { AiMealPlanRequest, AiMealPlanResponse } from "@/types";
import type { IAiMealPlanApi } from "./types";

export class HttpAiRepository implements IAiMealPlanApi {
  constructor(private readonly privateHttp: AxiosInstance) {}

  generateMealPlan = async (
    input: AiMealPlanRequest,
  ): Promise<AiMealPlanResponse> => {
    const { data } = await this.privateHttp.post<AiMealPlanResponse>(
      "/v1/ai/meal-plan",
      input,
      { timeout: 60000 },
    );
    return data;
  };
}
