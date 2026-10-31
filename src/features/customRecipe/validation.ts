import { parseDecimal, parseInteger } from "@/core/format/decimal";

const MAX_TITLE = 255;
const MAX_NAME = 255;
const MAX_STEP_TEXT = 5000;
const MIN_SERVINGS = 1;
const MAX_SERVINGS = 100;

export interface IngredientDraft {
  name: string;
  amount: string;
}
export interface StepDraft {
  text: string;
  timerMinutes: string;
}

/** Mỗi hàm trả `null` nếu hợp lệ, hoặc chuỗi thông báo lỗi (khớp luật của server). */
const title = (v: string) => {
  if (!v.trim()) return "Vui lòng nhập tên món";
  return v.trim().length > MAX_TITLE ? `Tên món tối đa ${MAX_TITLE} ký tự` : null;
};

const servings = (v: string) => {
  const n = parseInteger(v);
  return n !== null && n >= MIN_SERVINGS && n <= MAX_SERVINGS
    ? null
    : `Khẩu phần từ ${MIN_SERVINGS} đến ${MAX_SERVINGS}`;
};

const readyInMinutes = (v: string) => {
  if (!v.trim()) return null;
  const n = parseInteger(v);
  return n !== null && n > 0 ? null : "Thời gian phải là số phút lớn hơn 0";
};

const ingredientName = (v: string) => {
  if (!v.trim()) return "Vui lòng nhập tên nguyên liệu";
  return v.trim().length > MAX_NAME ? `Tên nguyên liệu tối đa ${MAX_NAME} ký tự` : null;
};

const ingredientAmount = (v: string) => {
  if (!v.trim()) return null;
  const n = parseDecimal(v);
  return n !== null && n > 0 ? null : "Số lượng phải lớn hơn 0";
};

const stepText = (v: string) => {
  if (!v.trim()) return "Vui lòng nhập nội dung bước";
  return v.trim().length > MAX_STEP_TEXT ? `Nội dung bước tối đa ${MAX_STEP_TEXT} ký tự` : null;
};

const stepTimerMinutes = (v: string) => {
  if (!v.trim()) return null;
  const n = parseDecimal(v);
  return n !== null && n > 0 ? null : "Thời gian đếm giờ phải lớn hơn 0";
};

/** Dòng bỏ trống tên bị bỏ qua; cần còn ít nhất một dòng. */
const ingredients = (rows: IngredientDraft[]) => {
  const filled = rows.filter((r) => r.name.trim());
  if (filled.length === 0) return "Cần ít nhất một nguyên liệu";
  for (const row of filled) {
    const err = ingredientName(row.name) ?? ingredientAmount(row.amount);
    if (err) return `“${row.name.trim()}”: ${err}`;
  }
  return null;
};

/** Dòng bỏ trống nội dung bị bỏ qua; cần còn ít nhất một bước. */
const steps = (rows: StepDraft[]) => {
  const filled = rows.filter((r) => r.text.trim());
  if (filled.length === 0) return "Cần ít nhất một bước làm";
  for (const [index, row] of filled.entries()) {
    const err = stepText(row.text) ?? stepTimerMinutes(row.timerMinutes);
    if (err) return `Bước ${index + 1}: ${err}`;
  }
  return null;
};

export const customRecipeValidators = {
  title,
  servings,
  readyInMinutes,
  ingredientName,
  ingredientAmount,
  stepText,
  stepTimerMinutes,
  ingredients,
  steps,
};