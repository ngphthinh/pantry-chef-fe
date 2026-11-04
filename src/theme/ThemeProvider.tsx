/**
 * ThemeProvider
 * Đồng bộ 100% hai chiều giữa Redux store, NativeWind và Theme Token System.
 * Đảm bảo KHÔNG BAO GIỜ bị lệch pha giữa class Tailwind (dark:...) và style của component (colors.surface).
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setThemeMode as setReduxThemeMode } from '@/core/theme/themeSlice';
import { lightTheme, darkTheme, type AppTheme, type ThemeMode } from './theme';

export interface ThemeContextValue {
  theme: AppTheme;
  themeMode: ThemeMode;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((s) => s.theme.mode);
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      dispatch(setReduxThemeMode(mode));
      setColorScheme(mode);
    },
    [dispatch, setColorScheme],
  );

  // isDark đồng bộ tuyệt đối theo colorScheme của NativeWind
  const isDark = colorScheme === 'dark';

  const theme: AppTheme = useMemo(() => {
    return isDark ? darkTheme : lightTheme;
  }, [isDark]);

  const contextValue: ThemeContextValue = useMemo(
    () => ({
      theme,
      themeMode,
      isDark,
      setThemeMode,
    }),
    [theme, themeMode, isDark, setThemeMode],
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}
