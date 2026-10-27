import type { AiRecipeIngredientItem } from "@/types";

const UNIT_LABELS: Record<string, string> = {
  MG: "mg",
  G: "g",
  KG: "kg",
  ML: "ml",
  L: "l",
  PCS: "cái",
  TBSP: "muỗng canh",
  TSP: "muỗng cà phê",
  CUP: "cốc",
  PINCH: "nhúm",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  EASY: "Dễ",
  MEDIUM: "Vừa",
  HARD: "Khó",
};

export const formatDifficulty = (difficulty?: string | null): string =>
  difficulty ? (DIFFICULTY_LABELS[difficulty] ?? difficulty) : "";

const formatAmount = (n: number): string =>
  Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100);

/**
 * "500 g Thịt ba chỉ", hoặc "Nước mắm (vừa đủ)" khi không có số lượng.
 * `unit` có thể là enum (G, KG...) hoặc chữ do AI tự sinh nên giữ nguyên nếu không có trong bảng.
 */
export function formatIngredient(ing: AiRecipeIngredientItem): string {
  if (ing.amount == null) return `${ing.name} (vừa đủ)`;
  const unit = ing.unit ? ` ${UNIT_LABELS[ing.unit] ?? ing.unit}` : "";
  return `${formatAmount(ing.amount)}${unit} ${ing.name}`;
}

export const formatTimer = (seconds: number): string =>
  `${Math.max(1, Math.round(seconds / 60))} phút`;
