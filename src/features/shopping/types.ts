import type {
  CursorResponse,
  ShoppingItemCreateRequest,
  ShoppingItemResponse,
  ShoppingItemUpdateRequest,
  ShoppingListCreateRequest,
  ShoppingListDetailResponse,
  ShoppingListResponse,
  ShoppingListUpdateRequest,
} from "@/types";

export interface ShoppingListQuery {
  /** `nextCursor` của trang trước (UUID). */
  cursor?: string;
  /** Tối đa 50. */
  size?: number;
}

export interface IShoppingListApi {
  getLists(query: ShoppingListQuery): Promise<CursorResponse<ShoppingListResponse>>;
  createList(body: ShoppingListCreateRequest): Promise<ShoppingListResponse>;
  getList(id: string): Promise<ShoppingListDetailResponse>;
  renameList(id: string, body: ShoppingListUpdateRequest): Promise<ShoppingListResponse>;
  removeList(id: string): Promise<void>;
}

export interface IShoppingItemApi {
  addItem(listId: string, body: ShoppingItemCreateRequest): Promise<ShoppingItemResponse>;
  /** PATCH nhưng BE bắt buộc đủ cả 4 trường, thiếu hoặc null sẽ bị từ chối. */
  updateItem(
    listId: string,
    itemId: string,
    body: ShoppingItemUpdateRequest,
  ): Promise<ShoppingItemResponse>;
  removeItem(listId: string, itemId: string): Promise<void>;
}
