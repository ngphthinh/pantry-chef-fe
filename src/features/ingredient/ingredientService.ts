import { ApiError } from "@/core/http/apiError";
import type {
  CursorResponse,
  IngredientCategoryRequest,
  IngredientCategoryResponse,
  IngredientCreateRequest,
  IngredientResponse,
  IngredientUpdateRequest,
} from "@/types";
import type {
  IIngredientAdminApi,
  IIngredientApi,
  IIngredientCategoryAdminApi,
  IIngredientCategoryApi,
  IngredientQuery,
} from "./types";
import { ingredientValidators } from "./validation";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50; // BE cắt về 50 nếu lớn hơn

export class IngredientService {
  constructor(
    private readonly ingredients: IIngredientApi,
    private readonly ingredientAdmin: IIngredientAdminApi,
    private readonly categories: IIngredientCategoryApi,
    private readonly categoryAdmin: IIngredientCategoryAdminApi,
  ) {}

  // ───────── Nguyên liệu ─────────

  search = (
    query: IngredientQuery = {},
  ): Promise<CursorResponse<IngredientResponse>> =>
    this.ingredients.search({
      q: query.q?.trim() || undefined,
      categoryId: query.categoryId,
      cursor: query.cursor,
      size: Math.min(
        Math.max(query.size ?? DEFAULT_PAGE_SIZE, 1),
        MAX_PAGE_SIZE,
      ),
    });

  getById = (id: string): Promise<IngredientResponse> =>
    this.ingredients.getById(id);

  /** Kiểm tra định dạng trước khi gọi API; 404 đổi thành thông điệp dễ hiểu cho người dùng. */
  getByBarcode = async (code: string): Promise<IngredientResponse> => {
    const invalid = ingredientValidators.barcode(code);
    if (invalid) throw new Error(invalid);

    try {
      return await this.ingredients.getByBarcode(code.trim());
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        throw new Error("Chưa có nguyên liệu nào khớp mã vạch này.");
      }
      throw error;
    }
  };

  /** Chỉ ADMIN. */
  create = (body: IngredientCreateRequest): Promise<IngredientResponse> =>
    this.ingredientAdmin.create(this.normalize(body));

  /** Chỉ ADMIN. PUT thay thế toàn bộ nên luôn gửi đủ các trường. */
  update = (
    id: string,
    body: IngredientUpdateRequest,
  ): Promise<IngredientResponse> =>
    this.ingredientAdmin.update(id, this.normalize(body));

  /** Chỉ ADMIN. */
  remove = (id: string): Promise<void> => this.ingredientAdmin.remove(id);

  // ───────── Nhóm nguyên liệu ─────────

  /** BE đã sắp sẵn (nhóm mới thêm lên đầu, "Khác" luôn cuối) nên giữ nguyên thứ tự. */
  listCategories = (): Promise<IngredientCategoryResponse[]> =>
    this.categories.list();

  /** Chỉ ADMIN. `code` luôn UPPER_CASE theo ràng buộc của BE; trùng mã thì BE trả 409. */
  createCategory = (
    body: IngredientCategoryRequest,
  ): Promise<IngredientCategoryResponse> =>
    this.translateCategoryError(
      () => this.categoryAdmin.create(this.normalizeCategory(body)),
      "Mã danh mục này đã tồn tại.",
    );

  updateCategory = (
    id: string,
    body: IngredientCategoryRequest,
  ): Promise<IngredientCategoryResponse> =>
    this.translateCategoryError(
      () => this.categoryAdmin.update(id, this.normalizeCategory(body)),
      "Mã danh mục này đã tồn tại.",
    );

  /** Chỉ ADMIN. BE trả 409 khi nhóm còn nguyên liệu. */
  removeCategory = (id: string): Promise<void> =>
    this.translateCategoryError(
      () => this.categoryAdmin.remove(id),
      "Danh mục này vẫn còn nguyên liệu nên chưa thể xoá.",
    );

  /** 403 / 404 / 409 của nhóm nguyên liệu đổi thành thông điệp tiếng Việt; lỗi khác giữ nguyên. */
  private translateCategoryError = async <T>(
    run: () => Promise<T>,
    conflictMessage: string,
  ): Promise<T> => {
    try {
      return await run();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 403)
          throw new Error("Chỉ quản trị viên mới thực hiện được thao tác này.");
        if (error.status === 404)
          throw new Error(
            "Không tìm thấy danh mục. Danh sách có thể đã thay đổi, hãy tải lại.",
          );
        if (error.status === 409) throw new Error(conflictMessage);
      }
      throw error;
    }
  };

  private normalize = (
    body: IngredientCreateRequest,
  ): IngredientCreateRequest => ({
    ...body,
    name: body.name.trim(),
    barcode: body.barcode?.trim() || undefined,
  });

  private normalizeCategory = (
    body: IngredientCategoryRequest,
  ): IngredientCategoryRequest => ({
    code: body.code.trim().toUpperCase(),
    name: body.name.trim(),
  });
}
