import type {
  AiMealPlanRequest,
  AiMealPlanResponse,
  PickedImage,
  RecipeIdeaResponse,
  RecipeIdeasRequest,
  RecognizedIngredientResponse,
} from "@/types";
import type { IAiMealPlanApi, IAiRecognizeApi, IRecipeIdeasApi } from "./types";

export class AiService {
  constructor(
    private readonly api: IAiMealPlanApi & IAiRecognizeApi & IRecipeIdeasApi,
  ) {}

  generateMealPlan = (input: AiMealPlanRequest): Promise<AiMealPlanResponse> =>
    this.api.generateMealPlan(input);

  recognizeIngredients = (
    image: PickedImage,
  ): Promise<RecognizedIngredientResponse[]> =>
    this.api.recognizeIngredients(image);

  recipeIdeas = async (
    input: RecipeIdeasRequest,
  ): Promise<RecipeIdeaResponse[]> => {
    const list = await this.api.recipeIdeas(input); // tên field repo của bạn có thể khác `ai`
    return list
      .filter((idea) => idea.name?.trim())
      .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
  };
}
