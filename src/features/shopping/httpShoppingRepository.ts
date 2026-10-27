import type { AxiosInstance } from 'axios';
import type {
  ShoppingItemCreateRequest,
  ShoppingItemResponse,
  ShoppingListCreateRequest,
  ShoppingListResponse,
} from '@/types';
import type { IShoppingApi } from './types';

export class HttpShoppingRepository implements IShoppingApi {
  constructor(private readonly privateHttp: AxiosInstance) {}

  createList = async (body: ShoppingListCreateRequest): Promise<ShoppingListResponse> => {
    const { data } = await this.privateHttp.post<ShoppingListResponse>('/v1/shopping-lists', body);
    return data;
  };

  addItem = async (
    listId: string,
    item: ShoppingItemCreateRequest,
  ): Promise<ShoppingItemResponse> => {
    const { data } = await this.privateHttp.post<ShoppingItemResponse>(
      `/v1/shopping-lists/${listId}/items`,
      item,
    );
    return data;
  };
}
