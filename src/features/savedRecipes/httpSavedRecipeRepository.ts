import type { AxiosInstance } from "axios";

import type {
    CursorResponse,
    SavedRecipeCreateRequest,
    SavedRecipeDetailResponse,
    SavedRecipeResponse,
    SavedRecipeUpdateRequest,
    SavedRecipeQuery
} from "@/types";
import type {ISavedRecipeApi } from "./types";

export class HttpSavedRecipeRepository implements ISavedRecipeApi {
    constructor(private readonly privateHttp: AxiosInstance) {}

    list = async (query: SavedRecipeQuery): Promise<CursorResponse<SavedRecipeResponse>> => {
        const { data } = await this.privateHttp.get<CursorResponse<SavedRecipeResponse>>(
            "/v1/saved-recipes",
            { params: query },
        );
        return data;
    };

    get = async (id: string): Promise<SavedRecipeDetailResponse> => {
        const { data } = await this.privateHttp.get<SavedRecipeDetailResponse>(
            `/v1/saved-recipes/${id}`,
        );
        return data;
    };

    create = async (body: SavedRecipeCreateRequest): Promise<SavedRecipeResponse> => {
        const { data } = await this.privateHttp.post<SavedRecipeResponse>("/v1/saved-recipes", body);
        return data;
    };

    update = async (id: string, body: SavedRecipeUpdateRequest): Promise<SavedRecipeResponse> => {
        const { data } = await this.privateHttp.patch<SavedRecipeResponse>(
            `/v1/saved-recipes/${id}`,
            body,
        );
        return data;
    };

    remove = async (id: string): Promise<void> => {
        await this.privateHttp.delete(`/v1/saved-recipes/${id}`);
    };
}