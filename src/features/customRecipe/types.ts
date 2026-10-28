import type {
  CursorResponse,
  PickedImage,
  RecipeCreateRequest,
  RecipeDetailResponse,
  RecipeSummaryResponse,
  RecipeUpdateRequest,
} from "@/types";

export interface CustomRecipeQuery {
  /** `nextCursor` của trang trước (UUID). */
  cursor?: string;
  /** Tối đa 50. */
  size?: number;
}

/** Kết quả lưu công thức: công thức đã lưu và việc ảnh có tải lên được không. */
export interface SaveRecipeResult {
  recipe: RecipeDetailResponse;
  /** true nếu công thức đã lưu nhưng ảnh tải lên thất bại. */
  imageFailed: boolean;
}

export interface ICustomRecipeApi {
  getRecipes(query: CustomRecipeQuery): Promise<CursorResponse<RecipeSummaryResponse>>;
  getRecipe(id: string): Promise<RecipeDetailResponse>;
  createRecipe(body: RecipeCreateRequest): Promise<RecipeDetailResponse>;
  /** PUT thay toàn bộ nguyên liệu và các bước. */
  updateRecipe(id: string, body: RecipeUpdateRequest): Promise<RecipeDetailResponse>;
  removeRecipe(id: string): Promise<void>;
}

export interface ICustomRecipeImageApi {
  uploadImage(id: string, image: PickedImage): Promise<RecipeDetailResponse>;
}
