/** Đọc số thập phân người dùng gõ ("1,5" hoặc "1.5"). Rỗng hoặc không phải số thì trả null. */
export function parseDecimal(text: string): number | null {
  const normalized = text.trim().replace(",", ".");
  if (normalized === "") return null;
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

/** Đọc số nguyên người dùng gõ. Rỗng hoặc không phải số nguyên thì trả null. */
export function parseInteger(text: string): number | null {
  const value = parseDecimal(text);
  return value !== null && Number.isInteger(value) ? value : null;
}

/** Làm tròn tối đa 2 chữ số thập phân để hiển thị ("2.5", "3"). */
export function formatDecimal(value: number): string {
  return String(Math.round(value * 100) / 100);
}
