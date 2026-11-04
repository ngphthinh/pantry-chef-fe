/**
 * Typography Token System
 * Định nghĩa kích thước, độ đậm, khoảng cách dòng và các biến thể chữ chuẩn.
 */

import type { TextStyle } from 'react-native';

export const fontSizes = {
  '3xs': 10,
  '2xs': 11,
  xs: 12,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

export const fontWeights: Record<string, TextStyle['fontWeight']> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
} as const;

export const textVariants = {
  title: {
    fontSize: fontSizes['3xl'],
    lineHeight: 38,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.5,
  },
  heading: {
    fontSize: fontSizes.lg,
    lineHeight: 24,
    fontWeight: fontWeights.bold,
    letterSpacing: -0.2,
  },
  subheading: {
    fontSize: fontSizes.md,
    lineHeight: 22,
    fontWeight: fontWeights.semibold,
  },
  body: {
    fontSize: fontSizes.base,
    lineHeight: 22,
    fontWeight: fontWeights.regular,
  },
  bodyStrong: {
    fontSize: fontSizes.base,
    lineHeight: 22,
    fontWeight: fontWeights.semibold,
  },
  caption: {
    fontSize: fontSizes.sm,
    lineHeight: 18,
    fontWeight: fontWeights.regular,
  },
  label: {
    fontSize: fontSizes.xs,
    lineHeight: 16,
    fontWeight: fontWeights.semibold,
    letterSpacing: 0.5,
  },
  button: {
    fontSize: fontSizes.md,
    lineHeight: 20,
    fontWeight: fontWeights.bold,
    letterSpacing: 0.3,
  },
} as const;

export const typography = {
  sizes: fontSizes,
  weights: fontWeights,
  variants: textVariants,
} as const;

export type Typography = typeof typography;
export type TextVariant = keyof typeof textVariants;

