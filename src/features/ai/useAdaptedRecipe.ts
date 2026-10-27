import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { adaptRecipe, adaptedRecipeCleared } from "./aiSlice";
import { formatDifficulty, formatIngredient, formatTimer } from "./Recipeformat";


export interface AdaptedRecipeView {
  title: string;
  metaLabel: string;
  ingredients: { key: string; text: string }[];
  steps: { key: string; order: number; text: string; timerLabel: string }[];
}

// Tham số route có thể là string hoặc mảng string
const first = (v: string | string[] | undefined) =>
  (Array.isArray(v) ? v[0] : v) ?? "";

/**
 * Điều chỉnh công thức theo nguyên liệu loại trừ. Tự gọi API một lần khi màn
 * hình mở (nếu có recipeId); rời màn hình thì xoá kết quả để lần sau không
 * hiện nhầm công thức cũ.
 */
export function useAdaptedRecipe(recipeIdParam: string | string[] | undefined) {
  const dispatch = useAppDispatch();
  const recipe = useAppSelector((s) => s.ai.adaptedRecipe);
  const status = useAppSelector((s) => s.ai.adaptStatus);

  const recipeId = first(recipeIdParam);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const run = useCallback(async () => {
    if (!recipeId) return;
    setError(null);
    try {
      await dispatch(adaptRecipe(recipeId));
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Không thể điều chỉnh công thức. Vui lòng thử lại.",
      );
    }
  }, [dispatch, recipeId]);

  useEffect(() => {
    if (!started.current) {
      started.current = true;
      void run();
    }
    return () => {
      dispatch(adaptedRecipeCleared());
    };
    // chỉ chạy một lần khi màn hình mở/đóng
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mọi định dạng hiển thị làm ở đây, màn hình chỉ in ra
  const view = useMemo<AdaptedRecipeView | null>(() => {
    if (!recipe) return null;

    return {
      title: recipe.title,
      metaLabel: [
        recipe.servings ? `${recipe.servings} khẩu phần` : "",
        recipe.readyInMinutes ? `${recipe.readyInMinutes} phút` : "",
        formatDifficulty(recipe.difficulty),
        recipe.cuisineName ?? "",
      ]
        .filter(Boolean)
        .join(" · "),
      ingredients: (recipe.ingredients ?? []).map((ing, i) => ({
        key: `${ing.name}-${i}`,
        text: formatIngredient(ing),
      })),
      steps: [...(recipe.steps ?? [])]
        .sort((a, b) => (a.stepOrder ?? 0) - (b.stepOrder ?? 0))
        .map((s, i) => ({
          key: `${s.stepOrder}-${i}`,
          order: i + 1,
          text: s.text,
          timerLabel: s.timerSeconds
            ? `Hẹn giờ ${formatTimer(s.timerSeconds)}`
            : "",
        })),
    };
  }, [recipe]);

  return {
    view,
    isLoading: status === "loading",
    error,
    hasRecipeId: Boolean(recipeId),
    retry: run,
  };
}
