import type {
  AiMealPlanResponse,
  MealPlanCreateRequest,
  MealPlanResponse,
} from "@/types";
import type { IMealPlanApi } from "./types";

export class MealPlanService {
  constructor(private readonly plans: IMealPlanApi) {}

  create = (input: MealPlanCreateRequest): Promise<MealPlanResponse> =>
    this.plans.create(input);

  /** Đổi bản nháp AI (Instant) sang request lưu (LocalDate); recipeTitle chỉ để hiển thị nên bỏ. */
  createFromAiDraft = (draft: AiMealPlanResponse): Promise<MealPlanResponse> =>
    this.plans.create({
      weekStart: draft.weekStart.slice(0, 10),
      entries: draft.entries.map((e) => ({
        date: e.date.slice(0, 10),
        mealType: e.mealType,
        recipeId: e.recipeId,
        servings: e.servings ?? undefined,
      })),
    });
}
