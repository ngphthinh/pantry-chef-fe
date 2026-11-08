import { useCallback, useEffect, useMemo, useState } from "react";
import { jsonCache } from "@/core/cache/jsonCache";
import { env } from "@/core/config/env";
import { resolveApiUrl, tokenStorage } from "@/core/di/container";
import { runAction } from "@/core/http/actionResult";
import { useMeta } from "@/features/meta/useMeta";
import { useSyncStatuses } from "./useSyncStatuses";

/** Công cụ cho lúc phát triển: xem bảng tra cứu từ BE, xoá cache và token để thử các luồng lỗi. */
export function useDevTools() {
  const sync = useSyncStatuses();
  const meta = useMeta();

  // URL API thực tế app đang gọi: host đã lưu ở màn đăng nhập (kèm /api), không có thì dùng env.
  const [apiUrl, setApiUrl] = useState(env.apiUrl);
  useEffect(() => {
    let active = true;
    void resolveApiUrl().then((url) => {
      if (active) setApiUrl(url);
    });
    return () => {
      active = false;
    };
  }, []);

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
    await Promise.all([
      sync.reload(),
      meta.reload(),
      resolveApiUrl().then(setApiUrl),
    ]);
  }, [sync, meta]);

  return useMemo(
    () => ({
      isDevBuild: __DEV__,
      apiUrl,
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
    [apiUrl, sync, meta, reloadAll, clearCache, clearTokens],
  );
}
