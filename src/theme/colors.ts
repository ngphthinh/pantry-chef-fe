/**
 * Tầng 2: Semantic Colors Token
 * Quy ước màu theo vai trò ngữ nghĩa sử dụng trong giao diện.
 * Thiết kế sang trọng, tương phản cao, chuẩn mực cho cả Light và Dark mode.
 */

import { palette } from './palette';

export interface GradientToken {
  readonly colors: readonly [string, string, ...string[]];
  readonly start: { readonly x: number; readonly y: number };
  readonly end: { readonly x: number; readonly y: number };
}

export interface AppColors {
  // Backgrounds & Surfaces
  readonly background: string;
  readonly surface: string;
  readonly surfaceVariant: string;
  readonly card: string;
  readonly cardBorder: string;
  readonly overlay: string;

  // Typography
  readonly textPrimary: string;
  readonly textSecondary: string;
  readonly textDisabled: string;
  readonly textOnPrimary: string;
  readonly textLink: string;

  // Primary (Brand Emerald)
  readonly primary: string;
  readonly primaryPressed: string;
  readonly primaryDisabled: string;
  readonly primarySoft: string;
  readonly primaryBevel: string;

  // Secondary & Accents
  readonly secondary: string;
  readonly secondarySoft: string;
  readonly accent: string;
  readonly accentSoft: string;

  // Borders & Lines
  readonly border: string;
  readonly borderFocus: string;
  readonly divider: string;

  // Feedback & Status
  readonly success: string;
  readonly successSoft: string;
  readonly warning: string;
  readonly warningSoft: string;
  readonly error: string;
  readonly errorSoft: string;
  readonly info: string;
  readonly infoSoft: string;

  // 3D Effects & Gradients
  readonly topRim: string;
  readonly shadow: string;
  readonly shadowGlow: string;
  readonly gradients: {
    readonly primary: GradientToken;
    readonly accent: GradientToken;
    readonly surface: GradientToken;
  };
}

export const lightColors: AppColors = {
  // Nền sáng thanh sạch, không ám vàng
  background: '#F7FAF8',
  surface: '#FFFFFF',
  surfaceVariant: '#EFF4F0',
  card: 'rgba(255, 255, 255, 0.95)',
  cardBorder: 'rgba(46, 125, 79, 0.14)',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Chữ
  textPrimary: '#121C16',
  textSecondary: '#55645B',
  textDisabled: '#95A39B',
  textOnPrimary: '#FFFFFF',
  textLink: '#2E7D4F',

  // Thương hiệu chính
  primary: '#2E7D4F',
  primaryPressed: '#22633E',
  primaryDisabled: 'rgba(46, 125, 79, 0.4)',
  primarySoft: '#E1F2E7',
  primaryBevel: '#174A2E',

  // Secondary & Accent
  secondary: '#10B981',
  secondarySoft: '#D1FAE5',
  accent: '#D97706',
  accentSoft: '#FEF3C7',

  // Đường kẻ & viền
  border: '#E2ECE5',
  borderFocus: '#2E7D4F',
  divider: 'rgba(0, 0, 0, 0.06)',

  // Trạng thái phản hồi
  success: '#2E7D4F',
  successSoft: '#E1F2E7',
  warning: '#92400E',
  warningSoft: '#FEF3C7',
  error: '#DC2626',
  errorSoft: '#FEE2E2',
  info: '#0284C7',
  infoSoft: '#E0F2FE',

  // 3D & Gradients
  topRim: 'rgba(255, 255, 255, 0.6)',
  shadow: '#121C16',
  shadowGlow: '#10B981',
  gradients: {
    primary: {
      colors: ['#2E7D4F', '#22633E'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    accent: {
      colors: ['#F59E0B', '#D97706'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    surface: {
      colors: ['#FFFFFF', '#F7FAF8'],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
  },
};

export const darkColors: AppColors = {
  // Nền đen nhung than chì sâu thẳm, loại bỏ hoàn toàn cảm giác rêu xỉn
  background: '#0A0E0C',
  surface: '#161D19',
  surfaceVariant: '#202823',
  card: 'rgba(22, 29, 25, 0.92)',
  cardBorder: 'rgba(52, 211, 153, 0.22)',
  overlay: 'rgba(0, 0, 0, 0.75)',

  // Chữ sắc nét, tinh khiết
  textPrimary: '#F5F7F6',
  textSecondary: '#95A39B',
  textDisabled: '#4B5550',
  textOnPrimary: '#0A0E0C', // Đảm bảo độ tương phản cao trên nền mint neon
  textLink: '#34D399',

  // Thương hiệu chính Dark Mode: Mint Neon phát sáng rực rỡ
  primary: '#10B981',
  primaryPressed: '#059669',
  primaryDisabled: 'rgba(16, 185, 129, 0.3)',
  primarySoft: 'rgba(16, 185, 129, 0.16)',
  primaryBevel: '#064E3B',

  // Secondary & Accent
  secondary: '#34D399',
  secondarySoft: 'rgba(52, 211, 153, 0.16)',
  accent: '#FBBF24',
  accentSoft: 'rgba(251, 191, 36, 0.16)',

  // Đường kẻ & viền kính
  border: '#26322B',
  borderFocus: '#34D399',
  divider: 'rgba(255, 255, 255, 0.08)',

  // Trạng thái phản hồi (kính mờ phát quang)
  success: '#34D399',
  successSoft: 'rgba(16, 185, 129, 0.16)',
  warning: '#FBBF24',
  warningSoft: 'rgba(245, 158, 11, 0.16)',
  error: '#F87171',
  errorSoft: 'rgba(239, 68, 68, 0.16)',
  info: '#38BDF8',
  infoSoft: 'rgba(14, 165, 233, 0.16)',

  // 3D & Gradients
  topRim: 'rgba(255, 255, 255, 0.25)',
  shadow: '#000000',
  shadowGlow: '#10B981',
  gradients: {
    primary: {
      colors: ['#34D399', '#10B981'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    accent: {
      colors: ['#FBBF24', '#F59E0B'],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    surface: {
      colors: ['#1C2420', '#161D19'],
      start: { x: 0, y: 0 },
      end: { x: 0, y: 1 },
    },
  },
};
