import { formatDecimal } from "@/core/format/decimal";
import type { Difficulty } from "@/types";
import { difficultyLabel } from "./recipeDifficulty";

/** "45 phút · Vừa", bỏ qua phần nào không có. */
export function formatRecipeMeta(readyInMinutes: number | null, difficulty: Difficulty | null): string {
  return [
    readyInMinutes ? `${readyInMinutes} phút` : null,
    difficulty ? difficultyLabel(difficulty) : null,
  ]
    .filter(Boolean)
    .join(" · ");
}

/** 90 giây → "1.5 phút". */
export const formatTimer = (seconds: number | null): string =>
  seconds ? `${formatDecimal(seconds / 60)} phút` : "";
