import type { AxiosInstance } from 'axios';

import { buildImageForm } from '@/core/http/multipart';
import type {
  CursorResponse,
  PickedImage,
  RecipeCreateRequest,
  RecipeDetailResponse,
  RecipeSummaryResponse,
  RecipeUpdateRequest,
} from '@/types';
import type { CustomRecipeQuery, ICustomRecipeApi } from './types';

const BASE = '/v1/recipes/custom';
const UPLOAD_TIMEOUT_MS = 60000;

export class HttpCustomRecipeRepository implements ICustomRecipeApi {
  constructor(private readonly privateHttp: AxiosInstance) {}

  list = async (query: CustomRecipeQuery = {}): Promise<CursorResponse<RecipeSummaryResponse>> => {
    const params: Record<string, string | number> = {};
    if (query.cursor) params.cursor = query.cursor;
    if (query.size) params.size = query.size;
    const { data } = await this.privateHttp.get<CursorResponse<RecipeSummaryResponse>>(BASE, { params });
    return data;
  };

  create = async (body: RecipeCreateRequest): Promise<RecipeDetailResponse> => {
    const { data } = await this.privateHttp.post<RecipeDetailResponse>(BASE, body);
    return data;
  };

  getById = async (id: string): Promise<RecipeDetailResponse> => {
    const { data } = await this.privateHttp.get<RecipeDetailResponse>(`${BASE}/${id}`);
    return data;
  };

  update = async (id: string, body: RecipeUpdateRequest): Promise<RecipeDetailResponse> => {
    const { data } = await this.privateHttp.put<RecipeDetailResponse>(`${BASE}/${id}`, body);
    return data;
  };

  remove = async (id: string): Promise<void> => {
    await this.privateHttp.delete(`${BASE}/${id}`);
  };

  uploadImage = async (id: string, image: PickedImage): Promise<RecipeDetailResponse> => {
    const form = await buildImageForm('image', image, 'recipe.jpg');
    const { data } = await this.privateHttp.post<RecipeDetailResponse>(`${BASE}/${id}/image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: UPLOAD_TIMEOUT_MS,
    });
    return data;
  };
}
