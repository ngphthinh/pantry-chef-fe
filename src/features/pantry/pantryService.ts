import type {
  CursorResponse,
  PantryItemBatchCreateRequest,
  PantryItemCreateRequest,
  PantryItemResponse,
  PantryItemUpdateRequest,
  PickedImage,
} from '@/types';
import type { IPantryApi, PantryQuery } from './types';

export class PantryService {
  constructor(private readonly pantry: IPantryApi) {}

  list = (query: PantryQuery = {}): Promise<CursorResponse<PantryItemResponse>> =>
    this.pantry.list(query);

  create = (body: PantryItemCreateRequest): Promise<PantryItemResponse> =>
    this.pantry.create(body);

  createBatch = (body: PantryItemBatchCreateRequest): Promise<PantryItemResponse[]> =>
    this.pantry.createBatch(body);

  getById = (id: string): Promise<PantryItemResponse> => this.pantry.getById(id);

  update = (id: string, body: PantryItemUpdateRequest): Promise<PantryItemResponse> =>
    this.pantry.update(id, body);

  consume = (id: string, quantity: number): Promise<PantryItemResponse> =>
    this.pantry.consume(id, quantity);

  remove = (id: string): Promise<void> => this.pantry.remove(id);

  uploadPhoto = (id: string, image: PickedImage): Promise<PantryItemResponse> =>
    this.pantry.uploadPhoto(id, image);

  expiring = (days = 3): Promise<PantryItemResponse[]> => this.pantry.expiring(days);
}
