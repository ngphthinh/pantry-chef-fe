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

// export const customRecipeValidators = {
//   title: (v: string) => {
//     const text = v.trim();
//     if (!text) return "Vui lòng nhập tên món";
//     return text.length <= TITLE_MAX ? null : `Tên món tối đa ${TITLE_MAX} ký tự`;
//   },
//   servings: (v: string) => {
//     const n = parseInteger(v);
//     return n !== null && n >= 1 && n <= 100 ? null : "Khẩu phần từ 1 đến 100";
//   },
//   /** Tuỳ chọn: để trống là hợp lệ, nếu nhập thì phải là số nguyên > 0. */
//   readyInMinutes: (v: string) => {
//     if (v.trim() === "") return null;
//     const n = parseInteger(v);
//     return n !== null && n > 0 ? null : "Thời gian phải là số phút lớn hơn 0";
//   },
//   /** Dòng bỏ trống tên được coi là dòng thừa và bị bỏ qua; cần còn ít nhất một dòng. */
//   ingredients: (rows: IngredientDraft[]) => {
//     const filled = rows.filter((r) => r.name.trim());
//     if (filled.length === 0) return "Cần ít nhất một nguyên liệu";
//     for (const row of filled) {
//       if (row.amount.trim() === "") continue;
//       const n = parseDecimal(row.amount);
//       if (n === null || n <= 0) return `Số lượng của “${row.name.trim()}” phải lớn hơn 0`;
//     }
//     return null;
//   },
//   /** Dòng bỏ trống nội dung bị bỏ qua; cần còn ít nhất một bước. */
//   steps: (rows: StepDraft[]) => {
//     const filled = rows.filter((r) => r.text.trim());
//     if (filled.length === 0) return "Cần ít nhất một bước làm";
//     for (const [index, row] of filled.entries()) {
//       if (row.timerMinutes.trim() === "") continue;
//       const n = parseDecimal(row.timerMinutes);
//       if (n === null || n <= 0) return `Thời gian hẹn giờ của bước ${index + 1} phải lớn hơn 0`;
//     }
//     return null;
//   },
// };
const MAX_TITLE = 255;
const MAX_NAME = 255;
const MAX_STEP_TEXT = 5000;
const MIN_SERVINGS = 1;
const MAX_SERVINGS = 100;

const toNumber = (v: string): number => Number(v.trim().replace(',', '.'));
const isPositive = (n: number) => Number.isFinite(n) && n > 0;

/** Mỗi hàm trả `null` nếu hợp lệ, hoặc chuỗi thông báo lỗi (khớp luật của server). */
export const customRecipeValidators = {
  title: (v: string) => {
    if (!v.trim()) return 'Vui lòng nhập tên món';
    return v.trim().length > MAX_TITLE ? `Tên món tối đa ${MAX_TITLE} ký tự` : null;
  },
  servings: (v: string) => {
    const n = toNumber(v);
    return Number.isInteger(n) && n >= MIN_SERVINGS && n <= MAX_SERVINGS
      ? null
      : `Khẩu phần từ ${MIN_SERVINGS} đến ${MAX_SERVINGS}`;
  },
  readyInMinutes: (v: string) => {
    if (!v.trim()) return null;
    const n = toNumber(v);
    return Number.isInteger(n) && n > 0 ? null : 'Thời gian phải là số phút lớn hơn 0';
  },
  ingredientName: (v: string) => {
    if (!v.trim()) return 'Vui lòng nhập tên nguyên liệu';
    return v.trim().length > MAX_NAME ? `Tên nguyên liệu tối đa ${MAX_NAME} ký tự` : null;
  },
  ingredientAmount: (v: string) => (!v.trim() || isPositive(toNumber(v)) ? null : 'Số lượng phải lớn hơn 0'),
  stepText: (v: string) => {
    if (!v.trim()) return 'Vui lòng nhập nội dung bước';
    return v.trim().length > MAX_STEP_TEXT ? `Nội dung bước tối đa ${MAX_STEP_TEXT} ký tự` : null;
  },
  stepTimerMinutes: (v: string) => (!v.trim() || isPositive(toNumber(v)) ? null : 'Thời gian đếm giờ phải lớn hơn 0'),
};

export const parseNumber = toNumber;
