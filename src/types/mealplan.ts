/** feature/mealplan/dto — endpoint: /v1/meal-plans */
import type { MealType } from './enums';
import type { ISODate, ISODateTime, UUID } from './common';

// ───────── Request ─────────
export interface MealPlanEntryCreateRequest {
  date: ISODate;
  mealType: MealType;
  recipeId?: UUID;
  /** > 0 */
  servings?: number;
}

export interface MealPlanCreateRequest {
  weekStart: ISODate;
  entries?: MealPlanEntryCreateRequest[];
}

/** PATCH — field nào gửi thì đổi field đó. */
export interface MealPlanEntryUpdateRequest {
  date?: ISODate;
  mealType?: MealType;
  servings?: number;
  cooked?: boolean;
}

// ───────── Response ─────────
export interface MealPlanEntryResponse {
  id: UUID;
  date: ISODate;
  mealType: MealType;
  recipeId: UUID | null;
  recipeTitle: string | null;
  recipeImageUrl: string | null;
  servings: number | null;
  cooked: boolean;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface MealPlanResponse {
  id: UUID;
  weekStart: ISODate;
  entries: MealPlanEntryResponse[];
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}
