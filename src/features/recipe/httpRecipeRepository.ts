import type { AxiosInstance } from "axios";

import type {
  CursorResponse,
  RecipeDetailResponse,
  RecipeSummaryResponse,
} from "@/types";
import type {
  IRecipeApi,
  RecipeNameQuery,
  RecipePageQuery,
  RecipeSearchQuery,
} from "./types";

const BASE = "/v1/recipes";

/** Bỏ các tham số rỗng để không gửi `cursor=` hay `size=undefined` lên server. */
const compact = <T extends object>(params: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) => v !== undefined && v !== null && v !== "",
    ),
  ) as Partial<T>;

export class HttpRecipeRepository implements IRecipeApi {
  constructor(private readonly privateHttp: AxiosInstance) {}

  search = async (
    query: RecipeSearchQuery,
  ): Promise<CursorResponse<RecipeSummaryResponse>> => {
    const { data } = await this.privateHttp.get<
      CursorResponse<RecipeSummaryResponse>
    >(`${BASE}/search`, {
      params: compact(query),
      // axios mặc định gửi `ingredients[]=a`; server cần `ingredients=a&ingredients=b`
      paramsSerializer: { indexes: null },
    });
    return data;
  };

  suggestions = async (
    query: RecipePageQuery = {},
  ): Promise<CursorResponse<RecipeSummaryResponse>> => {
    const { data } = await this.privateHttp.get<
      CursorResponse<RecipeSummaryResponse>
    >(`${BASE}/suggestions`, { params: compact(query) });
    return data;
  };

  byName = async (
    query: RecipeNameQuery,
  ): Promise<CursorResponse<RecipeSummaryResponse>> => {
    const { data } = await this.privateHttp.get<
      CursorResponse<RecipeSummaryResponse>
    >(`${BASE}/by-name`, { params: compact(query) });
    return data;
  };

  random = async (count?: number): Promise<RecipeSummaryResponse[]> => {
    const { data } = await this.privateHttp.get<RecipeSummaryResponse[]>(
      `${BASE}/random`,
      {
        params: compact({ count }),
      },
    );
    return data;
  };

  getDetail = async (externalId: string): Promise<RecipeDetailResponse> => {
    const { data } = await this.privateHttp.get<RecipeDetailResponse>(
      `${BASE}/${encodeURIComponent(externalId)}`,
    );
    return data;
  };

  similar = async (externalId: string): Promise<RecipeSummaryResponse[]> => {
    const { data } = await this.privateHttp.get<RecipeSummaryResponse[]>(
      `${BASE}/${encodeURIComponent(externalId)}/similar`,
    );
    return data;
  };

  scale = async (
    externalId: string,
    servings: number,
  ): Promise<RecipeDetailResponse> => {
    const { data } = await this.privateHttp.get<RecipeDetailResponse>(
      `${BASE}/${encodeURIComponent(externalId)}/scale`,
      { params: { servings } },
    );
    return data;
  };
}
