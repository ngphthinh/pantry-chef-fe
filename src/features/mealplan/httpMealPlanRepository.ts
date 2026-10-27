import type { AxiosInstance } from "axios";
import type {
  AiMealPlanRequest,
  AiMealPlanResponse,
  MealPlanCreateRequest,
  MealPlanEntryCreateRequest,
  MealPlanEntryResponse,
  MealPlanEntryUpdateRequest,
  MealPlanResponse,
  ShoppingItemResponse,
} from "@/types";
import type { IMealPlanApi } from "./types";

export class HttpMealPlanRepository implements IMealPlanApi {
  constructor(private readonly privateHttp: AxiosInstance) {}

  getByWeek = async (weekStart: string): Promise<MealPlanResponse> => {
    const { data } = await this.privateHttp.get<MealPlanResponse>(
      "/v1/meal-plans",
      {
        params: { weekStart },
      },
    );
    return data;
  };

  create = async (body: MealPlanCreateRequest): Promise<MealPlanResponse> => {
    const { data } = await this.privateHttp.post<MealPlanResponse>(
      "/v1/meal-plans",
      body,
    );
    return data;
  };

  getById = async (id: string): Promise<MealPlanResponse> => {
    const { data } = await this.privateHttp.get<MealPlanResponse>(
      `/v1/meal-plans/${id}`,
    );
    return data;
  };

  remove = async (id: string): Promise<void> => {
    console.log("Meal plan removed:");
    const res = await this.privateHttp.delete(`/v1/meal-plans/${id}`);
  };

  copy = async (id: string, toWeekStart: string): Promise<MealPlanResponse> => {
    const { data } = await this.privateHttp.post<MealPlanResponse>(
      `/v1/meal-plans/${id}/copy`,
      null,
      { params: { toWeekStart } },
    );
    return data;
  };

  addEntry = async (
    id: string,
    body: MealPlanEntryCreateRequest,
  ): Promise<MealPlanEntryResponse> => {
    const { data } = await this.privateHttp.post<MealPlanEntryResponse>(
      `/v1/meal-plans/${id}/entries`,
      body,
    );
    return data;
  };

  updateEntry = async (
    id: string,
    entryId: string,
    body: MealPlanEntryUpdateRequest,
  ): Promise<MealPlanEntryResponse> => {
    const { data } = await this.privateHttp.patch<MealPlanEntryResponse>(
      `/v1/meal-plans/${id}/entries/${entryId}`,
      body,
    );
    return data;
  };

  removeEntry = async (id: string, entryId: string): Promise<void> => {
    await this.privateHttp.delete(`/v1/meal-plans/${id}/entries/${entryId}`);
  };

  getShoppingList = async (id: string): Promise<ShoppingItemResponse[]> => {
    const { data } = await this.privateHttp.get<ShoppingItemResponse[]>(
      `/v1/meal-plans/${id}/shopping-list`,
    );
    return data;
  };
}
