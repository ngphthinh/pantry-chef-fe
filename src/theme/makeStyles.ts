/**
 * makeStyles Helper
 * Tạo StyleSheet gắn liền với theme hiện tại, tự động tối ưu hóa qua useMemo.
 * Ngăn chặn tạo object style mới ở mỗi lần render.
 */

import { useMemo } from 'react';
import { StyleSheet, type ImageStyle, type TextStyle, type ViewStyle } from 'react-native';
import { useTheme } from './useTheme';
import type { AppTheme } from './theme';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export function makeStyles<T extends NamedStyles<T>>(
  stylesFactory: (theme: AppTheme) => T,
): () => T {
  return function useStyles(): T {
    const theme = useTheme();

    return useMemo(() => {
      return StyleSheet.create(stylesFactory(theme));
    }, [theme]);
  };
}

