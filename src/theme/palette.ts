/**
 * Tầng 1: Primitive Palette
 * Định nghĩa thang màu thô 50 -> 950 dựa trên màu gốc của màn hình Login làm mốc chuẩn.
 * Khai báo as const satisfies để giữ nguyên kiểu literal type và type-safety tuyệt đối.
 */

export type Shade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

export const palette = {
  /** Màu chủ đạo: Emerald Green */
  emerald: {
    50: '#F0FDF4',
    100: '#E1F2E7', // Brand Soft Light
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#2E7D4F', // Light Primary
    600: '#22633E',
    700: '#174A2E',
    800: '#103621',
    900: '#0B2617',
    950: '#05140C',
  },

  /** Màu phụ trợ phát sáng: Mint */
  mint: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399', // Dark Focus & Glow
    500: '#10B981', // Dark Primary Brand
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
    950: '#022C22',
  },

  /** Màu ấm: Amber (Hổ phách & Vàng kim) */
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7', // Warn Light Bg
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24', // Warn Dark Ink
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E', // Warn Light Ink
    900: '#78350F',
    950: '#451A03',
  },

  /** Màu trung tính Neutral (Obsidian Velvet Dark & Fresh Gourmet Light) */
  neutral: {
    50: '#F7FAF8',  // Canvas Light
    100: '#EFF4F0', // Soft Light
    200: '#E2ECE5', // Line/Border Light
    300: '#CBD5E1',
    400: '#95A39B', // Muted Dark
    500: '#55645B', // Muted Light
    600: '#3D4942',
    700: '#26322B', // Line/Border Dark
    800: '#161D19', // Surface Dark
    900: '#0A0E0C', // Canvas Dark
    950: '#050806',
  },

  /** Màu cảnh báo lỗi: Danger / Error */
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2', // Danger Light Bg
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171', // Danger Dark Ink
    500: '#EF4444',
    600: '#DC2626', // Danger Light Ink
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    950: '#450A0A',
  },

  /** Màu cảnh báo: Warning */
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    950: '#451A03',
  },

  /** Màu thành công: Success */
  success: {
    50: '#F0FDF4',
    100: '#E1F2E7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#34D399',
    500: '#2E7D4F',
    600: '#22633E',
    700: '#174A2E',
    800: '#103621',
    900: '#0B2617',
    950: '#05140C',
  },

  /** Màu thông tin: Info */
  info: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
    950: '#082F49',
  },

  /** Màu cố định đặc biệt */
  common: {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
} as const satisfies Record<string, Record<string | number, string>>;

export type Palette = typeof palette;
export type PaletteName = keyof typeof palette;
