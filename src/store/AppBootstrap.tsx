import { useEffect, type ReactNode } from 'react';
import { useColorScheme } from 'nativewind';
import { unauthorizedEvent } from '@/core/events/emitter';
import { loadThemeMode } from '@/core/theme/themeSlice';
import { handleUnauthorized, restoreSession } from '@/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from './hooks';

/** Thay cho AppThemeProvider + AuthProvider: khởi tạo state lúc mở app. */
export function AppBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((s) => s.theme.mode);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    void dispatch(restoreSession());
    void dispatch(loadThemeMode());
  }, [dispatch]);

  // 401 từ HTTP layer -> xoá phiên
  useEffect(() => unauthorizedEvent.on(() => dispatch(handleUnauthorized())), [dispatch]);

  // Đồng bộ mode trong store sang NativeWind
  useEffect(() => {
    setColorScheme(mode);
  }, [mode, setColorScheme]);

  return <>{children}</>;
}
