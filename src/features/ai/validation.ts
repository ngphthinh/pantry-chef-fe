export const aiValidators = {
  limit: (v: string) => {
    const n = Number(v);
    return Number.isInteger(n) && n >= 1 && n <= 10
      ? null
      : "Số món phải từ 1 đến 10";
  },
  // Tuỳ chọn: để trống là hợp lệ
  maxMinutes: (v: string) => {
    if (!v.trim()) return null;
    const n = Number(v);
    return Number.isInteger(n) && n >= 5 && n <= 480
      ? null
      : "Thời gian nấu phải từ 5 đến 480 phút";
  },
};
