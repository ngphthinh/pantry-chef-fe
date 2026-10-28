import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '@/core/http/apiError';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RecipeDetailResponse } from '@/types';
import { fetchRecipeDetail, scaleRecipe } from './recipeSlice';

export type ActionResult = { ok: true } | { ok: false; message: string };

const MIN_SERVINGS = 1;
const MAX_SERVINGS = 100;
const SCALE_DEBOUNCE_MS = 400;

/**
 * Chi tiết một công thức theo externalId (kể cả món seed). Lần đầu mở, server lưu bản sao nên chi tiết luôn có `id` (uuid).
 * Dùng cho màn chi tiết; Thuận (saved) và Trường (thực đơn) lấy `id`/`externalId` từ đây.
 */
export function useRecipeDetail(externalId: string | undefined) {
  const dispatch = useAppDispatch();
  const base = useAppSelector((s) => (externalId ? s.recipe.details[externalId] : undefined));
  const status = useAppSelector((s) => s.recipe.status);

  const [servings, setServings] = useState<number | null>(null);
  const [scaled, setScaled] = useState<RecipeDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scaleError, setScaleError] = useState<string | null>(null);

  const latestServings = useRef<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const load = useCallback(
    async (force = false) => {
      if (!externalId) return;
      setError(null);
      try {
        await dispatch(fetchRecipeDetail(externalId, force));
      } catch (e) {
        setError(getErrorMessage(e));
      }
    },
    [dispatch, externalId],
  );

  // Đổi công thức thì bỏ khẩu phần đã chỉnh của công thức trước
  useEffect(() => {
    clearTimer();
    setServings(null);
    setScaled(null);
    setScaleError(null);
    latestServings.current = null;
    void load();
    return clearTimer;
  }, [load]);

  const baseServings = base?.servings ?? null;
  const currentServings = servings ?? baseServings;

  const changeServings = useCallback(
    (delta: number) => {
      if (!externalId || currentServings === null) return;
      const next = Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, currentServings + delta));
      if (next === currentServings) return;

      setServings(next);
      setScaleError(null);
      latestServings.current = next;
      clearTimer();

      if (next === baseServings) {
        setScaled(null); // về khẩu phần gốc thì dùng lại bản đã có, không gọi API
        return;
      }
      timer.current = setTimeout(async () => {
        try {
          const result = await dispatch(scaleRecipe(externalId, next));
          if (latestServings.current === next) setScaled(result);
        } catch (e) {
          if (latestServings.current === next) setScaleError(getErrorMessage(e));
        }
      }, SCALE_DEBOUNCE_MS);
    },
    [dispatch, externalId, currentServings, baseServings],
  );

  /**
   * TODO(Thuận): nối API lưu công thức. Hợp đồng: POST /v1/saved-recipes với `{ externalId }`
   * (hoặc `{ recipeId: detail.id }`). Khi có hook của saved-recipe thì gọi ở đây và trả `{ ok: true }`.
   */
  const saveRecipe = useCallback(async (): Promise<ActionResult> => {
    return { ok: false, message: 'Tính năng lưu công thức đang được nối với phần Đã lưu.' };
  }, []);

  const detail = scaled ?? base ?? null;

  return {
    detail,
    servings: currentServings,
    isScaled: scaled !== null,
    isLoading: status.detail === 'loading' && !base,
    isScaling: status.scale === 'loading',
    error,
    scaleError,
    reload: () => load(true),
    changeServings,
    saveRecipe,
    /** Tham số cho màn `meal-plan/add-entry` (thực đơn dùng uuid, không dùng externalId). */
    mealPlanParams: base ? { recipeId: base.id, recipeTitle: base.title } : null,
  };
}
