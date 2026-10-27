/** feature/pantry/dto — endpoint: /v1/pantry-items */
import type { StorageLocation, Unit } from './enums';
import type { ISODate, ISODateTime, UUID } from './common';

// ───────── Request ─────────
export interface PantryItemCreateRequest {
  ingredientId: UUID;
  /** > 0 */
  quantity: number;
  unit: Unit;
  location?: StorageLocation;
  expiryDate?: ISODate;
  photoUri?: string;
}

/** PUT /v1/pantry-items/{id} — thay toàn bộ (không có ingredientId). */
export interface PantryItemUpdateRequest {
  quantity: number;
  unit: Unit;
  location?: StorageLocation;
  expiryDate?: ISODate;
  photoUri?: string;
}

/** items không được rỗng. */
export interface PantryItemBatchCreateRequest { items: PantryItemCreateRequest[] }

/** > 0 */
export interface PantryItemConsumeRequest { quantity: number }

// ───────── Response ─────────
export interface PantryItemResponse {
  id: UUID;
  ingredientId: UUID;
  ingredientName: string;
  categoryId: UUID;
  categoryName: string;
  quantity: number;
  unit: Unit;
  location: StorageLocation | null;
  expiryDate: ISODate | null;
  photoUri: string | null;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

/** Dùng nội bộ BE khi tính nguyên liệu cần mua (không phải response của endpoint nào). */
export interface NeededItem {
  displayName: string;
  amount: number;
  unit: Unit;
}
