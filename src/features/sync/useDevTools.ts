import { useCallback, useMemo } from "react";
import { jsonCache } from "@/core/cache/jsonCache";
import { env } from "@/core/config/env";
import { tokenStorage } from "@/core/di/container";
import { runAction } from "@/core/http/actionResult";
import { useMeta } from "@/features/meta/useMeta";
import { useSyncStatuses } from "./useSyncStatuses";

/** Công cụ cho lúc phát triển: xem bảng tra cứu từ BE, xoá cache và token để thử các luồng lỗi. */
export function useDevTools() {
  const sync = useSyncStatuses();
  const meta = useMeta();

  const clearCache = useCallback(
    () =>
      runAction(async () => {
        await jsonCache.clearAll();
      }, "Không xoá được cache."),
    [],
  );

  /** Token mất thì request kế tiếp bị 401, app sẽ quay về đăng nhập (dùng để thử luồng hết phiên). */
  const clearTokens = useCallback(
    () =>
      runAction(async () => {
        await tokenStorage.clear();
      }, "Không xoá được token."),
    [],
  );

  const reloadAll = useCallback(async () => {
    await Promise.all([sync.reload(), meta.reload()]);
  }, [sync, meta]);

  return useMemo(
    () => ({
      isDevBuild: __DEV__,
      apiUrl: env.apiUrl,
      useMock: env.useMock,
      statuses: sync.statuses,
      syncError: sync.error,
      isSyncLoading: sync.isLoading,
      enums: meta.enums,
      units: meta.units,
      metaError: meta.error,
      isMetaLoading: meta.isLoading,
      reloadAll,
      clearCache,
      clearTokens,
    }),
    [sync, meta, reloadAll, clearCache, clearTokens],
  );
}
