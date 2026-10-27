export const pantryValidators = {
  ingredientId: (value?: string | null): string | null => {
    if (!value || !value.trim()) return 'Vui lòng chọn nguyên liệu';
    return null;
  },

  quantity: (value?: number | string | null): string | null => {
    if (value === undefined || value === null || value === '') {
      return 'Vui lòng nhập số lượng';
    }
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      return 'Số lượng phải lớn hơn 0';
    }
    return null;
  },

  unit: (value?: string | null): string | null => {
    if (!value || !value.trim()) return 'Vui lòng chọn đơn vị';
    return null;
  },

  consumeQuantity: (value: number | string, currentQuantity: number): string | null => {
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      return 'Số lượng dùng phải lớn hơn 0';
    }
    if (num > currentQuantity) {
      return `Không thể dùng quá số lượng hiện có (${currentQuantity})`;
    }
    return null;
  },

  expiryDate: (value?: string | null): string | null => {
    if (!value || !value.trim()) return null;
    const parts = value.trim().split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) {
      return 'Định dạng ngày không hợp lệ (YYYY-MM-DD)';
    }
    const [y, m, d] = parts;
    const expiry = new Date(y, m - 1, d, 23, 59, 59);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (expiry.getTime() < today.getTime()) {
      return 'Hạn sử dụng không được nhỏ hơn ngày hiện tại';
    }
    return null;
  },
};
