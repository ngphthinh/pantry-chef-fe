import type {
  CursorResponse,
  RecipeDetailResponse,
  RecipeSummaryResponse,
} from '@/types';
import type {
  IRecipeApi,
  RecipeNameQuery,
  RecipePageQuery,
  RecipeSearchQuery,
} from './types';

/** Server chỉ dùng tối đa 10 nguyên liệu cho một lần tìm. */
export const MAX_SEARCH_INGREDIENTS = 10;

export class RecipeService {
  constructor(private readonly recipes: IRecipeApi) {}

  /** Làm sạch danh sách nguyên liệu (bỏ trống, trùng) và cắt theo giới hạn của server. */
  search = (query: RecipeSearchQuery): Promise<CursorResponse<RecipeSummaryResponse>> => {
    const seen = new Set<string>();
    const ingredients = query.ingredients
      .map((name) => name.trim())
      .filter((name) => {
        const key = name.toLowerCase();
        if (!name || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, MAX_SEARCH_INGREDIENTS);
    return this.recipes.search({ ...query, ingredients });
  };

  suggestions = (query: RecipePageQuery = {}): Promise<CursorResponse<RecipeSummaryResponse>> =>
    this.recipes.suggestions(query);

  byName = (query: RecipeNameQuery): Promise<CursorResponse<RecipeSummaryResponse>> =>
    this.recipes.byName({ ...query, q: query.q.trim() });

  popular = (query: RecipePageQuery = {}): Promise<CursorResponse<RecipeSummaryResponse>> =>
    this.recipes.popular(query);

  random = (count?: number): Promise<RecipeSummaryResponse[]> => this.recipes.random(count);

  getDetail = (externalId: string): Promise<RecipeDetailResponse> =>
    this.recipes.getDetail(externalId);

  similar = (externalId: string): Promise<RecipeSummaryResponse[]> =>
    this.recipes.similar(externalId);

  scale = (externalId: string, servings: number): Promise<RecipeDetailResponse> =>
    this.recipes.scale(externalId, servings);
}
