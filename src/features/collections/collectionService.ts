import type {
    CollectionCreateRequest,
    CollectionResponse,
    CollectionUpdateRequest,
} from "@/types";
import type { ICollectionApi } from "./types";

export class CollectionService {
    constructor(private readonly collections: ICollectionApi) {}

    list = (): Promise<CollectionResponse[]> => this.collections.list();

    create = (body: CollectionCreateRequest): Promise<CollectionResponse> =>
        this.collections.create(body);

    update = (id: string, body: CollectionUpdateRequest): Promise<CollectionResponse> =>
        this.collections.update(id, body);

    remove = (id: string): Promise<void> => this.collections.remove(id);

    addRecipe = (id: string, savedRecipeId: string): Promise<CollectionResponse> =>
        this.collections.addRecipe(id, savedRecipeId);

    removeRecipe = (id: string, savedRecipeId: string): Promise<CollectionResponse> =>
        this.collections.removeRecipe(id, savedRecipeId);
}