import type {
  ShoppingItemCreateRequest,
  ShoppingItemResponse,
  ShoppingListCreateRequest,
  ShoppingListResponse,
} from '@/types';

export interface IShoppingApi {
  createList(body: ShoppingListCreateRequest): Promise<ShoppingListResponse>;
  addItem(listId: string, item: ShoppingItemCreateRequest): Promise<ShoppingItemResponse>;
}
