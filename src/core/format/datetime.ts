/**
 * Múi giờ Việt Nam (UTC+7, không có giờ mùa hè nên cộng cố định là chính xác).
 * BE trả thời điểm theo UTC; mọi chỗ hiển thị giờ đều phải đi qua file này.
 */
const VN_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const HAS_ZONE = /(Z|[+-]\d{2}:?\d{2})$/i;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

type DateInput = string | number | Date | null | undefined;

const pad = (n: number) => String(n).padStart(2, "0");

/** Chuỗi/số/Date từ BE (UTC) → Date. Chuỗi có giờ nhưng thiếu múi giờ được coi là UTC. */
function parseUtc(value: DateInput): Date | null {
  if (value == null || value === "") return null;

  let date: Date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === "number") {
    date = new Date(value);
  } else {
    const v = value.trim().replace(" ", "T");
    if (!v || DATE_ONLY.test(v)) return null; // ngày thuần: xử lý riêng, không đổi múi giờ
    date = new Date(HAS_ZONE.test(v) ? v : `${v}Z`);
  }

  return Number.isNaN(date.getTime()) ? null : date;
}

/** Date đã cộng 7 giờ: đọc bằng getUTC*() sẽ ra giờ Việt Nam. */
const shiftToVn = (d: Date) => new Date(d.getTime() + VN_OFFSET_MS);

const isDateOnly = (value: DateInput): value is string =>
  typeof value === "string" && DATE_ONLY.test(value.trim());

/** "28/10/2026". Ngày thuần (YYYY-MM-DD) được giữ nguyên, không bị dịch giờ. */
export function formatDate(value: DateInput): string {
  if (isDateOnly(value)) {
    const [y, m, d] = value.trim().split("-");
    return `${d}/${m}/${y}`;
  }

  const utc = parseUtc(value);
  if (!utc) return "";

  const v = shiftToVn(utc);
  return `${pad(v.getUTCDate())}/${pad(v.getUTCMonth() + 1)}/${v.getUTCFullYear()}`;
}

/** "14:05" theo giờ Việt Nam. */
export function formatTime(value: DateInput): string {
  const utc = parseUtc(value);
  if (!utc) return "";

  const v = shiftToVn(utc);
  return `${pad(v.getUTCHours())}:${pad(v.getUTCMinutes())}`;
}

/** "28/10/2026 14:05" theo giờ Việt Nam. Chuỗi rỗng nếu không đọc được. */
export function formatDateTime(value: DateInput): string {
  if (isDateOnly(value)) return formatDate(value);

  const date = formatDate(value);
  return date ? `${date} ${formatTime(value)}` : "";
}

/** Ngày hôm nay theo giờ Việt Nam, dạng YYYY-MM-DD. */
export function todayVn(now: Date = new Date()): string {
  const v = shiftToVn(now);
  return `${v.getUTCFullYear()}-${pad(v.getUTCMonth() + 1)}-${pad(v.getUTCDate())}`;
}

/** Số ngày từ hôm nay (giờ VN) tới ngày YYYY-MM-DD. Âm nghĩa là đã qua. Dùng cho "Còn 2 ngày". */
export function daysUntil(date: string, now: Date = new Date()): number {
  const target = Date.parse(`${date.trim()}T00:00:00Z`);
  const today = Date.parse(`${todayVn(now)}T00:00:00Z`);
  return Math.round((target - today) / DAY_MS);
}

/**
 * 00:00 giờ Việt Nam của ngày YYYY-MM-DD → chuỗi UTC ISO để GỬI LÊN BE
 * (ví dụ "2026-10-26" → "2026-10-25T17:00:00.000Z").
 * Chỉ dùng khi BE cần Instant; xác nhận với BE trước khi áp dụng cho `weekStart`.
 */
export function vnStartOfDayToUtcIso(date: string): string {
  return new Date(
    Date.parse(`${date.trim()}T00:00:00Z`) - VN_OFFSET_MS,
  ).toISOString();
}

export const toIsoDate = (date: string): string => {
  const [day, month, year] = date.split("-");
  return `${year}-${month}-${day}`;
};

export const toDisplayDate = (date: string): string => {
  const [year, month, day] = date.split("-");
  return `${day}-${month}-${year}`;
};