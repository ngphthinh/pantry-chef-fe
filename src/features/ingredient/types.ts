import type {
  CursorResponse,
  IngredientCategoryRequest,
  IngredientCategoryResponse,
  IngredientCreateRequest,
  IngredientResponse,
  IngredientUpdateRequest,
} from "@/types";

export interface IngredientQuery {
  /** Từ khoá, BE không phân biệt hoa thường và dấu ("ca chua" ra "Cà chua"). */
  q?: string;
  categoryId?: string;
  cursor?: string;
  /** Mặc định 20, tối đa 50. */
  size?: number;
}

export interface IIngredientApi {
  search(query: IngredientQuery): Promise<CursorResponse<IngredientResponse>>;
  getById(id: string): Promise<IngredientResponse>;
  getByBarcode(code: string): Promise<IngredientResponse>;
}

/** Chỉ ADMIN mới gọi được. */
export interface IIngredientAdminApi {
  create(body: IngredientCreateRequest): Promise<IngredientResponse>;
  update(id: string, body: IngredientUpdateRequest): Promise<IngredientResponse>;
  remove(id: string): Promise<void>;
}

export interface IIngredientCategoryApi {
  /** Công khai, không cần đăng nhập. */
  list(): Promise<IngredientCategoryResponse[]>;
}

/** Chỉ ADMIN mới gọi được. */
export interface IIngredientCategoryAdminApi {
  create(body: IngredientCategoryRequest): Promise<IngredientCategoryResponse>;
  update(id: string, body: IngredientCategoryRequest): Promise<IngredientCategoryResponse>;
  remove(id: string): Promise<void>;
}

/** Nguyên liệu được chọn, trả về cho màn hình gọi (pantry/new, pantry/scan-review...). */
export interface PickedIngredient {
  ingredientId: string;
  ingredientName: string;
  /** BE cho phép nguyên liệu không có đơn vị mặc định; màn hình nhận tự chọn đơn vị khi null. */
  defaultUnit: string | null;
}
