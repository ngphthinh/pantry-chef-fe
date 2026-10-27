/** feature/shopping/dto — endpoint: /v1/shopping-lists */
import type { ShoppingItemStatus, Unit } from './enums';
import type { UUID } from './common';

// ───────── Request ─────────
export interface ShoppingListCreateRequest { name: string }
export interface ShoppingListUpdateRequest { name: string }

export interface ShoppingItemCreateRequest {
  name: string;
  /** > 0 */
  quantity?: number;
  unit?: Unit;
}

/** PATCH — BE yêu cầu đủ 4 field, thiếu/null sẽ bị từ chối. */
export interface ShoppingItemUpdateRequest {
  name: string;
  quantity: number;
  unit: Unit;
  status: ShoppingItemStatus;
}

// ───────── Response ─────────
export interface ShoppingListResponse { id: UUID; name: string }

export interface ShoppingItemResponse {
  id: UUID;
  name: string;
  quantity: number | null;
  unit: Unit | null;
  status: ShoppingItemStatus;
}

export interface ShoppingListDetailResponse {
  id: UUID;
  name: string;
  items: ShoppingItemResponse[];
}
