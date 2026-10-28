import type {
  CursorResponse,
  PickedImage,
  RecipeCreateRequest,
  RecipeDetailResponse,
  RecipeSummaryResponse,
  RecipeUpdateRequest,
} from "@/types";
import type {
  CustomRecipeQuery,
  ICustomRecipeApi,
  ICustomRecipeImageApi,
  SaveRecipeResult,
} from "./types";

export class CustomRecipeService {
  constructor(
    private readonly recipes: ICustomRecipeApi,
    private readonly images: ICustomRecipeImageApi,
  ) {}

  getRecipes = (
    query: CustomRecipeQuery,
  ): Promise<CursorResponse<RecipeSummaryResponse>> =>
    this.recipes.getRecipes(query);

  getRecipe = (id: string): Promise<RecipeDetailResponse> =>
    this.recipes.getRecipe(id);

  removeRecipe = (id: string): Promise<void> => this.recipes.removeRecipe(id);

  /** Tạo công thức rồi (nếu có) tải ảnh lên. */
  async createRecipe(
    body: RecipeCreateRequest,
    image?: PickedImage | null,
  ): Promise<SaveRecipeResult> {
    const recipe = await this.recipes.createRecipe(body);
    return this.attachImage(recipe, image);
  }

  /** Thay toàn bộ công thức rồi (nếu có ảnh mới) tải ảnh lên. */
  async updateRecipe(
    id: string,
    body: RecipeUpdateRequest,
    image?: PickedImage | null,
  ): Promise<SaveRecipeResult> {
    const recipe = await this.recipes.updateRecipe(id, body);
    return this.attachImage(recipe, image);
  }

  /**
   * Ảnh là bước thứ hai nên có thể hỏng riêng. Công thức đã được lưu rồi, nếu ném lỗi thì người dùng
   * bấm lưu lại sẽ tạo trùng công thức. Vì vậy chỉ báo `imageFailed` để giao diện nhắc tải lại ảnh.
   */
  private attachImage = async (
    recipe: RecipeDetailResponse,
    image?: PickedImage | null,
  ): Promise<SaveRecipeResult> => {
    if (!image) return { recipe, imageFailed: false };
    try {
      return {
        recipe: await this.images.uploadImage(recipe.id, image),
        imageFailed: false,
      };
    } catch {
      return { recipe, imageFailed: true };
    }
  };
}

// create = (body: RecipeCreateRequest): Promise<RecipeDetailResponse> =>
//   this.recipes.create(normalize(body));

/** PUT thay toàn bộ: phải gửi đủ nguyên liệu và các bước. */
// update = (
//   id: string,
//   body: RecipeUpdateRequest,
// ): Promise<RecipeDetailResponse> => this.recipes.update(id, normalize(body));

// remove = (id: string): Promise<void> => this.recipes.remove(id);

// uploadImage = (
//   id: string,
//   image: PickedImage,
// ): Promise<RecipeDetailResponse> => this.recipes.uploadImage(id, image);

/** Cắt khoảng trắng thừa để server không nhận dữ liệu như "  Thịt  ". */
function normalize<T extends RecipeCreateRequest>(body: T): T {
  return {
    ...body,
    title: body.title.trim(),
    ingredients: body.ingredients.map((i) => ({ ...i, name: i.name.trim() })),
    steps: body.steps.map((s) => ({ ...s, text: s.text.trim() })),
  };
}
