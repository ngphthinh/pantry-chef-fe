import type {
  CursorResponse,
  RecipeDetailResponse,
  RecipeSummaryResponse,
} from '@/types';
import type { IRecipeApi, RecipeByNameParams, RecipeSearchParams } from './types';

export class RecipeService {
  constructor(private readonly recipe: IRecipeApi) {}

  search = (params: RecipeSearchParams): Promise<CursorResponse<RecipeSummaryResponse>> =>
    this.recipe.search(params);

  suggestions = (params?: {
    cursor?: string;
    size?: number;
  }): Promise<CursorResponse<RecipeSummaryResponse>> =>
    this.recipe.suggestions(params);

  getDetail = (externalId: string): Promise<RecipeDetailResponse> =>
    this.recipe.getDetail(externalId);

  getByName = (params: RecipeByNameParams): Promise<CursorResponse<RecipeSummaryResponse>> =>
    this.recipe.getByName(params);

  getRandom = (count?: number): Promise<RecipeSummaryResponse[]> =>
    this.recipe.getRandom(count);

  getPopular = (params?: {
    cursor?: string;
    size?: number;
  }): Promise<CursorResponse<RecipeSummaryResponse>> =>
    this.recipe.getPopular(params);

  getSimilar = (externalId: string): Promise<RecipeSummaryResponse[]> =>
    this.recipe.getSimilar(externalId);

  scale = (externalId: string, servings: number): Promise<RecipeDetailResponse> =>
    this.recipe.scale(externalId, servings);

  getCustomList = (params?: {
    cursor?: string;
    size?: number;
  }): Promise<CursorResponse<RecipeSummaryResponse>> =>
    this.recipe.getCustomList(params);

  getCustomDetail = (id: string): Promise<RecipeDetailResponse> =>
    this.recipe.getCustomDetail(id);
}
