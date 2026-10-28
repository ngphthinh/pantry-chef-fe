import { parseDecimal } from "@/core/format/decimal";

export const unitValidators = {
  value: (v: string) => {
    const n = parseDecimal(v);
    if (n === null) return "Vui lòng nhập một số";
    return n >= 0 ? null : "Giá trị phải lớn hơn hoặc bằng 0";
  },
};
