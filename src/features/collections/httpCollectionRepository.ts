import type { AxiosInstance } from "axios";

import type {
    CollectionCreateRequest,
    CollectionResponse,
    CollectionUpdateRequest,
} from "@/types";
import type { ICollectionApi } from "./types";

export class HttpCollectionRepository implements ICollectionApi {
    constructor(private readonly privateHttp: AxiosInstance) {}

    list = async (): Promise<CollectionResponse[]> => {
        const { data } = await this.privateHttp.get<CollectionResponse[]>("/v1/collections");
        return data;
    };

    create = async (body: CollectionCreateRequest): Promise<CollectionResponse> => {
        const { data } = await this.privateHttp.post<CollectionResponse>("/v1/collections", body);
        return data;
    };

    update = async (id: string, body: CollectionUpdateRequest): Promise<CollectionResponse> => {
        const { data } = await this.privateHttp.put<CollectionResponse>(`/v1/collections/${id}`, body);
        return data;
    };

    remove = async (id: string): Promise<void> => {
        await this.privateHttp.delete(`/v1/collections/${id}`);
    };

    addRecipe = async (id: string, savedRecipeId: string): Promise<CollectionResponse> => {
        const { data } = await this.privateHttp.post<CollectionResponse>(
            `/v1/collections/${id}/recipes/${savedRecipeId}`,
        );
        return data;
    };

    removeRecipe = async (id: string, savedRecipeId: string): Promise<CollectionResponse> => {
        const { data } = await this.privateHttp.delete<CollectionResponse>(
            `/v1/collections/${id}/recipes/${savedRecipeId}`,
        );
        return data;
    };
}