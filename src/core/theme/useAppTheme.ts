import { useCallback, useMemo } from 'react';
import { useColorScheme } from 'nativewind';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import colors from './colors';
import { setThemeMode, type ThemeMode } from './themeSlice';

export type { ThemeMode };

export function useAppTheme() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.theme.mode);
  const { colorScheme } = useColorScheme();

  const setMode = useCallback((next: ThemeMode) => dispatch(setThemeMode(next)), [dispatch]);

  return useMemo(() => {
    const isDark = colorScheme === 'dark';
    return {
      mode,
      isDark,
      palette: isDark ? colors.dark : colors.light,
      brand: colors.brand.DEFAULT,
      setMode,
    };
  }, [mode, colorScheme, setMode]);
}
