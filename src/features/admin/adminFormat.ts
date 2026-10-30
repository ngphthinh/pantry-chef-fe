export const FEEDBACK_TYPE_LABELS: Record<string, string> = {
  BUG: "Lỗi",
  SUGGESTION: "Đề xuất",
  OTHER: "Khác",
};

const pad = (n: number) => String(n).padStart(2, "0");

/** "28/10/2026 14:05" (giờ máy). Trả về chuỗi rỗng nếu không đọc được. */
export function formatDateTime(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback;
