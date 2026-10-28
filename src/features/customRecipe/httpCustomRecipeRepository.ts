import type { AxiosInstance } from "axios";

import { buildImageForm } from "@/core/http/multipart";
import type {
  CursorResponse,
  PickedImage,
  RecipeCreateRequest,
  RecipeDetailResponse,
  RecipeSummaryResponse,
  RecipeUpdateRequest,
} from "@/types";
import type { CustomRecipeQuery, ICustomRecipeApi, ICustomRecipeImageApi } from "./types";

export class HttpCustomRecipeRepository implements ICustomRecipeApi, ICustomRecipeImageApi {
  constructor(private readonly privateHttp: AxiosInstance) {}

  getRecipes = async (query: CustomRecipeQuery): Promise<CursorResponse<RecipeSummaryResponse>> => {
    const { data } = await this.privateHttp.get<CursorResponse<RecipeSummaryResponse>>(
      "/v1/recipes/custom",
      { params: query },
    );
    return data;
  };

  getRecipe = async (id: string): Promise<RecipeDetailResponse> => {
    const { data } = await this.privateHttp.get<RecipeDetailResponse>(`/v1/recipes/custom/${id}`);
    return data;
  };

  createRecipe = async (body: RecipeCreateRequest): Promise<RecipeDetailResponse> => {
    const { data } = await this.privateHttp.post<RecipeDetailResponse>("/v1/recipes/custom", body);
    return data;
  };

  updateRecipe = async (id: string, body: RecipeUpdateRequest): Promise<RecipeDetailResponse> => {
    const { data } = await this.privateHttp.put<RecipeDetailResponse>(`/v1/recipes/custom/${id}`, body);
    return data;
  };

  removeRecipe = async (id: string): Promise<void> => {
    await this.privateHttp.delete(`/v1/recipes/custom/${id}`);
  };

  uploadImage = async (id: string, image: PickedImage): Promise<RecipeDetailResponse> => {
    const form = await buildImageForm("image", image, "recipe.jpg");
    const { data } = await this.privateHttp.post<RecipeDetailResponse>(
      `/v1/recipes/custom/${id}/image`,
      form,
      { headers: { "Content-Type": "multipart/form-data" }, timeout: 60000 },
    );
    return data;
  };
}
