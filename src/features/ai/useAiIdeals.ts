import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { RecipeIdeasRequest } from "@/types";
import { generateIdeas, ideasCleared } from "./aiSlice";

export interface IdeaItem {
  key: string;
  name: string;
  description: string;
  timeLabel: string;
  matchLabel: string;
  used: string[];
  missing: string[];
}

export function useAiIdeas() {
  const dispatch = useAppDispatch();
  const ideas = useAppSelector((s) => s.ai.ideas);
  const status = useAppSelector((s) => s.ai.status);
  const generated = useAppSelector((s) => s.ai.generated);

  const generate = useCallback(
    (input: RecipeIdeasRequest) => dispatch(generateIdeas(input)),
    [dispatch],
  );

  const clear = useCallback(() => dispatch(ideasCleared()), [dispatch]);

  // Mọi định dạng hiển thị làm ở đây, màn hình chỉ in ra
  const items = useMemo<IdeaItem[]>(
    () =>
      ideas.map((idea, index) => ({
        key: `${idea.name}-${index}`,
        name: idea.name,
        description: idea.description ?? "",
        timeLabel: idea.estimatedMinutes ? `${idea.estimatedMinutes} phút` : "",
        matchLabel: `${Math.round((idea.confidence ?? 0) * 100)}% phù hợp`,
        used: idea.usedIngredients ?? [],
        missing: idea.missingIngredients ?? [],
      })),
    [ideas],
  );

  return useMemo(
    () => ({
      items,
      isLoading: status === "loading",
      isEmpty: generated && items.length === 0,
      generate,
      clear,
    }),
    [items, status, generated, generate, clear],
  );
}
