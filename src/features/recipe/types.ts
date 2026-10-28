import type {
  CursorResponse,
  Difficulty,
  RecipeDetailResponse,
  RecipeSummaryResponse,
  UUID,
} from '@/types';

export interface RecipeSearchParams {
  ingredients?: string[];
  cursor?: string;
  size?: number;
  cuisineId?: UUID;
  maxMinutes?: number;
  difficulty?: Difficulty;
}

export interface RecipeByNameParams {
  q: string;
  cursor?: string;
  size?: number;
}

export interface IRecipeApi {
  search(params: RecipeSearchParams): Promise<CursorResponse<RecipeSummaryResponse>>;
  suggestions(params?: { cursor?: string; size?: number }): Promise<CursorResponse<RecipeSummaryResponse>>;
  getDetail(externalId: string): Promise<RecipeDetailResponse>;
  getByName(params: RecipeByNameParams): Promise<CursorResponse<RecipeSummaryResponse>>;
  getRandom(count?: number): Promise<RecipeSummaryResponse[]>;
  getPopular(params?: { cursor?: string; size?: number }): Promise<CursorResponse<RecipeSummaryResponse>>;
  getSimilar(externalId: string): Promise<RecipeSummaryResponse[]>;
  scale(externalId: string, servings: number): Promise<RecipeDetailResponse>;
  getCustomList(params?: { cursor?: string; size?: number }): Promise<CursorResponse<RecipeSummaryResponse>>;
  getCustomDetail(id: string): Promise<RecipeDetailResponse>;
}
