import type {
  AiMealPlanRequest,
  AiMealPlanResponse,
  PickedImage,
  RecipeIdeaResponse,
  RecipeIdeasRequest,
  RecognizedIngredientResponse,
} from "@/types";

export interface IAiMealPlanApi {
  generateMealPlan(input: AiMealPlanRequest): Promise<AiMealPlanResponse>;
}

export interface IAiRecognizeApi {
  recognizeIngredients(
    image: PickedImage,
  ): Promise<RecognizedIngredientResponse[]>;
}

export interface IRecipeIdeasApi {
  recipeIdeas(input: RecipeIdeasRequest): Promise<RecipeIdeaResponse[]>;
}
