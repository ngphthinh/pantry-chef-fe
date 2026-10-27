import type {
  AdaptRecipeRequest,
  AiMealPlanRequest,
  AiMealPlanResponse,
  AiRecipeDetailResponse,
  PickedImage,
  RecipeIdeaResponse,
  RecipeIdeasRequest,
  RecognizedIngredientResponse,
  SubstitutionRequest,
  SubstitutionResponse,
} from "@/types";
import type {
  IAdaptRecipeApi,
  IAiMealPlanApi,
  IAiRecognizeApi,
  IRecipeIdeasApi,
  ISubstitutionApi,
} from "./types";

export class AiService {
  constructor(
    private readonly api: IAiMealPlanApi &
      IAiRecognizeApi &
      IRecipeIdeasApi &
      ISubstitutionApi &
      IAdaptRecipeApi,
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
  substitutions = async (
    input: SubstitutionRequest,
  ): Promise<SubstitutionResponse[]> => {
    const list = await this.api.substitutions(input);
    return list
      .filter((s) => s.name?.trim())
      .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))
      .slice(0, 3); // API trả tối đa 3
  };

  adaptRecipe = (input: AdaptRecipeRequest): Promise<AiRecipeDetailResponse> =>
    this.api.adaptRecipe(input);
}
