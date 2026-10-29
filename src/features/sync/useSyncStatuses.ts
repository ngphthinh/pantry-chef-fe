import { useCallback, useEffect, useMemo, useState } from "react";
import { runAction } from "@/core/http/actionResult";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSyncStatuses } from "./syncSlice";

/** Bảng tra cứu trạng thái đồng bộ (PENDING, SYNCED...). Tự tải một lần khi có màn hình đầu tiên dùng. */
export function useSyncStatuses() {
  const dispatch = useAppDispatch();
  const statuses = useAppSelector((s) => s.sync.statuses);
  const status = useAppSelector((s) => s.sync.status);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (force?: boolean) => {
      const result = await runAction(
        () => dispatch(fetchSyncStatuses(force)),
        "Không tải được trạng thái đồng bộ.",
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
    () => ({ statuses, error, isLoading: status === "loading", reload: () => load(true) }),
    [statuses, error, status, load],
  );
}
