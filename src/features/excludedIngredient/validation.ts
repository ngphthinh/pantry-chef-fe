const MAX_NAME_LENGTH = 255;

/** Gộp khoảng trắng thừa: "  Đậu   phộng " -> "Đậu phộng". */
export const cleanName = (value: string): string => value.trim().replace(/\s+/g, " ");

export const excludedIngredientValidators = {
  /** `existing` là danh sách hiện có, để báo trùng ngay (BE cũng trả 409 nếu trùng, không phân biệt hoa thường). */
  name: (value: string, existing: readonly { name: string }[] = []): string | null => {
    const name = cleanName(value);
    if (!name) return "Vui lòng nhập tên nguyên liệu";
    if (name.length > MAX_NAME_LENGTH) return `Tên tối đa ${MAX_NAME_LENGTH} ký tự`;
    const lower = name.toLowerCase();
    if (existing.some((item) => item.name.trim().toLowerCase() === lower)) {
      return "Nguyên liệu này đã có trong danh sách";
    }
    return null;
  },
};
