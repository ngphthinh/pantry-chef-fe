/** feature/recipe/dto — endpoint: /v1/recipes, /v1/recipes/custom, /v1/cuisines */
import type { Difficulty, Unit } from './enums';
import type { ISODateTime, UUID } from './common';

// ───────── Request ─────────
export interface CuisineRequest {
  /** UPPER_CASE, số, gạch dưới (≤ 50 ký tự), vd "JAPANESE". */
  code: string;
  /** ≤ 100 ký tự. */
  name: string;
}

export interface RecipeIngredientRequest {
  name: string;
  /** > 0; bỏ trống = "vừa đủ". */
  amount?: number;
  unit?: Unit;
}

export interface RecipeStepRequest {
  text: string;
  /** Giây, > 0. Thứ tự bước = vị trí trong mảng. */
  timerSeconds?: number;
}

export interface RecipeCreateRequest {
  title: string;
  /** 1–100 */
  servings: number;
  readyInMinutes?: number;
  difficulty?: Difficulty;
  cuisineId?: UUID;
  /** 1–100 dòng */
  ingredients: RecipeIngredientRequest[];
  /** 1–100 bước */
  steps: RecipeStepRequest[];
}

/** PUT /v1/recipes/custom/{id} — thay toàn bộ, cùng shape với create. */
export type RecipeUpdateRequest = RecipeCreateRequest;

// ───────── Response ─────────
export interface CuisineResponse { id: UUID; code: string; name: string }

export interface RecipeIngredientResponse {
  id: UUID;
  name: string;
  amount: number | null;
  unit: Unit | null;
}

export interface RecipeStepResponse {
  id: UUID;
  stepOrder: number;
  text: string;
  timerSeconds: number | null;
}

/**
 * Dòng danh sách công thức.
 * - `id` chỉ có với công thức tự tạo hoặc công thức API ngoài đã lưu về; kết quả tìm kiếm ngoài chỉ có `externalId`
 *   → gọi chi tiết để lấy `id`.
 * - Nhóm match* chỉ có khi tìm theo nguyên liệu.
 */
export interface RecipeSummaryResponse {
  id: UUID | null;
  externalId: string | null;
  title: string;
  imageUrl: string | null;
  servings: number | null;
  readyInMinutes: number | null;
  difficulty: Difficulty | null;
  custom: boolean;
  cuisine: CuisineResponse | null;
  usedIngredientCount: number | null;
  missedIngredientCount: number | null;
  /** 0..1 = used / (used + missed). */
  matchScore: number | null;
  missingIngredients: string[] | null;
}

/** Chi tiết đầy đủ để cache xem offline. */
export interface RecipeDetailResponse {
  id: UUID;
  /** null nếu là công thức tự tạo. */
  externalId: string | null;
  title: string;
  imageUrl: string | null;
  servings: number | null;
  readyInMinutes: number | null;
  difficulty: Difficulty | null;
  sourceUrl: string | null;
  custom: boolean;
  cuisine: CuisineResponse | null;
  ingredients: RecipeIngredientResponse[];
  steps: RecipeStepResponse[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

/** Projection nội bộ của repository BE (không đi qua API) — để tham khảo. */
export interface MissingRow { recipeId: UUID; name: string }
export interface RecipeMatchRow { recipeId: UUID; used: number; total: number }
