import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { useTheme } from '@/theme';
import { cn } from './cn';

export function Card({
  className,
  style,
  children,
  ...props
}: ViewProps & { className?: string }) {
  const { colors, radius, shadows, isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          borderRadius: radius['2xl'],
          backgroundColor: colors.surface,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : colors.border,
          borderWidth: 1.2,
          shadowColor: isDark ? '#000000' : '#121C16',
          shadowOffset: { width: 0, height: isDark ? 2 : 3 },
          shadowOpacity: isDark ? 0.4 : 0.06,
          shadowRadius: isDark ? 8 : 10,
          elevation: isDark ? 4 : 2,
        },
        style,
      ]}
      className={cn(className)}
      {...props}
    >
      {/* Viền sáng mờ trên mép card tạo hiệu ứng 3D tinh tế trong Dark mode */}
      {isDark ? (
        <View
          pointerEvents="none"
          style={[
            styles.specularTop,
            {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderTopLeftRadius: radius['2xl'],
              borderTopRightRadius: radius['2xl'],
            },
          ]}
        />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    position: 'relative',
  },
  specularTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
});
