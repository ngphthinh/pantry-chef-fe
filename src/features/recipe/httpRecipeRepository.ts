import type { AxiosInstance } from 'axios';
import type {
  CursorResponse,
  RecipeDetailResponse,
  RecipeSummaryResponse,
} from '@/types';
import type { IRecipeApi, RecipeByNameParams, RecipeSearchParams } from './types';

export class HttpRecipeRepository implements IRecipeApi {
  constructor(private readonly privateHttp: AxiosInstance) {}

  search = async (params: RecipeSearchParams): Promise<CursorResponse<RecipeSummaryResponse>> => {
    const { data } = await this.privateHttp.get<CursorResponse<RecipeSummaryResponse>>(
      '/v1/recipes/search',
      {
        params,
        paramsSerializer: {
          indexes: null, // serializes array as ingredients=x&ingredients=y
        },
      },
    );
    return data;
  };

  suggestions = async (params?: {
    cursor?: string;
    size?: number;
  }): Promise<CursorResponse<RecipeSummaryResponse>> => {
    const { data } = await this.privateHttp.get<CursorResponse<RecipeSummaryResponse>>(
      '/v1/recipes/suggestions',
      { params },
    );
    return data;
  };

  getDetail = async (externalId: string): Promise<RecipeDetailResponse> => {
    const { data } = await this.privateHttp.get<RecipeDetailResponse>(
      `/v1/recipes/${encodeURIComponent(externalId)}`,
    );
    return data;
  };

  getByName = async (params: RecipeByNameParams): Promise<CursorResponse<RecipeSummaryResponse>> => {
    const { data } = await this.privateHttp.get<CursorResponse<RecipeSummaryResponse>>(
      '/v1/recipes/by-name',
      { params },
    );
    return data;
  };

  getRandom = async (count: number = 5): Promise<RecipeSummaryResponse[]> => {
    const { data } = await this.privateHttp.get<RecipeSummaryResponse[]>(
      '/v1/recipes/random',
      { params: { count } },
    );
    return data;
  };

  getPopular = async (params?: {
    cursor?: string;
    size?: number;
  }): Promise<CursorResponse<RecipeSummaryResponse>> => {
    const { data } = await this.privateHttp.get<CursorResponse<RecipeSummaryResponse>>(
      '/v1/recipes/popular',
      { params },
    );
    return data;
  };

  getSimilar = async (externalId: string): Promise<RecipeSummaryResponse[]> => {
    const { data } = await this.privateHttp.get<RecipeSummaryResponse[]>(
      `/v1/recipes/${encodeURIComponent(externalId)}/similar`,
    );
    return data;
  };

  scale = async (externalId: string, servings: number): Promise<RecipeDetailResponse> => {
    const { data } = await this.privateHttp.get<RecipeDetailResponse>(
      `/v1/recipes/${encodeURIComponent(externalId)}/scale`,
      { params: { servings } },
    );
    return data;
  };

  getCustomList = async (params?: {
    cursor?: string;
    size?: number;
  }): Promise<CursorResponse<RecipeSummaryResponse>> => {
    const { data } = await this.privateHttp.get<CursorResponse<RecipeSummaryResponse>>(
      '/v1/recipes/custom',
      { params },
    );
    return data;
  };

  getCustomDetail = async (id: string): Promise<RecipeDetailResponse> => {
    const { data } = await this.privateHttp.get<RecipeDetailResponse>(
      `/v1/recipes/custom/${encodeURIComponent(id)}`,
    );
    return data;
  };
}
