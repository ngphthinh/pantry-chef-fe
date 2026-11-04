/**
 * Tầng 2+: Theme Definition
 * Kết hợp colors, spacing, radius, typography và shadows thành đối tượng AppTheme hoàn chỉnh.
 */

import { lightColors, darkColors, type AppColors } from './colors';
import { spacing, type Spacing } from './spacing';
import { radius, type Radius } from './radius';
import { typography, type Typography } from './typography';
import { shadows, type ShadowName } from './shadows';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface AppTheme {
  readonly mode: 'light' | 'dark';
  readonly isDark: boolean;
  readonly colors: AppColors;
  readonly spacing: typeof spacing;
  readonly radius: typeof radius;
  readonly typography: typeof typography;
  readonly shadows: typeof shadows;
}

export const lightTheme: AppTheme = {
  mode: 'light',
  isDark: false,
  colors: lightColors,
  spacing,
  radius,
  typography,
  shadows,
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  isDark: true,
  colors: darkColors,
  spacing,
  radius,
  typography,
  shadows,
};

/**
 * Định dạng Theme tương thích chuẩn React Navigation / Expo Router ThemeProvider.
 */
export interface NavigationTheme {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    border: string;
    notification: string;
  };
}

/**
 * Ánh xạ an toàn kiểu từ AppTheme sang NavigationTheme của React Navigation / Expo Router.
 */
export function toNavigationTheme(theme: AppTheme): NavigationTheme {
  return {
    dark: theme.isDark,
    colors: {
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.textPrimary,
      border: theme.colors.border,
      notification: theme.colors.accent,
    },
  };
}

