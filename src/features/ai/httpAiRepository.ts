import type { AxiosInstance } from "axios";
import { buildImageForm } from "@/core/http/multipart";
import type {
  AiMealPlanRequest,
  AiMealPlanResponse,
  PickedImage,
  RecipeIdeaResponse,
  RecipeIdeasRequest,
  RecognizedIngredientResponse,
} from "@/types";
import type { IAiMealPlanApi, IAiRecognizeApi, IRecipeIdeasApi } from "./types";

export class HttpAiRepository
  implements IAiMealPlanApi, IAiRecognizeApi, IRecipeIdeasApi
{
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

  recognizeIngredients = async (
    image: PickedImage,
  ): Promise<RecognizedIngredientResponse[]> => {
    const form = await buildImageForm("image", image, "scan.jpg");
    const { data } = await this.privateHttp.post<
      RecognizedIngredientResponse[]
    >("/v1/ai/recognize", form, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });
    return data;
  };

  recipeIdeas = async (
    input: RecipeIdeasRequest,
  ): Promise<RecipeIdeaResponse[]> => {
    // AI trả chậm hơn API thường nên nới timeout
    const response = await this.privateHttp.post<RecipeIdeaResponse[]>(
      "/v1/ai/recipe-ideas",
      input,
      { timeout: 60000 },
    );
    return response.data;
  };
}
