import { Difficulty } from "@/types";

export interface DifficultyOption {
  value: Difficulty;
  label: string;
}

export const DIFFICULTY_OPTIONS: readonly DifficultyOption[] = [
  { value: Difficulty.EASY, label: "Dễ" },
  { value: Difficulty.MEDIUM, label: "Vừa" },
  { value: Difficulty.HARD, label: "Khó" },
];

export const difficultyLabel = (difficulty: Difficulty): string =>
  DIFFICULTY_OPTIONS.find((o) => o.value === difficulty)?.label ?? difficulty;
