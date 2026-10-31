import type { Difficulty, RecipeSummaryResponse, Unit } from '@/types';

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  EASY: 'Dễ',
  MEDIUM: 'Vừa',
  HARD: 'Khó',
};

const UNIT_LABELS: Record<Unit, string> = {
  MG: 'mg',
  G: 'g',
  KG: 'kg',
  ML: 'ml',
  L: 'l',
  PCS: '',
  TBSP: 'muỗng canh',
  TSP: 'muỗng cà phê',
  CUP: 'cốc',
  PINCH: 'nhúm',
};

/** Các lựa chọn của bộ lọc ở màn kết quả (undefined = không lọc). */
export const DIFFICULTY_OPTIONS: (Difficulty | undefined)[] = [undefined, 'EASY', 'MEDIUM', 'HARD'];
export const MAX_MINUTES_OPTIONS: (number | undefined)[] = [undefined, 15, 30, 60];

const SECONDS_PER_MINUTE = 60;
const AMOUNT_DECIMALS = 100;
const PERCENT = 100;

export const difficultyLabel = (difficulty: Difficulty | null | undefined): string | null =>
  difficulty ? DIFFICULTY_LABELS[difficulty] : null;

/** "45 phút · Vừa · 2 khẩu phần", bỏ qua phần không có dữ liệu. */
export function recipeMetaLabel(recipe: {
  readyInMinutes: number | null;
  difficulty: Difficulty | null;
  servings: number | null;
}): string {
  return [
    recipe.readyInMinutes ? `${recipe.readyInMinutes} phút` : null,
    difficultyLabel(recipe.difficulty),
    recipe.servings ? `${recipe.servings} khẩu phần` : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

/** "Khớp 3/4 nguyên liệu (75%)"; null khi kết quả không đến từ tìm theo nguyên liệu. */
export function recipeMatchLabel(recipe: RecipeSummaryResponse): string | null {
  const used = recipe.usedIngredientCount;
  const missed = recipe.missedIngredientCount;
  if (used === null || missed === null || recipe.matchScore === null) return null;
  return `Khớp ${used}/${used + missed} nguyên liệu (${Math.round(recipe.matchScore * PERCENT)}%)`;
}

/** "500 g", "2 muỗng canh", "3" (đếm cái), "" nếu "vừa đủ". */
export function formatIngredientAmount(amount: number | null, unit: Unit | null): string {
  if (amount === null) return '';
  const rounded = Math.round(amount * AMOUNT_DECIMALS) / AMOUNT_DECIMALS;
  const unitLabel = unit ? UNIT_LABELS[unit] : '';
  return unitLabel ? `${rounded} ${unitLabel}` : String(rounded);
}

/** 125 -> "02:05" */
export function formatTimer(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / SECONDS_PER_MINUTE);
  const seconds = safe % SECONDS_PER_MINUTE;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Màn hình chi tiết phù hợp với một dòng danh sách:
 * có externalId -> chi tiết công thức ngoài (kể cả món seed đã lưu); công thức tự tạo -> màn của custom recipe.
 */
export function recipeHref(recipe: RecipeSummaryResponse): string | null {
  return recipe.externalId ? `/recipe/external/${encodeURIComponent(recipe.externalId)}` : null;
}

export const recipeKey = (recipe: RecipeSummaryResponse, index: number): string =>
  recipe.id ?? recipe.externalId ?? `${recipe.title}-${index}`;
