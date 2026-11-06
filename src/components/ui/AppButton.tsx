import React, { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme';
import { AppText } from './AppText';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'soft-pink' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * Nút bấm chuẩn AppButton:
 * Hỗ trợ các variant chuẩn mực, hiệu ứng active scale/opacity, shadow glow, và quản lý loading state.
 * Áp dụng cấu trúc bọc View bên trong Pressable để tương thích 100% với React Native Web & NativeWind v4.
 */
export function AppButton({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  onPress,
  style,
  ...props
}: AppButtonProps) {
  const { colors, radius, shadows, spacing, isDark } = useTheme();
  const inactive = disabled || loading;

  const sizeHeights = {
    sm: 38,
    md: 48,
    lg: 54,
  };

  const getVariantStyles = (pressed: boolean) => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: pressed ? colors.primaryPressed : colors.primary,
          borderColor: colors.primary,
          borderWidth: 1.2,
          textColor: '#FFFFFF',
          shadow: shadows.sm,
        };
      case 'secondary':
        return {
          backgroundColor: pressed
            ? isDark
              ? 'rgba(255, 255, 255, 0.12)'
              : '#E2ECE5'
            : isDark
              ? 'rgba(16, 185, 129, 0.16)'
              : '#E8F5EE',
          borderColor: isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(46, 125, 79, 0.25)',
          borderWidth: 1.2,
          textColor: colors.primary,
          shadow: shadows.none,
        };
      case 'accent':
        return {
          backgroundColor: pressed
            ? isDark
              ? '#D97706'
              : '#C2410C'
            : isDark
              ? '#F59E0B'
              : '#EA580C',
          borderColor: isDark ? '#F59E0B' : '#EA580C',
          borderWidth: 1.2,
          textColor: '#FFFFFF',
          shadow: shadows.sm,
        };
      case 'soft-pink':
        return {
          backgroundColor: pressed
            ? isDark
              ? 'rgba(244, 114, 182, 0.28)'
              : '#FBCFE8'
            : isDark
              ? 'rgba(244, 114, 182, 0.18)'
              : '#FCE7F3',
          borderColor: isDark ? 'rgba(244, 114, 182, 0.45)' : '#F472B6',
          borderWidth: 1.2,
          textColor: isDark ? '#F472B6' : '#BE185D',
          shadow: shadows.none,
        };
      case 'outline':
        return {
          backgroundColor: pressed
            ? isDark
              ? 'rgba(255, 255, 255, 0.08)'
              : '#F0F5F2'
            : isDark
              ? 'rgba(255, 255, 255, 0.04)'
              : '#FFFFFF',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.18)' : '#D1DCD4',
          borderWidth: 1.2,
          textColor: colors.textPrimary,
          shadow: shadows.none,
        };
      case 'ghost':
        return {
          backgroundColor: pressed
            ? isDark
              ? 'rgba(255, 255, 255, 0.08)'
              : '#F0F5F2'
            : 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
          textColor: colors.textPrimary,
          shadow: shadows.none,
        };
      case 'danger':
        return {
          backgroundColor: pressed ? '#DC2626' : '#EF4444',
          borderColor: '#EF4444',
          borderWidth: 1.2,
          textColor: '#FFFFFF',
          shadow: shadows.sm,
        };
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={inactive}
      style={[styles.pressable, style]}
      {...props}>
      {({ pressed }) => {
        const v = getVariantStyles(pressed);
        return (
          <View
            style={[
              styles.base,
              {
                height: sizeHeights[size],
                backgroundColor: v.backgroundColor,
                borderColor: v.borderColor,
                borderWidth: v.borderWidth,
                borderRadius: radius.full,
                paddingHorizontal: size === 'sm' ? spacing.md : spacing.xl,
                opacity: inactive ? 0.6 : 1,
                transform: [{ scale: pressed && !inactive ? 0.98 : 1 }],
              },
              v.shadow,
            ]}>
            <View style={styles.contentRow}>
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color={v.textColor}
                  style={styles.spinner}
                />
              ) : null}

              {!loading && iconLeft ? (
                <View style={styles.iconLeft}>{iconLeft}</View>
              ) : null}

              <AppText
                style={[
                  styles.label,
                  {
                    color: v.textColor,
                    fontSize: size === 'sm' ? 13 : size === 'lg' ? 16 : 15,
                    fontWeight: '700',
                  },
                ]}>
                {title}
              </AppText>

              {!loading && iconRight ? (
                <View style={styles.iconRight}>{iconRight}</View>
              ) : null}
            </View>
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: '100%',
  },
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    letterSpacing: 0.2,
  },
  spinner: {
    marginRight: 8,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
