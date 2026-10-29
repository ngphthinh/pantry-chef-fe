const CODE_MAX = 50;
const NAME_MAX = 100;

/** Mỗi hàm trả `null` nếu hợp lệ, hoặc chuỗi thông báo lỗi (khớp luật của BE). */
export const cuisineValidators = {
  code: (v: string) => {
    const code = v.trim();
    if (!code) return "Vui lòng nhập mã";
    if (code.length > CODE_MAX) return `Mã tối đa ${CODE_MAX} ký tự`;
    return /^[A-Z0-9_]+$/.test(code) ? null : "Mã chỉ gồm chữ in hoa không dấu, chữ số và dấu gạch dưới";
  },
  name: (v: string) => {
    const name = v.trim();
    if (!name) return "Vui lòng nhập tên";
    return name.length <= NAME_MAX ? null : `Tên tối đa ${NAME_MAX} ký tự`;
  },
};
