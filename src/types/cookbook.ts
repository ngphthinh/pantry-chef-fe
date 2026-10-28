/** feature/cookbook/dto — endpoint: /v1/saved-recipes, /v1/collections */
import type { UUID } from './common';
import type { RecipeDetailResponse } from './recipe';

// ───────── Request ─────────
export interface CollectionCreateRequest { name: string }
export interface CollectionUpdateRequest { name: string }

/** Phải có đúng một trong hai: externalId (API ngoài) hoặc recipeId (DB). */
export type SavedRecipeCreateRequest =
  | { externalId: string; recipeId?: never }
  | { recipeId: UUID; externalId?: never };

/** PATCH — gửi ít nhất một field. rating 1–5, note ≤ 2000 ký tự. */
export interface SavedRecipeUpdateRequest {
  rating?: number;
  note?: string;
  favorite?: boolean;
}

// ───────── Response ─────────
export interface CollectionResponse {
  id: UUID; name: string; recipeCount: number }

export interface SavedRecipeResponse {
  id: UUID;
  recipeId: UUID;
  recipeTitle: string;
  rating: number | null;
  note: string | null;
  favorite: boolean;
}

export interface SavedRecipeDetailResponse {
  id: UUID;
  rating: number | null;
  note: string | null;
  favorite: boolean;
  recipe: RecipeDetailResponse;
}



export interface SavedRecipeQuery {
  cursor?: string;
  size?: number;            // 1–50, mặc định 10
  favorite?: boolean;       // tab "Yêu thích"
  collectionId?: string;    // màn hình collection/[id]
}
