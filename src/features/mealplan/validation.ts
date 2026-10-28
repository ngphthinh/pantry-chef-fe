const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const UUID_REGEX = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
const VALID_MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER'];

export const mealPlanValidators = {
  /**
   * date: @Column(nullable = false) private LocalDate date;
   * Bắt buộc có ngày và đúng định dạng YYYY-MM-DD
   */
  date: (value?: string | null): string | null => {
    if (!value || !value.trim()) {
      return 'Vui lòng chọn ngày cho bữa ăn (không được để trống)';
    }
    const trimmed = value.trim();
    if (!ISO_DATE_REGEX.test(trimmed)) {
      return 'Định dạng ngày không hợp lệ (YYYY-MM-DD)';
    }
    const [year, month, day] = trimmed.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    if (
      dateObj.getFullYear() !== year ||
      dateObj.getMonth() !== month - 1 ||
      dateObj.getDate() !== day
    ) {
      return 'Ngày tháng năm không tồn tại';
    }
    return null;
  },

  /**
   * mealType: @Column(nullable = false) private MealType mealType;
   * Bắt buộc phải là 1 trong: BREAKFAST, LUNCH, DINNER
   */
  mealType: (value?: string | null): string | null => {
    if (!value || !value.trim()) {
      return 'Vui lòng chọn loại bữa ăn (Sáng, Trưa hoặc Tối)';
    }
    if (!VALID_MEAL_TYPES.includes(value.trim())) {
      return 'Loại bữa ăn không hợp lệ (BREAKFAST, LUNCH, DINNER)';
    }
    return null;
  },

  /**
   * servings: private Integer servings; (nullable = true)
   * Có thể để trống hoặc null, nhưng nếu nhập thì phải là số nguyên dương > 0
   */
  servings: (value?: number | string | null): string | null => {
    if (value === undefined || value === null || String(value).trim() === '') {
      return null;
    }
    const num = Number(value);
    if (isNaN(num)) {
      return 'Số khẩu phần phải là số hợp lệ';
    }
    if (!Number.isInteger(num)) {
      return 'Số khẩu phần phải là số nguyên';
    }
    if (num <= 0) {
      return 'Số khẩu phần phải lớn hơn 0';
    }
    if (num > 100) {
      return 'Số khẩu phần không vượt quá 100 người';
    }
    return null;
  },

  /**
   * recipe: Bắt buộc chọn công thức món ăn (phải có recipeId và đúng định dạng UUID)
   */
  recipeId: (value?: string | null): string | null => {
    if (!value || !value.trim()) {
      return 'Vui lòng chọn một công thức món ăn';
    }
    if (!UUID_REGEX.test(value.trim())) {
      return 'Mã công thức (recipeId) không đúng định dạng UUID';
    }
    return null;
  },
};
