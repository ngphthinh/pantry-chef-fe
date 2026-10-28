import type {
  CursorResponse,
  PickedImage,
  RecipeCreateRequest,
  RecipeDetailResponse,
  RecipeSummaryResponse,
  RecipeUpdateRequest,
} from '@/types';
import type { CustomRecipeQuery, ICustomRecipeApi } from './types';

/** Cắt khoảng trắng thừa để server không nhận dữ liệu như "  Thịt  ". */
function normalize<T extends RecipeCreateRequest>(body: T): T {
  return {
    ...body,
    title: body.title.trim(),
    ingredients: body.ingredients.map((i) => ({ ...i, name: i.name.trim() })),
    steps: body.steps.map((s) => ({ ...s, text: s.text.trim() })),
  };
}

export class CustomRecipeService {
  constructor(private readonly recipes: ICustomRecipeApi) {}

  list = (query: CustomRecipeQuery = {}): Promise<CursorResponse<RecipeSummaryResponse>> =>
    this.recipes.list(query);

  create = (body: RecipeCreateRequest): Promise<RecipeDetailResponse> =>
    this.recipes.create(normalize(body));

  getById = (id: string): Promise<RecipeDetailResponse> => this.recipes.getById(id);

  /** PUT thay toàn bộ: phải gửi đủ nguyên liệu và các bước. */
  update = (id: string, body: RecipeUpdateRequest): Promise<RecipeDetailResponse> =>
    this.recipes.update(id, normalize(body));

  remove = (id: string): Promise<void> => this.recipes.remove(id);

  uploadImage = (id: string, image: PickedImage): Promise<RecipeDetailResponse> =>
    this.recipes.uploadImage(id, image);
}
