import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { savedRecipeService } from "@/core/di/container";

const pick = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

export function useResolvedSavedRecipeId() {
  const params = useLocalSearchParams<{ id?: string; recipeId?: string }>();

  const rawId = pick(params.id);
  const id = rawId === "lookup" ? undefined : rawId; // placeholder cho route [id]
  const recipeId = pick(params.recipeId);

  const [resolvedId, setResolvedId] = useState<string | undefined>(id);
  const [isResolving, setIsResolving] = useState(!id && !!recipeId);
  const [resolveError, setResolveError] = useState<string | null>(null);

  useEffect(() => {
    // Case 1: có id -> dùng luôn
    if (id) {
      setResolvedId(id);
      setIsResolving(false);
      setResolveError(null);
      return;
    }

    // Case 2: chỉ recipeId -> BE tự lấy user, trả về saved detail (có id)
    if (recipeId) {
      let cancelled = false;
      setIsResolving(true);
      setResolveError(null);

      savedRecipeService
        .getByRecipeId(recipeId)
        .then((res) => {
          if (!cancelled) setResolvedId(String(res.id));
        })
        .catch(() => {
          if (!cancelled) setResolveError("Không tìm thấy món đã lưu.");
        })
        .finally(() => {
          if (!cancelled) setIsResolving(false);
        });

      return () => {
        cancelled = true;
      };
    }

    setResolvedId(undefined);
    setIsResolving(false);
    setResolveError("Thiếu tham số.");
  }, [id, recipeId]);

  return { resolvedId, isResolving, resolveError };
}
