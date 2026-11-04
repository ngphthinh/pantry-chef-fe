/**
 * Spacing Token System
 * Quy chuẩn khoảng cách 4pt/8pt grid.
 */

export const spacing = {
  none: 0,
  '3xs': 2,
  '2xs': 4,
  xs: 6,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
} as const;

export type Spacing = keyof typeof spacing;
export type SpacingValue = (typeof spacing)[Spacing];

