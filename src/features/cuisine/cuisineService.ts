import type { CuisineRequest, CuisineResponse } from "@/types";
import type { ICuisineAdminApi, ICuisineApi } from "./types";

export class CuisineService {
  constructor(
    private readonly cuisines: ICuisineApi,
    private readonly admin: ICuisineAdminApi,
  ) {}

  /** Sắp theo tên để danh sách chọn ẩm thực luôn ổn định. */
  list = async (): Promise<CuisineResponse[]> => {
    const items = await this.cuisines.list();
    return [...items].sort((a, b) => a.name.localeCompare(b.name, "vi"));
  };

  /** `code` luôn UPPER_CASE theo ràng buộc của BE. */
  create = (body: CuisineRequest): Promise<CuisineResponse> =>
    this.admin.create(this.normalize(body));

  update = (id: string, body: CuisineRequest): Promise<CuisineResponse> =>
    this.admin.update(id, this.normalize(body));

  remove = (id: string): Promise<void> => this.admin.remove(id);

  private normalize = (body: CuisineRequest): CuisineRequest => ({
    code: body.code.trim().toUpperCase(),
    name: body.name.trim(),
  });
}