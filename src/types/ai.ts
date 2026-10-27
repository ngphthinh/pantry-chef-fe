/** feature/ai/dto — endpoint: /v1/ai/* */
import type { Difficulty, MealType } from './enums';
import type { ISODateTime, UUID } from './common';

// ───────── Request ─────────
/** POST /v1/ai/recognize dùng multipart `image` → xem ImageUploadRequest trong common.ts */

/** Phải có recipeId hoặc recipeTitle (recipeTitle ưu tiên, không tra DB). */
export type SubstitutionRequest = (
  | { recipeId: UUID; recipeTitle?: string }
  | { recipeTitle: string; recipeId?: UUID }
) & {
  /** ≤ 100 ký tự */
  missingIngredient: string;
};

export interface AiMealPlanRequest {
  /** Instant ISO-8601, vd "2026-10-26T00:00:00Z". */
  weekStart: ISODateTime;
  /** 1–7 */
  days: number;
  cuisineId?: UUID;
  /** 5–480 */
  maxMinutes?: number;
}

export interface RecipeIdeasRequest {
  /** 1–10, mặc định 5. */
  limit?: number;
  /** 5–480 */
  maxCookingMinutes?: number;
  cuisine?: string;
}

export interface AdaptRecipeRequest { recipeId: UUID }

// ───────── Response ─────────
export interface RecognizedIngredientResponse {
  /** Tên chuẩn hoá, tiếng Việt. */
  name: string;
  /** Dùng để search recipe API. */
  nameEn: string;
  /** 0..1 */
  confidence: number;
  /** vd "3 quả" — có thể null. */
  quantityHint: string | null;
}

export interface SubstitutionResponse {
  name: string;
  /** vd "1:1", "3/4 lượng ban đầu". */
  ratio: string;
  note: string;
  /** 0..1 */
  confidence: number;
}

export interface RecipeIdeaResponse {
  name: string;
  description: string;
  estimatedMinutes: number | null;
  usedIngredients: string[];
  missingIngredients: string[];
  /** 0..1 */
  confidence: number;
}

/** POST /v1/ai/meal-plan — bản nháp CHƯA lưu; lưu bằng POST /v1/meal-plans. Khác mealplan.MealPlanResponse. */
export interface AiMealPlanEntry {
  date: ISODateTime;
  mealType: MealType;
  recipeId: UUID;
  servings: number | null;
  /** Chỉ để hiển thị; khi lưu không cần gửi. */
  recipeTitle: string;
}
export interface AiMealPlanResponse {
  weekStart: ISODateTime;
  entries: AiMealPlanEntry[];
}

/** POST /v1/ai/adapt-recipe — khác recipe.RecipeDetailResponse (cuisineName là string, unit là string). */
export interface AiRecipeIngredientItem {
  name: string;
  amount: number | null;
  /** String vì nhận cả enum Unit lẫn text do AI sinh. */
  unit: string | null;
}
export interface AiRecipeStepItem {
  stepOrder: number;
  text: string;
  timerSeconds: number | null;
}
export interface AiRecipeDetailResponse {
  id: UUID;
  externalId: string | null;
  title: string;
  imageUrl: string | null;
  servings: number | null;
  readyInMinutes: number | null;
  difficulty: Difficulty | null;
  sourceUrl: string | null;
  custom: boolean;
  cuisineName: string | null;
  ingredients: AiRecipeIngredientItem[];
  steps: AiRecipeStepItem[];
}

// ───────── DTO nội bộ BE (parse output của AI) — không có endpoint trả về ─────────
export interface AiAdaptedRecipe {
  ingredients: { name: string; amount: number | null; unit: string | null }[];
  steps: { text: string }[];
}
export interface AiMealPlanDraft {
  items: { dayIndex: number | null; mealType: MealType | null; recipeId: string | null }[];
}
