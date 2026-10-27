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

export interface IMealPlanApi {
  getByWeek(weekStart: string): Promise<MealPlanResponse>;
  create(body: MealPlanCreateRequest): Promise<MealPlanResponse>;
  getById(id: string): Promise<MealPlanResponse>;
  remove(id: string): Promise<void>;
  copy(id: string, toWeekStart: string): Promise<MealPlanResponse>;
  addEntry(id: string, body: MealPlanEntryCreateRequest): Promise<MealPlanEntryResponse>;
  updateEntry(
    id: string,
    entryId: string,
    body: MealPlanEntryUpdateRequest,
  ): Promise<MealPlanEntryResponse>;
  removeEntry(id: string, entryId: string): Promise<void>;
  getShoppingList(id: string): Promise<ShoppingItemResponse[]>;
}

export interface IAiMealPlanApi {
  generateDraft(body: AiMealPlanRequest): Promise<AiMealPlanResponse>;
}
