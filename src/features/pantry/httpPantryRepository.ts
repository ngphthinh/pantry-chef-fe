import type { AxiosInstance } from 'axios';
import { Platform } from 'react-native';

import type {
  CursorResponse,
  PantryItemBatchCreateRequest,
  PantryItemCreateRequest,
  PantryItemResponse,
  PantryItemUpdateRequest,
  PickedImage,
} from '@/types';
import type { IPantryApi, PantryQuery } from './types';

export class HttpPantryRepository implements IPantryApi {
  constructor(private readonly privateHttp: AxiosInstance) {}

  list = async (query: PantryQuery = {}): Promise<CursorResponse<PantryItemResponse>> => {
    const params = {
      ...query,
      keyword: query.keyword ?? '',
    };
    const { data } = await this.privateHttp.get<CursorResponse<PantryItemResponse>>(
      '/v1/pantry-items',
      { params },
    );
    return data;
  };

  create = async (body: PantryItemCreateRequest): Promise<PantryItemResponse> => {
    const { data } = await this.privateHttp.post<PantryItemResponse>('/v1/pantry-items', body);
    return data;
  };

  createBatch = async (
    body: PantryItemBatchCreateRequest,
  ): Promise<PantryItemResponse[]> => {
    const { data } = await this.privateHttp.post<PantryItemResponse[]>(
      '/v1/pantry-items/batch',
      body,
    );
    return data;
  };

  getById = async (id: string): Promise<PantryItemResponse> => {
    const { data } = await this.privateHttp.get<PantryItemResponse>(`/v1/pantry-items/${id}`);
    return data;
  };

  update = async (
    id: string,
    body: PantryItemUpdateRequest,
  ): Promise<PantryItemResponse> => {
    const { data } = await this.privateHttp.put<PantryItemResponse>(
      `/v1/pantry-items/${id}`,
      body,
    );
    return data;
  };

  consume = async (id: string, quantity: number): Promise<PantryItemResponse> => {
    const { data } = await this.privateHttp.post<PantryItemResponse>(
      `/v1/pantry-items/${id}/consume`,
      { quantity },
    );
    return data;
  };

  remove = async (id: string): Promise<void> => {
    await this.privateHttp.delete(`/v1/pantry-items/${id}`);
  };

  uploadPhoto = async (id: string, image: PickedImage): Promise<PantryItemResponse> => {
    const name = image.fileName ?? 'pantry-item.jpg';
    const type = image.mimeType ?? 'image/jpeg';
    const form = new FormData();

    if (Platform.OS === 'web') {
      const blob = await (await fetch(image.uri)).blob();
      form.append('image', blob, name);
    } else {
      form.append('image', { uri: image.uri, name, type } as unknown as Blob);
    }

    const { data } = await this.privateHttp.post<PantryItemResponse>(
      `/v1/pantry-items/${id}/photo`,
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      },
    );
    return data;
  };

  expiring = async (days = 3): Promise<PantryItemResponse[]> => {
    const { data } = await this.privateHttp.get<PantryItemResponse[]>(
      '/v1/pantry-items/expiring',
      { params: { days } },
    );
    return data;
  };
}
