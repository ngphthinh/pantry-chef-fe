/**
 * Enum của BE (org.group12.*.enums) dưới dạng const object + union type.
 * Giá trị JSON trả về/gửi đi chính là tên hằng (vd "PANTRY_SHELF").
 * Dùng được cả làm giá trị (Unit.KG) lẫn làm kiểu (Unit).
 */

export const Unit = {
  MG: 'MG', G: 'G', KG: 'KG', ML: 'ML', L: 'L',
  PCS: 'PCS', TBSP: 'TBSP', TSP: 'TSP', CUP: 'CUP', PINCH: 'PINCH',
} as const;
export type Unit = (typeof Unit)[keyof typeof Unit];

export const MediaType = { IMAGE: 'IMAGE', VIDEO: 'VIDEO', FILE: 'FILE', AUDIO: 'AUDIO' } as const;
export type MediaType = (typeof MediaType)[keyof typeof MediaType];

export const MeasurementSystem = { METRIC: 'METRIC', IMPERIAL: 'IMPERIAL' } as const;
export type MeasurementSystem = (typeof MeasurementSystem)[keyof typeof MeasurementSystem];

export const ThemeMode = { LIGHT: 'LIGHT', DARK: 'DARK', SYSTEM: 'SYSTEM' } as const;
export type ThemeMode = (typeof ThemeMode)[keyof typeof ThemeMode];

export const RoleName = { ROLE_USER: 'ROLE_USER', ROLE_ADMIN: 'ROLE_ADMIN' } as const;
export type RoleName = (typeof RoleName)[keyof typeof RoleName];

export const FeedbackType = { BUG: 'BUG', SUGGESTION: 'SUGGESTION', OTHER: 'OTHER' } as const;
export type FeedbackType = (typeof FeedbackType)[keyof typeof FeedbackType];

export const MealType = { BREAKFAST: 'BREAKFAST', LUNCH: 'LUNCH', DINNER: 'DINNER' } as const;
export type MealType = (typeof MealType)[keyof typeof MealType];

export const StorageLocation = { FRIDGE: 'FRIDGE', FREEZER: 'FREEZER', PANTRY_SHELF: 'PANTRY_SHELF' } as const;
export type StorageLocation = (typeof StorageLocation)[keyof typeof StorageLocation];

/** EASY ≤ 30 phút, MEDIUM ≤ 60 phút, HARD > 60 phút (BE suy ra từ readyInMinutes). */
export const Difficulty = { EASY: 'EASY', MEDIUM: 'MEDIUM', HARD: 'HARD' } as const;
export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

export const ShoppingItemStatus = { PENDING: 'PENDING', BOUGHT: 'BOUGHT' } as const;
export type ShoppingItemStatus = (typeof ShoppingItemStatus)[keyof typeof ShoppingItemStatus];
