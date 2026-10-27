import { useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  generateMealPlanDraft,
  mealPlanDraftCleared,
  mealPlanEntryRemoved,
  saveMealPlanDraft,
} from "./aiSlice";

export function useAiMealPlan() {
  const dispatch = useAppDispatch();
  const draft = useAppSelector((s) => s.ai.mealPlanDraft);

  return useMemo(
    () => ({
      draft,
      generate: (input: Parameters<typeof generateMealPlanDraft>[0]) =>
        dispatch(generateMealPlanDraft(input)),
      removeEntry: (index: number) => dispatch(mealPlanEntryRemoved(index)),
      save: () => dispatch(saveMealPlanDraft()),
      clear: () => dispatch(mealPlanDraftCleared()),
    }),
    [draft, dispatch],
  );
}
