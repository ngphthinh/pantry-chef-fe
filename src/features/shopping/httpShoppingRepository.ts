import type { AxiosInstance } from "axios";

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
import type { IShoppingItemApi, IShoppingListApi, ShoppingListQuery } from "./types";

export class HttpShoppingRepository implements IShoppingListApi, IShoppingItemApi {
  constructor(private readonly privateHttp: AxiosInstance) {}

  // ───────── /v1/shopping-lists ─────────

  getLists = async (query: ShoppingListQuery): Promise<CursorResponse<ShoppingListResponse>> => {
    const { data } = await this.privateHttp.get<CursorResponse<ShoppingListResponse>>(
      "/v1/shopping-lists",
      { params: query },
    );
    return data;
  };

  createList = async (body: ShoppingListCreateRequest): Promise<ShoppingListResponse> => {
    const { data } = await this.privateHttp.post<ShoppingListResponse>("/v1/shopping-lists", body);
    return data;
  };

  getList = async (id: string): Promise<ShoppingListDetailResponse> => {
    const { data } = await this.privateHttp.get<ShoppingListDetailResponse>(`/v1/shopping-lists/${id}`);
    return data;
  };

  renameList = async (id: string, body: ShoppingListUpdateRequest): Promise<ShoppingListResponse> => {
    const { data } = await this.privateHttp.put<ShoppingListResponse>(`/v1/shopping-lists/${id}`, body);
    return data;
  };

  removeList = async (id: string): Promise<void> => {
    await this.privateHttp.delete(`/v1/shopping-lists/${id}`); // 204, không có body
  };

  createListFromMealPlan = async (mealPlanId: string): Promise<ShoppingListDetailResponse> => {
    const { data } = await this.privateHttp.post<ShoppingListDetailResponse>(
      `/v1/shopping-lists/from-meal-plan/${mealPlanId}`,
    );
    return data;
  };

  createListFromRecipe = async (recipeId: string): Promise<ShoppingListDetailResponse> => {
    const { data } = await this.privateHttp.post<ShoppingListDetailResponse>(
      `/v1/shopping-lists/from-recipe/${recipeId}`,
    );
    return data;
  };

  moveToPantry = async (listId: string): Promise<PantryItemResponse[]> => {
    const { data } = await this.privateHttp.post<PantryItemResponse[]>(
      `/v1/shopping-lists/${listId}/move-to-pantry`,
    );
    return data;
  };

  // ───────── /v1/shopping-lists/{listId}/items ─────────

  addItem = async (listId: string, body: ShoppingItemCreateRequest): Promise<ShoppingItemResponse> => {
    const { data } = await this.privateHttp.post<ShoppingItemResponse>(
      `/v1/shopping-lists/${listId}/items`,
      body,
    );
    return data;
  };

  updateItem = async (
    listId: string,
    itemId: string,
    body: ShoppingItemUpdateRequest,
  ): Promise<ShoppingItemResponse> => {
    const { data } = await this.privateHttp.patch<ShoppingItemResponse>(
      `/v1/shopping-lists/${listId}/items/${itemId}`,
      body,
    );
    return data;
  };

  removeItem = async (listId: string, itemId: string): Promise<void> => {
    await this.privateHttp.delete(`/v1/shopping-lists/${listId}/items/${itemId}`); // 204, không có body
  };
}
