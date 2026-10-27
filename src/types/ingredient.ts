/** feature/ingredient/dto — endpoint: /v1/ingredients, /v1/ingredient-categories, /v1/users/me/excluded-ingredients */
import type { Unit } from './enums';
import type { UUID } from './common';

// ───────── Request ─────────
export interface IngredientCreateRequest {
  name: string;
  defaultUnit?: Unit;
  categoryId: UUID;
  /** 8–14 chữ số. */
  barcode?: string;
}
export type IngredientUpdateRequest = IngredientCreateRequest;

/** code: UPPER_SNAKE_CASE, vd "SPICE_HERB". */
export interface IngredientCategoryRequest { code: string; name: string }
export interface ExcludedIngredientCreateRequest { name: string }

// ───────── Response ─────────
export interface IngredientCategoryResponse { id: UUID; code: string; name: string }
export interface ExcludedIngredientResponse { id: UUID; name: string }

export interface IngredientResponse {
  id: UUID;
  name: string;
  defaultUnit: Unit | null;
  barcode: string | null;
  category: IngredientCategoryResponse;
}
