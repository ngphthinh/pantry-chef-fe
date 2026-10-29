import { CACHE_KEYS } from "@/core/cache/cacheKeys";
import { isOfflineError, jsonCache } from "@/core/cache/jsonCache";
import type { MetaEnumsResponse, Unit } from "@/types";
import type { IMetaApi } from "./types";


export class CachedMetaRepository implements IMetaApi {
  constructor(private readonly inner: IMetaApi) {}

  enums = (): Promise<MetaEnumsResponse> =>
    this.withCache(CACHE_KEYS.metaEnums, () => this.inner.enums());

  units = (): Promise<Unit[]> => this.withCache(CACHE_KEYS.metaUnits, () => this.inner.units());

  private async withCache<T>(key: string, fetch: () => Promise<T>): Promise<T> {
    try {
      const fresh = await fetch();
      await jsonCache.write(key, fresh);
      return fresh;
    } catch (error) {
      if (isOfflineError(error)) {
        const cached = await jsonCache.read<T>(key);
        if (cached !== null) return cached;
      }
      throw error;
    }
  }
}
