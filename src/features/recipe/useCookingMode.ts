import { useCallback, useEffect, useMemo, useState } from 'react';
import { Vibration } from 'react-native';
import { getErrorMessage } from '@/core/http/apiError';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchRecipeDetail } from './recipeSlice';

const TICK_MS = 1000;
const ALARM_PATTERN = [0, 500, 300, 500, 300, 500];

/** Chế độ nấu từng bước, kèm đếm giờ theo `timerSeconds` của bước (nếu có). */
export function useCookingMode(externalId: string | undefined) {
  const dispatch = useAppDispatch();
  const detail = useAppSelector((s) => (externalId ? s.recipe.details[externalId] : undefined));
  const [error, setError] = useState<string | null>(null);

  const [stepIndex, setStepIndex] = useState(0);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [alarmed, setAlarmed] = useState(false);

  const steps = useMemo(
    () => [...(detail?.steps ?? [])].sort((a, b) => a.stepOrder - b.stepOrder),
    [detail],
  );
  const step = steps[stepIndex] ?? null;

  const load = useCallback(async () => {
    if (!externalId) return;
    setError(null);
    try {
      await dispatch(fetchRecipeDetail(externalId));
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, [dispatch, externalId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Sang bước khác thì đặt lại đồng hồ theo thời gian của bước đó
  useEffect(() => {
    setRemaining(step?.timerSeconds ?? null);
    setRunning(false);
    setAlarmed(false);
  }, [step]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setRemaining((r) => (r === null ? null : Math.max(0, r - 1))), TICK_MS);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (running && remaining === 0) {
      setRunning(false);
      setAlarmed(true);
      Vibration.vibrate(ALARM_PATTERN);
    }
  }, [remaining, running]);

  const next = useCallback(() => setStepIndex((i) => Math.min(i + 1, steps.length - 1)), [steps.length]);
  const previous = useCallback(() => setStepIndex((i) => Math.max(i - 1, 0)), []);

  const resetTimer = useCallback(() => {
    setRunning(false);
    setAlarmed(false);
    setRemaining(step?.timerSeconds ?? null);
  }, [step]);

  const toggleTimer = useCallback(() => {
    if (remaining === null) return;
    if (remaining === 0) {
      setRemaining(step?.timerSeconds ?? null);
      setAlarmed(false);
      setRunning(true);
      return;
    }
    setRunning((r) => !r);
  }, [remaining, step]);

  return {
    title: detail?.title ?? '',
    step,
    stepNumber: stepIndex + 1,
    totalSteps: steps.length,
    progress: steps.length ? (stepIndex + 1) / steps.length : 0,
    isFirst: stepIndex === 0,
    isLast: steps.length > 0 && stepIndex === steps.length - 1,
    hasTimer: remaining !== null,
    remainingSeconds: remaining,
    isTimerRunning: running,
    isAlarmed: alarmed,
    isLoading: !detail && !error,
    isEmpty: !!detail && steps.length === 0,
    error,
    reload: load,
    next,
    previous,
    toggleTimer,
    resetTimer,
  };
}
