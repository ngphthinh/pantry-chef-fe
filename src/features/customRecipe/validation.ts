import { parseDecimal, parseInteger } from "@/core/format/decimal";

const TITLE_MAX = 255;

export interface IngredientDraft {
  name: string;
  amount: string;
}
export interface StepDraft {
  text: string;
  timerMinutes: string;
}

export const customRecipeValidators = {
  title: (v: string) => {
    const text = v.trim();
    if (!text) return "Vui lòng nhập tên món";
    return text.length <= TITLE_MAX ? null : `Tên món tối đa ${TITLE_MAX} ký tự`;
  },
  servings: (v: string) => {
    const n = parseInteger(v);
    return n !== null && n >= 1 && n <= 100 ? null : "Khẩu phần từ 1 đến 100";
  },
  /** Tuỳ chọn: để trống là hợp lệ, nếu nhập thì phải là số nguyên > 0. */
  readyInMinutes: (v: string) => {
    if (v.trim() === "") return null;
    const n = parseInteger(v);
    return n !== null && n > 0 ? null : "Thời gian phải là số phút lớn hơn 0";
  },
  /** Dòng bỏ trống tên được coi là dòng thừa và bị bỏ qua; cần còn ít nhất một dòng. */
  ingredients: (rows: IngredientDraft[]) => {
    const filled = rows.filter((r) => r.name.trim());
    if (filled.length === 0) return "Cần ít nhất một nguyên liệu";
    for (const row of filled) {
      if (row.amount.trim() === "") continue;
      const n = parseDecimal(row.amount);
      if (n === null || n <= 0) return `Số lượng của “${row.name.trim()}” phải lớn hơn 0`;
    }
    return null;
  },
  /** Dòng bỏ trống nội dung bị bỏ qua; cần còn ít nhất một bước. */
  steps: (rows: StepDraft[]) => {
    const filled = rows.filter((r) => r.text.trim());
    if (filled.length === 0) return "Cần ít nhất một bước làm";
    for (const [index, row] of filled.entries()) {
      if (row.timerMinutes.trim() === "") continue;
      const n = parseDecimal(row.timerMinutes);
      if (n === null || n <= 0) return `Thời gian hẹn giờ của bước ${index + 1} phải lớn hơn 0`;
    }
    return null;
  },
};
