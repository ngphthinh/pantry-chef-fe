import type { AxiosInstance } from 'axios';
import type {
  AiMealPlanRequest,
  AiMealPlanResponse,
  MealPlanCreateRequest,
  MealPlanEntryCreateRequest,
  MealPlanEntryResponse,
  MealPlanEntryUpdateRequest,
  MealPlanResponse,
  ShoppingItemResponse,
} from '@/types';
import type { IAiMealPlanApi, IMealPlanApi } from './types';

export class HttpMealPlanRepository implements IMealPlanApi, IAiMealPlanApi {
  constructor(private readonly privateHttp: AxiosInstance) {}

  getByWeek = async (weekStart: string): Promise<MealPlanResponse> => {
    const { data } = await this.privateHttp.get<MealPlanResponse>('/v1/meal-plans', {
      params: { weekStart },
    });
    return data;
  };

  create = async (body: MealPlanCreateRequest): Promise<MealPlanResponse> => {
    const { data } = await this.privateHttp.post<MealPlanResponse>('/v1/meal-plans', body);
    return data;
  };

  getById = async (id: string): Promise<MealPlanResponse> => {
    const { data } = await this.privateHttp.get<MealPlanResponse>(`/v1/meal-plans/${id}`);
    return data;
  };

  remove = async (id: string): Promise<void> => {
    await this.privateHttp.delete(`/v1/meal-plans/${id}`);
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

  generateDraft = async (body: AiMealPlanRequest): Promise<AiMealPlanResponse> => {
    const { data } = await this.privateHttp.post<AiMealPlanResponse>(
      '/v1/ai/meal-plan',
      body,
      { timeout: 60000 },
    );
    return data;
  };
}
