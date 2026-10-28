import { isOfflineError, jsonCache } from "@/core/cache/jsonCache";
import type {
    CursorResponse,
    SavedRecipeCreateRequest,
    SavedRecipeDetailResponse,
    SavedRecipeQuery,
    SavedRecipeResponse,
    SavedRecipeUpdateRequest,
} from "@/types";
import type { ISavedRecipeApi } from "./types";
import { CACHE_KEYS } from "@/core/cache/cacheKeys";
const LIST_PREFIX = CACHE_KEYS.savedRecipeListPrefix;
const detailKey = (id: string) => `savedRecipes:detail:${id}`;
const listKey = (q: SavedRecipeQuery) =>
    `${LIST_PREFIX}fav=${q.favorite ?? "all"}:col=${q.collectionId ?? "none"}`;

export class CachedSavedRecipeRepository implements ISavedRecipeApi {
    constructor(private readonly remote: ISavedRecipeApi) {}

    /** Chỉ cache trang đầu của mỗi bộ lọc (tất cả / yêu thích / từng bộ sưu tập). */
    list = async (query: SavedRecipeQuery): Promise<CursorResponse<SavedRecipeResponse>> => {
        const key = listKey(query);
        try {
            const page = await this.remote.list(query);
            if (!query.cursor) await jsonCache.write(key, page);
            return page;
        } catch (error) {
            if (!query.cursor && isOfflineError(error)) {
                const cached = await jsonCache.read<CursorResponse<SavedRecipeResponse>>(key);
                if (cached) return cached;
            }
            throw error;
        }
    };

    get = async (id: string): Promise<SavedRecipeDetailResponse> => {
        try {
            const detail = await this.remote.get(id);
            await jsonCache.write(detailKey(id), detail);
            return detail;
        } catch (error) {
            if (isOfflineError(error)) {
                const cached = await jsonCache.read<SavedRecipeDetailResponse>(detailKey(id));
                if (cached) return cached;
            }
            throw error;
        }
    };

    create = async (body: SavedRecipeCreateRequest): Promise<SavedRecipeResponse> => {
        const created = await this.remote.create(body);
        await this.afterWrite(created.id);
        return created;
    };

    update = async (id: string, body: SavedRecipeUpdateRequest): Promise<SavedRecipeResponse> => {
        const updated = await this.remote.update(id, body);
        await this.afterWrite(id);
        return updated;
    };

    remove = async (id: string): Promise<void> => {
        await this.remote.remove(id);
        await jsonCache.remove(detailKey(id));
        await jsonCache.removeByPrefix(LIST_PREFIX);
        await jsonCache.remove(CACHE_KEYS.collectionsList);
    };

    /** Ghi xong thì danh sách cũ không còn đúng; tải lại chi tiết để xem offline được ngay. */
    private afterWrite = async (id: string): Promise<void> => {
        await jsonCache.remove(detailKey(id));
        await jsonCache.removeByPrefix(LIST_PREFIX);
        try {
            await this.get(id);
        } catch {
        }
    };
}