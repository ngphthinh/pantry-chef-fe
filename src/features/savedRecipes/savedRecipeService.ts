import type {
    CursorResponse,
    SavedRecipeCreateRequest,
    SavedRecipeDetailResponse,
    SavedRecipeResponse,
    SavedRecipeUpdateRequest,
    SavedRecipeQuery
} from "@/types";
import type { ISavedRecipeApi } from "./types";

export class SavedRecipeService {
    constructor(private readonly savedRecipes: ISavedRecipeApi) {}

    list = (query: SavedRecipeQuery): Promise<CursorResponse<SavedRecipeResponse>> =>
        this.savedRecipes.list(query);

    get = (id: string): Promise<SavedRecipeDetailResponse> => this.savedRecipes.get(id);

    create = (body: SavedRecipeCreateRequest): Promise<SavedRecipeResponse> =>
        this.savedRecipes.create(body);

    update = (id: string, body: SavedRecipeUpdateRequest): Promise<SavedRecipeResponse> =>
        this.savedRecipes.update(id, body);

    remove = (id: string): Promise<void> => this.savedRecipes.remove(id);

    /** Đảo trạng thái yêu thích của một món đã lưu. */
    toggleFavorite = (
        item: Pick<SavedRecipeResponse, "id" | "favorite">,
    ): Promise<SavedRecipeResponse> =>
        this.savedRecipes.update(item.id, { favorite: !item.favorite });
}