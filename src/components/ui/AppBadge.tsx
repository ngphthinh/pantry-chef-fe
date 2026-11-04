import React, { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme';
import { AppText } from './AppText';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral';

export interface AppBadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: ReactNode;
  size?: 'sm' | 'md';
}

/**
 * Huy hiệu AppBadge hiện đại:
 * Nền mềm mại (Soft/Kính mờ), viền ngọc tinh tế, độ tương phản chuẩn WCAG AAA.
 */
export function AppBadge({
  label,
  tone = 'primary',
  icon,
  size = 'md',
}: AppBadgeProps) {
  const { colors, radius, spacing, isDark } = useTheme();

  const toneConfig = {
    primary: {
      bg: colors.primarySoft,
      text: colors.primary,
      border: isDark ? 'rgba(16, 185, 129, 0.28)' : 'rgba(46, 125, 79, 0.18)',
    },
    success: {
      bg: colors.successSoft,
      text: colors.success,
      border: isDark ? 'rgba(52, 211, 153, 0.28)' : 'rgba(46, 125, 79, 0.18)',
    },
    warning: {
      bg: colors.warningSoft,
      text: colors.warning,
      border: isDark ? 'rgba(251, 191, 36, 0.28)' : 'rgba(217, 119, 6, 0.2)',
    },
    danger: {
      bg: colors.errorSoft,
      text: colors.error,
      border: isDark ? 'rgba(248, 113, 113, 0.28)' : 'rgba(220, 38, 38, 0.18)',
    },
    info: {
      bg: colors.infoSoft,
      text: colors.info,
      border: isDark ? 'rgba(56, 189, 248, 0.28)' : 'rgba(2, 132, 199, 0.18)',
    },
    neutral: {
      bg: colors.surfaceVariant,
      text: colors.textSecondary,
      border: colors.border,
    },
  }[tone];

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: toneConfig.bg,
          borderColor: toneConfig.border,
          borderRadius: radius.full,
          paddingHorizontal: isSmall ? spacing.sm + 1 : spacing.md,
          paddingVertical: isSmall ? 3 : 5,
        },
      ]}
    >
      {icon ? (
        <View style={styles.iconContainer}>{icon}</View>
      ) : (
        <View
          style={[
            styles.indicatorDot,
            {
              backgroundColor: toneConfig.text,
            },
          ]}
        />
      )}
      <AppText
        style={[
          styles.text,
          {
            color: toneConfig.text,
            fontSize: isSmall ? 11 : 12,
          },
        ]}
      >
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: 4,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
