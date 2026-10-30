/** Mã vạch EAN-8, UPC-A, EAN-13, ITF-14: 8 đến 14 chữ số (khớp ràng buộc của BE). */
export const BARCODE_PATTERN = /^\d{8,14}$/;

/** Khớp ràng buộc của BE: bắt đầu bằng chữ, chữ HOA / số / gạch dưới, dài 2–50 ký tự. */
const CATEGORY_CODE_PATTERN = /^[A-Z][A-Z0-9_]{1,49}$/;
const MAX_NAME_LENGTH = 255;

export const ingredientValidators = {
  categoryCode: (value: string): string | null => {
    const code = value.trim().toUpperCase();
    if (!code) return "Vui lòng nhập mã danh mục";
    if (!CATEGORY_CODE_PATTERN.test(code)) {
      return "Mã phải bắt đầu bằng chữ, chỉ gồm chữ, số hoặc dấu _ (2–50 ký tự)";
    }
    return null;
  },

  categoryName: (value: string): string | null => {
    const name = value.trim();
    if (!name) return "Vui lòng nhập tên danh mục";
    if (name.length > MAX_NAME_LENGTH)
      return `Tên tối đa ${MAX_NAME_LENGTH} ký tự`;
    return null;
  },

  barcode: (value: string): string | null => {
    const code = value.trim();
    if (!code) return "Vui lòng nhập mã vạch";
    if (!BARCODE_PATTERN.test(code)) return "Mã vạch phải gồm 8–14 chữ số";
    return null;
  },
};
