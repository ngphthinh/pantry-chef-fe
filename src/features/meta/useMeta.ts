import { useCallback, useEffect, useMemo, useState } from "react";
import { runAction } from "@/core/http/actionResult";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMeta } from "./metaSlice";

export function useMeta() {
  const dispatch = useAppDispatch();
  const enums = useAppSelector((s) => s.meta.enums);
  const units = useAppSelector((s) => s.meta.units);
  const status = useAppSelector((s) => s.meta.status);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (force?: boolean) => {
      const result = await runAction(
        () => dispatch(fetchMeta(force)),
        "Không tải được danh sách enum và đơn vị.",
      );
      setError(result.ok ? null : result.message);
      return result;
    },
    [dispatch],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return useMemo(
    () => ({ enums, units, error, isLoading: status === "loading", reload: () => load(true) }),
    [enums, units, error, status, load],
  );
}
