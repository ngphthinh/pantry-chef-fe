import type {
  CursorResponse,
  PantryItemResponse,
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
  /** Danh sách các nguyên liệu còn thiếu của thực đơn (đã trừ đồ trong tủ). 422 nếu không có gì để mua. */
  createListFromMealPlan(mealPlanId: string): Promise<ShoppingListDetailResponse>;
  /** Danh sách đủ nguyên liệu của một công thức. 422 nếu công thức không có nguyên liệu. */
  createListFromRecipe(recipeId: string): Promise<ShoppingListDetailResponse>;
  /** Chuyển các mục đã mua vào tủ; trả về các mục vừa thêm vào tủ (mục không khớp nguyên liệu được giữ lại). */
  moveToPantry(listId: string): Promise<PantryItemResponse[]>;
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
