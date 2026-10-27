import type { AiMealPlanEntry, AiMealPlanResponse, MealType } from "@/types";

const WEEKDAYS = [
  "Chủ nhật",
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
];
const DAY_MS = 86_400_000;

export const MEAL_LABEL: Record<MealType, string> = {
  BREAKFAST: "Bữa sáng",
  LUNCH: "Bữa trưa",
  DINNER: "Bữa tối",
};
const MEAL_ORDER: Record<MealType, number> = {
  BREAKFAST: 0,
  LUNCH: 1,
  DINNER: 2,
};

const pad = (n: number) => String(n).padStart(2, "0");
const formatShort = (d: Date) =>
  `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}`;

function parseDay(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Ngày hôm nay (theo thiết bị) dạng "YYYY-MM-DD". */
export function todayKey(now = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** "YYYY-MM-DD" → Instant ISO-8601 (00:00 UTC), đúng định dạng AiMealPlanRequest.weekStart. */
export const toWeekStart = (dateKey: string): string =>
  `${dateKey}T00:00:00.000Z`;

/** Vd "Thứ ba 27/10 → Chủ nhật 01/11". */
export function formatRange(startDate: string, days: number): string {
  const start = parseDay(startDate);
  const end = new Date(start.getTime() + (days - 1) * DAY_MS);
  const fmt = (d: Date) => `${WEEKDAYS[d.getUTCDay()]} ${formatShort(d)}`;
  return days === 1 ? fmt(start) : `${fmt(start)} → ${fmt(end)}`;
}
export interface DayGroup {
  date: string;
  title: string;
  items: { index: number; entry: AiMealPlanEntry }[];
}

/** Gom entries theo ngày, sắp theo sáng → trưa → tối. `index` là vị trí trong draft.entries (để xoá). */
export function groupDraftByDay(draft: AiMealPlanResponse): DayGroup[] {
  const groups = new Map<string, DayGroup>();

  draft.entries.forEach((entry, index) => {
    const date = entry.date.slice(0, 10);
    const day = parseDay(date);
    const group = groups.get(date) ?? {
      date,
      title: `${WEEKDAYS[day.getUTCDay()]}, ${formatShort(day)}`,
      items: [],
    };
    group.items.push({ index, entry });
    groups.set(date, group);
  });

  return [...groups.values()]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((g) => ({
      ...g,
      items: g.items.sort(
        (x, y) => MEAL_ORDER[x.entry.mealType] - MEAL_ORDER[y.entry.mealType],
      ),
    }));
}
