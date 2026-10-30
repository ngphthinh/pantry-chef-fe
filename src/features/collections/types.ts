import type {
  CollectionCreateRequest,
  CollectionResponse,
  CollectionResponseDetail,
  CollectionUpdateRequest,
} from "@/types";

export interface ICollectionApi {
  list(): Promise<CollectionResponse[]>;
  create(body: CollectionCreateRequest): Promise<CollectionResponse>;
  update(
    id: string,
    body: CollectionUpdateRequest,
  ): Promise<CollectionResponse>;
  remove(id: string): Promise<void>;
  addRecipe(id: string, savedRecipeId: string): Promise<CollectionResponse>;
  removeRecipe(id: string, savedRecipeId: string): Promise<CollectionResponse>;
  getById(id: string): Promise<CollectionResponseDetail>;
}
