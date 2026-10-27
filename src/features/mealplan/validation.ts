export const mealPlanValidators = {
  date: (value?: string | null): string | null => {
    if (!value || !value.trim()) return 'Vui lòng chọn ngày';
    return null;
  },

  mealType: (value?: string | null): string | null => {
    if (!value || !value.trim()) return 'Vui lòng chọn loại bữa ăn';
    return null;
  },

  servings: (value?: number | string | null): string | null => {
    if (value === undefined || value === null || value === '') return null;
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      return 'Số khẩu phần phải lớn hơn 0';
    }
    return null;
  },
};
