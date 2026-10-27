import type {
  ShoppingItemCreateRequest,
  ShoppingItemResponse,
  ShoppingListCreateRequest,
  ShoppingListResponse,
} from '@/types';
import type { IShoppingApi } from './types';

export class ShoppingService {
  constructor(private readonly shopping: IShoppingApi) {}

  createList = (body: ShoppingListCreateRequest): Promise<ShoppingListResponse> =>
    this.shopping.createList(body);

  addItem = (
    listId: string,
    item: ShoppingItemCreateRequest,
  ): Promise<ShoppingItemResponse> => this.shopping.addItem(listId, item);

  saveItemsAsList = async (
    name: string,
    items: { name: string; quantity?: number; unit?: any }[],
  ): Promise<ShoppingListResponse> => {
    const list = await this.shopping.createList({ name });
    for (const item of items) {
      await this.shopping.addItem(list.id, {
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
      });
    }
    return list;
  };
}
