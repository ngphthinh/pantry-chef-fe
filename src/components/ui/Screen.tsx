import React, { type ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import { AppScreen } from './AppScreen';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  className?: string;
  style?: ViewStyle;
}

export function Screen({ children, scroll = true, style }: ScreenProps) {
  return (
    <AppScreen scroll={scroll} style={style}>
      {children}
    </AppScreen>
  );
}
