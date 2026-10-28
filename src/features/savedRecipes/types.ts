// features/savedRecipes/types.ts
import type {
    CursorResponse,
    SavedRecipeCreateRequest,
    SavedRecipeDetailResponse,
    SavedRecipeQuery,
    SavedRecipeResponse,
    SavedRecipeUpdateRequest,
} from "@/types";

export interface ISavedRecipeApi {
    list(query: SavedRecipeQuery): Promise<CursorResponse<SavedRecipeResponse>>;
    get(id: string): Promise<SavedRecipeDetailResponse>;
    create(body: SavedRecipeCreateRequest): Promise<SavedRecipeResponse>;
    update(id: string, body: SavedRecipeUpdateRequest): Promise<SavedRecipeResponse>;
    remove(id: string): Promise<void>;
}