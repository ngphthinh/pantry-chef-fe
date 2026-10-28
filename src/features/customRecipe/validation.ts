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
