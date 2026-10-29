import { useCallback, useMemo, useState } from "react";
import { useIngredientSearch } from "@/features/ingredient/useIngredientSearch";
import type { IngredientResponse } from "@/types";
import { useExcludedIngredients } from "./useExcludedIngredients";
import { cleanName, excludedIngredientValidators } from "./validation";

const SUGGESTION_COUNT = 6;

/** Form thêm nguyên liệu loại trừ: gợi ý tên từ danh mục khi gõ, báo trùng ngay trên máy. */
export function useExcludedIngredientForm() {
  const { items, add, isSaving } = useExcludedIngredients({ autoLoad: false });
  // Ô nhập tên dùng chung từ khoá với ô tìm gợi ý
  const search = useIngredientSearch({ pageSize: SUGGESTION_COUNT });
  const [error, setError] = useState<string | null>(null);

  const name = search.keyword;

  const setName = useCallback(
    (value: string) => {
      search.setKeyword(value);
      setError(null);
    },
    [search],
  );

  /** Gợi ý chỉ hiện khi đang gõ, bỏ những nguyên liệu đã loại trừ. */
  const suggestions = useMemo<IngredientResponse[]>(() => {
    if (!name.trim()) return [];
    const taken = new Set(items.map((item) => item.name.trim().toLowerCase()));
    return search.items.filter((i) => !taken.has(i.name.trim().toLowerCase()));
  }, [name, items, search.items]);

  const submit = useCallback(
    async (value = name) => {
      const invalid = excludedIngredientValidators.name(value, items);
      if (invalid) {
        setError(invalid);
        return { ok: false as const, message: invalid };
      }
      const result = await add(cleanName(value));
      if (result.ok) {
        search.setKeyword("");
        setError(null);
      } else {
        setError(result.message);
      }
      return result;
    },
    [name, items, add, search],
  );

  return useMemo(
    () => ({ name, setName, error, suggestions, isSaving, submit }),
    [name, setName, error, suggestions, isSaving, submit],
  );
}
