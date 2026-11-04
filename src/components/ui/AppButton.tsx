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

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
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
  const { colors, radius, shadows, spacing } = useTheme();
  const inactive = disabled || loading;

  const sizeHeights = {
    sm: 36,
    md: 48,
    lg: 54,
  };

  const getVariantStyles = (pressed: boolean) => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: pressed ? colors.primaryPressed : colors.primary,
          borderColor: 'transparent',
          borderWidth: 0,
          textColor: colors.textOnPrimary,
          shadow: shadows.sm,
        };
      case 'secondary':
        return {
          backgroundColor: pressed ? colors.surfaceVariant : colors.primarySoft,
          borderColor: 'transparent',
          borderWidth: 0,
          textColor: colors.primary,
          shadow: shadows.none,
        };
      case 'outline':
        return {
          backgroundColor: pressed ? colors.surfaceVariant : 'transparent',
          borderColor: colors.border,
          borderWidth: 1.2,
          textColor: colors.textPrimary,
          shadow: shadows.none,
        };
      case 'ghost':
        return {
          backgroundColor: pressed ? colors.surfaceVariant : 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
          textColor: colors.textPrimary,
          shadow: shadows.none,
        };
      case 'danger':
        return {
          backgroundColor: pressed ? '#B91C1C' : colors.error,
          borderColor: 'transparent',
          borderWidth: 0,
          textColor: colors.textOnPrimary,
          shadow: shadows.sm,
        };
    }
  };

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => {
        const v = getVariantStyles(pressed);
        return [
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
          style,
        ];
      }}
      {...props}
    >
      {({ pressed }) => {
        const v = getVariantStyles(pressed);
        return (
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
              ]}
            >
              {title}
            </AppText>

            {!loading && iconRight ? (
              <View style={styles.iconRight}>{iconRight}</View>
            ) : null}
          </View>
        );
      }}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
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
