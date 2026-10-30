import { parseDecimal } from "@/core/format/decimal";

const NAME_MAX = 255;

const requiredName = (label: string) => (v: string) => {
  const text = v.trim();
  if (!text) return `Vui lòng nhập ${label}`;
  return text.length <= NAME_MAX ? null : `Tối đa ${NAME_MAX} ký tự`;
};

export const shoppingValidators = {
  listName: requiredName("tên danh sách"),
  itemName: requiredName("tên mục"),
  /** Tuỳ chọn: để trống là hợp lệ, nếu nhập thì phải > 0. */
  quantity: (v: string) => {
    if (v.trim() === "") return null;
    const n = parseDecimal(v);
    return n !== null && n > 0 ? null : "Số lượng phải lớn hơn 0";
  },
};
