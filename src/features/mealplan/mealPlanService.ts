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

export class MealPlanService {
  constructor(
    private readonly mealPlan: IMealPlanApi,
    private readonly aiMealPlan: IAiMealPlanApi,
  ) {}

  getByWeek = (weekStart: string): Promise<MealPlanResponse> =>
    this.mealPlan.getByWeek(weekStart);

  create = (body: MealPlanCreateRequest): Promise<MealPlanResponse> =>
    this.mealPlan.create(body);

  getById = (id: string): Promise<MealPlanResponse> => this.mealPlan.getById(id);

  remove = (id: string): Promise<void> => this.mealPlan.remove(id);

  copy = (id: string, toWeekStart: string): Promise<MealPlanResponse> =>
    this.mealPlan.copy(id, toWeekStart);

  addEntry = (
    id: string,
    body: MealPlanEntryCreateRequest,
  ): Promise<MealPlanEntryResponse> => this.mealPlan.addEntry(id, body);

  updateEntry = (
    id: string,
    entryId: string,
    body: MealPlanEntryUpdateRequest,
  ): Promise<MealPlanEntryResponse> =>
    this.mealPlan.updateEntry(id, entryId, body);

  removeEntry = (id: string, entryId: string): Promise<void> =>
    this.mealPlan.removeEntry(id, entryId);

  getShoppingList = (id: string): Promise<ShoppingItemResponse[]> =>
    this.mealPlan.getShoppingList(id);

  generateAiDraft = (body: AiMealPlanRequest): Promise<AiMealPlanResponse> =>
    this.aiMealPlan.generateDraft(body);
}
