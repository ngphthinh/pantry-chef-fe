import { CACHE_KEYS } from "@/core/cache/cacheKeys";
import { isOfflineError, jsonCache } from "@/core/cache/jsonCache";
import type {
    CollectionCreateRequest,
    CollectionResponse,
    CollectionUpdateRequest,
} from "@/types";
import type { ICollectionApi } from "./types";

export class CachedCollectionRepository implements ICollectionApi {
    constructor(private readonly remote: ICollectionApi) {}

    list = async (): Promise<CollectionResponse[]> => {
        try {
            const items = await this.remote.list();
            await jsonCache.write(CACHE_KEYS.collectionsList, items);
            return items;
        } catch (error) {
            if (isOfflineError(error)) {
                const cached = await jsonCache.read<CollectionResponse[]>(CACHE_KEYS.collectionsList);
                if (cached) return cached;
            }
            throw error;
        }
    };

    create = async (body: CollectionCreateRequest): Promise<CollectionResponse> => {
        const created = await this.remote.create(body);
        await this.invalidate();
        return created;
    };

    update = async (id: string, body: CollectionUpdateRequest): Promise<CollectionResponse> => {
        const updated = await this.remote.update(id, body);
        await this.invalidate();
        return updated;
    };

    remove = async (id: string): Promise<void> => {
        await this.remote.remove(id);
        await this.invalidate();
    };

    addRecipe = async (id: string, savedRecipeId: string): Promise<CollectionResponse> => {
        const updated = await this.remote.addRecipe(id, savedRecipeId);
        await this.invalidate();
        return updated;
    };

    removeRecipe = async (id: string, savedRecipeId: string): Promise<CollectionResponse> => {
        const updated = await this.remote.removeRecipe(id, savedRecipeId);
        await this.invalidate();
        return updated;
    };

    /** Ghi xong thì cả danh sách bộ sưu tập lẫn danh sách món theo từng bộ sưu tập đều cũ. */
    private invalidate = async (): Promise<void> => {
        await jsonCache.remove(CACHE_KEYS.collectionsList);
        await jsonCache.removeByPrefix(CACHE_KEYS.savedRecipeListPrefix);
    };
}