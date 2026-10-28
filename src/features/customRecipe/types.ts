import type {
  CursorResponse,
  PickedImage,
  RecipeCreateRequest,
  RecipeDetailResponse,
  RecipeSummaryResponse,
  RecipeUpdateRequest,
} from '@/types';

/** `cursor` ở đây là UUID của món cuối trang trước (khác với cursor offset của công thức ngoài). */
export interface CustomRecipeQuery {
  cursor?: string | null;
  size?: number;
}

export interface ICustomRecipeApi {
  list(query: CustomRecipeQuery): Promise<CursorResponse<RecipeSummaryResponse>>;
  create(body: RecipeCreateRequest): Promise<RecipeDetailResponse>;
  getById(id: string): Promise<RecipeDetailResponse>;
  update(id: string, body: RecipeUpdateRequest): Promise<RecipeDetailResponse>;
  remove(id: string): Promise<void>;
  uploadImage(id: string, image: PickedImage): Promise<RecipeDetailResponse>;
}
