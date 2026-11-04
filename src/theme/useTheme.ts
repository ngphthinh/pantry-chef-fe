/**
 * useTheme Hook
 * Truy xuất theme và các hàm điều khiển theme. Ném lỗi rõ ràng nếu dùng ngoài ThemeProvider.
 */

import { useContext } from 'react';
import { ThemeContext, type ThemeContextValue } from './ThemeProvider';
import type { AppTheme, ThemeMode } from './theme';

export interface UseThemeReturn extends AppTheme {
  readonly themeMode: ThemeMode;
  readonly setMode: (mode: ThemeMode) => void;
  readonly isDark: boolean;
}

export function useTheme(): UseThemeReturn {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      '[ThemeSystem] useTheme() phải được sử dụng bên trong <ThemeProvider>. Hãy kiểm tra xem component có được bọc trong RootLayout hay không.',
    );
  }

  return {
    ...context.theme,
    themeMode: context.themeMode,
    setMode: context.setThemeMode,
    isDark: context.isDark,
  };
}

