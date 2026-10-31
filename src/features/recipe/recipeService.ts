import type {
  CursorResponse,
  RecipeDetailResponse,
  RecipeSummaryResponse,
} from "@/types";
import type {
  IRecipeApi,
  RecipeNameQuery,
  RecipePageQuery,
  RecipeSearchQuery,
} from "./types";

export class RecipeService {
  constructor(private readonly recipes: IRecipeApi) {}

  /** Làm sạch danh sách nguyên liệu (bỏ trống, trùng); không giới hạn số lượng. */
  search = (
    query: RecipeSearchQuery,
  ): Promise<CursorResponse<RecipeSummaryResponse>> => {
    const seen = new Set<string>();
    const ingredients = query.ingredients
      .map((name) => name.trim())
      .filter((name) => {
        const key = name.toLowerCase();
        if (!name || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    return this.recipes.search({ ...query, ingredients });
  };

  suggestions = (
    query: RecipePageQuery = {},
  ): Promise<CursorResponse<RecipeSummaryResponse>> =>
    this.recipes.suggestions(query);

  byName = (
    query: RecipeNameQuery,
  ): Promise<CursorResponse<RecipeSummaryResponse>> =>
    this.recipes.byName({ ...query, q: query.q.trim() });

  random = (count?: number): Promise<RecipeSummaryResponse[]> =>
    this.recipes.random(count);

  getDetail = (externalId: string): Promise<RecipeDetailResponse> =>
    this.recipes.getDetail(externalId);

  similar = (externalId: string): Promise<RecipeSummaryResponse[]> =>
    this.recipes.similar(externalId);

  scale = (
    externalId: string,
    servings: number,
  ): Promise<RecipeDetailResponse> => this.recipes.scale(externalId, servings);
}
