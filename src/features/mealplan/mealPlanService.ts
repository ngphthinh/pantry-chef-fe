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
import type {  IMealPlanApi } from "./types";

export class MealPlanService {
  constructor(
    private readonly mealPlan: IMealPlanApi,
  ) {}

  getByWeek = (weekStart: string): Promise<MealPlanResponse> =>
    this.mealPlan.getByWeek(weekStart);

  create = (body: MealPlanCreateRequest): Promise<MealPlanResponse> =>
    this.mealPlan.create(body);

  getById = (id: string): Promise<MealPlanResponse> =>
    this.mealPlan.getById(id);

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

  createFromAiDraft = (draft: AiMealPlanResponse): Promise<MealPlanResponse> => {
    const weekStart = draft.weekStart.includes('T')
      ? draft.weekStart.split('T')[0]
      : draft.weekStart;
    const entries: MealPlanEntryCreateRequest[] = draft.entries.map((e) => ({
      date: e.date.includes('T') ? e.date.split('T')[0] : e.date,
      mealType: e.mealType,
      recipeId: e.recipeId,
      servings: e.servings ?? undefined,
    }));
    return this.mealPlan.create({ weekStart, entries });
  };
}
