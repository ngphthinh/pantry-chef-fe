import { ingredientService } from "@/core/di/container";
import type { IngredientResponse, Unit } from "@/types";

export interface CatalogIngredient {
  id: string;
  name: string;
  defaultUnit?: Unit | null;
}

export interface NewIngredientInput {
  name: string;
  nameEn?: string;
  defaultUnit?: Unit;
}

const toCatalog = (r: IngredientResponse): CatalogIngredient => ({
  id: String(r.id),
  name: r.name,
  defaultUnit: r.defaultUnit,
});

// BE: "Khác" luôn cuối danh sách. Cache để không gọi lại mỗi lần tạo.
let fallbackCategoryId: Promise<string> | null = null;
const getFallbackCategoryId = () => {
  fallbackCategoryId ??= ingredientService
    .listCategories()
    .then((list) => {
      if (list.length === 0)
        throw new Error("Chưa có danh mục nguyên liệu nào.");
      return String(list[list.length - 1].id);
    })
    .catch((e) => {
      fallbackCategoryId = null; // cho phép thử lại
      throw e;
    });
  return fallbackCategoryId;
};
export const ingredientCatalog = {
  async search(keyword: string): Promise<CatalogIngredient[]> {
    const page = await ingredientService.search({ q: keyword, size: 10 });
    return (page.content ?? []).map(toCatalog);
  },

  /** Tạo nhiều nguyên liệu mới trong 1 request; kết quả cùng thứ tự với đầu vào. */
  async createBatch(
    inputs: NewIngredientInput[],
  ): Promise<CatalogIngredient[]> {
    if (inputs.length === 0) return [];
    const categoryId = await getFallbackCategoryId();
    const created = await ingredientService.createBatch(
      inputs.map((i) => ({
        name: i.name,
        defaultUnit: i.defaultUnit,
        categoryId, // GIẢ ĐỊNH tên field
      })) as any,
    );
    return created.map(toCatalog);
  },
};
