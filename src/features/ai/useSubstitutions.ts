import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { SubstitutionRequest } from "@/types";
import { fetchSubstitutions, substitutionsCleared } from "./aiSlice";

export interface SubstitutionItem {
  key: string;
  name: string;
  ratioLabel: string;
  note: string;
  confidenceLabel: string;
}

export function useSubstitutions() {
  const dispatch = useAppDispatch();
  const list = useAppSelector((s) => s.ai.substitutions);
  const status = useAppSelector((s) => s.ai.substitutionStatus);
  const searched = useAppSelector((s) => s.ai.substitutionsSearched);

  const search = useCallback(
    (input: SubstitutionRequest) => dispatch(fetchSubstitutions(input)),
    [dispatch],
  );

  const clear = useCallback(() => dispatch(substitutionsCleared()), [dispatch]);

  // Định dạng hiển thị làm ở đây, màn hình chỉ in ra
  const items = useMemo<SubstitutionItem[]>(
    () =>
      list.map((s, index) => ({
        key: `${s.name}-${index}`,
        name: s.name,
        ratioLabel: s.ratio ? `Tỉ lệ ${s.ratio}` : "",
        note: s.note ?? "",
        confidenceLabel: `${Math.round((s.confidence ?? 0) * 100)}% tin cậy`,
      })),
    [list],
  );

  return useMemo(
    () => ({
      items,
      isLoading: status === "loading",
      isEmpty: searched && items.length === 0,
      search,
      clear,
    }),
    [items, status, searched, search, clear],
  );
}
