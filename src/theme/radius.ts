/**
 * Radius Token System
 * Bo góc chuẩn mực tương thích giao diện 3D và thẻ Card của Login.
 */

export const radius = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,   // Chuẩn GlassInput3D
  '2xl': 20, // Chuẩn TactileButton
  '3xl': 24, // Chuẩn TiltCard3D
  full: 9999,
} as const;

export type Radius = keyof typeof radius;
export type RadiusValue = (typeof radius)[Radius];

