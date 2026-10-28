import type {
  CursorResponse,
  Difficulty,
  RecipeDetailResponse,
  RecipeSummaryResponse,
} from '@/types';

/**
 * Tham số tìm theo nguyên liệu. `cursor` là offset dạng chuỗi, lấy từ `nextCursor` của lần gọi trước.
 * `ingredients` được gửi dạng lặp tham số (`ingredients=a&ingredients=b`).
 */
export interface RecipeSearchQuery {
  ingredients: string[];
  cursor?: string | null;
  size?: number;
  cuisineId?: string;
  maxMinutes?: number;
  difficulty?: Difficulty;
}

export interface RecipePageQuery {
  cursor?: string | null;
  size?: number;
}

export interface RecipeNameQuery extends RecipePageQuery {
  q: string;
}

/** Các danh sách phân trang trong slice, mỗi danh sách có con trỏ riêng. */
export type RecipeFeedKey = 'search' | 'suggestions' | 'byName' | 'popular';

export interface IRecipeApi {
  search(query: RecipeSearchQuery): Promise<CursorResponse<RecipeSummaryResponse>>;
  suggestions(query: RecipePageQuery): Promise<CursorResponse<RecipeSummaryResponse>>;
  byName(query: RecipeNameQuery): Promise<CursorResponse<RecipeSummaryResponse>>;
  popular(query: RecipePageQuery): Promise<CursorResponse<RecipeSummaryResponse>>;
  random(count?: number): Promise<RecipeSummaryResponse[]>;
  getDetail(externalId: string): Promise<RecipeDetailResponse>;
  similar(externalId: string): Promise<RecipeSummaryResponse[]>;
  scale(externalId: string, servings: number): Promise<RecipeDetailResponse>;
}
