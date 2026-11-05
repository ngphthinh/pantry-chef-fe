import { useEffect, useState } from "react";
import { privateHttp } from "@/core/di/container";
import type { CursorResponse, IngredientResponse } from "@/types";

/** Tìm nguyên liệu theo tên, debounce 300ms, bỏ qua kết quả của lần gõ cũ. */
export function useIngredientSearch(query: string, enabled: boolean, size = 8) {
  const [items, setItems] = useState<IngredientResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!enabled || !q) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const { data } = await privateHttp.get<
          CursorResponse<IngredientResponse>
        >("/v1/ingredients/search", { params: { q, size } });
        if (active) setItems(data?.content ?? []);
      } catch {
        if (active) setItems([]);
      } finally {
        if (active) setIsLoading(false);
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, enabled, size]);

  return { items, isLoading };
}
