import type {
  CursorResponse,
  PantryItemBatchCreateRequest,
  PantryItemCreateRequest,
  PantryItemResponse,
  PantryItemUpdateRequest,
  PickedImage,
  StorageLocation,
} from '@/types';

export type FreshnessStatus = 'fresh' | 'soon' | 'expired';

export interface FreshnessInfo {
  status: FreshnessStatus;
  label: string;
  daysRemaining: number | null;
}

export interface PantryQuery {
  cursor?: string;
  size?: number;
  keyword?: string;
  categoryId?: string;
  location?: StorageLocation;
}

export interface IPantryApi {
  list(query: PantryQuery): Promise<CursorResponse<PantryItemResponse>>;
  create(body: PantryItemCreateRequest): Promise<PantryItemResponse>;
  createBatch(body: PantryItemBatchCreateRequest): Promise<PantryItemResponse[]>;
  getById(id: string): Promise<PantryItemResponse>;
  update(id: string, body: PantryItemUpdateRequest): Promise<PantryItemResponse>;
  consume(id: string, quantity: number): Promise<PantryItemResponse>;
  remove(id: string): Promise<void>;
  uploadPhoto(id: string, image: PickedImage): Promise<PantryItemResponse>;
  expiring(days?: number): Promise<PantryItemResponse[]>;
}
