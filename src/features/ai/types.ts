import type {
  AdaptRecipeRequest,
  AiMealPlanRequest,
  AiMealPlanResponse,
  AiRecipeDetailResponse,
  PickedImage,
  RecipeDetailResponse,
  RecipeIdeaResponse,
  RecipeIdeasRequest,
  RecognizedIngredientResponse,
  SubstitutionRequest,
  SubstitutionResponse,
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

export interface ISubstitutionApi {
  substitutions(input: SubstitutionRequest): Promise<SubstitutionResponse[]>;
}

export interface IAdaptRecipeApi {
  adaptRecipe(input: AdaptRecipeRequest): Promise<AiRecipeDetailResponse>;
}
