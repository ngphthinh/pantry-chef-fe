/** Mã vạch EAN-8, UPC-A, EAN-13, ITF-14: 8 đến 14 chữ số (khớp ràng buộc của BE). */
export const BARCODE_PATTERN = /^\d{8,14}$/;

export const ingredientValidators = {
  barcode: (value: string): string | null => {
    const code = value.trim();
    if (!code) return "Vui lòng nhập mã vạch";
    if (!BARCODE_PATTERN.test(code)) return "Mã vạch phải gồm 8–14 chữ số";
    return null;
  },
};
