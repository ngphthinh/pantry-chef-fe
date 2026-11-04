import { useMemo } from 'react';
import { useTheme } from '@/theme';
import colors from './colors';
import type { ThemeMode } from './themeSlice';

export type { ThemeMode };

/**
 * useAppTheme Bridge
 * Chuyển tiếp hoàn toàn sang useTheme() từ @/theme, bảo đảm tính nhất quán 100%
 * giữa Redux, NativeWind và StyleSheet trên toàn ứng dụng.
 */
export function useAppTheme() {
  const theme = useTheme();

  return useMemo(() => {
    return {
      mode: theme.themeMode,
      isDark: theme.isDark,
      palette: theme.isDark ? colors.dark : colors.light,
      brand: theme.colors.primary,
      colors: theme.colors,
      theme,
      setMode: theme.setMode,
    };
  }, [theme]);
}
