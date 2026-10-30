import { useCallback, useMemo, useState } from "react";
import { confirmDialog } from "@/components/ui/dialogs";
import { runAction } from "@/core/http/actionResult";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { formatQuantity } from "@/features/unit/unitOptions";
import { deleteCustomRecipe, fetchCustomRecipeDetail } from "./customRecipeSlice";
import { formatRecipeMeta, formatTimer } from "./recipeFormat";

export interface IngredientLine {
  id: string;
  name: string;
  /** "500 g", hoặc "vừa đủ" khi công thức không ghi số lượng. */
  amountLabel: string;
}

export interface StepLine {
  id: string;
  order: number;
  text: string;
  /** "15 phút", rỗng nếu bước không hẹn giờ. */
  timerLabel: string;
}

/** Chi tiết một công thức tự tạo (màn `recipe/custom/[id]`, và để nạp sẵn form khi sửa). */
export function useCustomRecipeDetail(recipeId: string | undefined) {
  const dispatch = useAppDispatch();
  const stored = useAppSelector((s) => s.customRecipe.detail);
  const status = useAppSelector((s) => s.customRecipe.status);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Store giữ một chi tiết duy nhất; chỉ trả về khi đúng công thức đang xem.
  const recipe = recipeId && stored?.id === recipeId ? stored : null;

  const load = useCallback(async () => {
    if (!recipeId) return;
    const result = await runAction(
      () => dispatch(fetchCustomRecipeDetail(recipeId)),
      "Không tải được công thức.",
    );
    setLoadError(result.ok ? null : result.message);
  }, [dispatch, recipeId]);

  /** Hỏi xác nhận rồi mới xoá. Trả `null` nếu người dùng huỷ. */
  const confirmAndRemove = useCallback(async () => {
    if (!recipeId) return null;
    const confirmed = await confirmDialog({
      title: "Xoá công thức",
      message: `Xoá “${recipe?.title ?? "công thức này"}”? Hành động này không thể hoàn tác.`,
      confirmText: "Xoá",
      destructive: true,
    });
    if (!confirmed) return null;
    return runAction(() => dispatch(deleteCustomRecipe(recipeId)), "Không thể xoá công thức.");
  }, [dispatch, recipeId, recipe]);

  const meta = useMemo(
    () => (recipe ? formatRecipeMeta(recipe.readyInMinutes, recipe.difficulty) : ""),
    [recipe],
  );

  const ingredientLines = useMemo<IngredientLine[]>(
    () =>
      (recipe?.ingredients ?? []).map((i) => ({
        id: i.id,
        name: i.name,
        amountLabel: formatQuantity(i.amount, i.unit) || "vừa đủ",
      })),
    [recipe],
  );

  const stepLines = useMemo<StepLine[]>(
    () =>
      [...(recipe?.steps ?? [])]
        .sort((a, b) => a.stepOrder - b.stepOrder)
        .map((s) => ({
          id: s.id,
          order: s.stepOrder,
          text: s.text,
          timerLabel: formatTimer(s.timerSeconds),
        })),
    [recipe],
  );

  return useMemo(
    () => ({
      recipe,
      meta,
      ingredientLines,
      stepLines,
      isLoading: status === "loadingDetail",
      isSaving: status === "saving",
      loadError,
      load,
      confirmAndRemove,
    }),
    [recipe, meta, ingredientLines, stepLines, status, loadError, load, confirmAndRemove],
  );
}
