# Kiến Trúc Design Token & Hệ Thống Theme - Pantry Chef

Hệ thống màu sắc và giao diện của Pantry Chef được chuẩn hóa toàn diện theo phong cách **Hiện đại, Sống động, Đậm chất Ẩm thực thông minh**, lấy **màn hình Đăng Nhập (Login Screen)** làm **Nguồn Chuẩn Duy Nhất (Single Source of Truth)**.

---

## 1. Cấu Trúc Token 3 Tầng (Type-Safe)

Toàn bộ hệ thống token nằm trong thư mục `@/theme` (`src/theme/`):

```
src/theme/
├── palette.ts         # Tầng 1 (Primitive): Thang màu gốc 50 -> 950
├── colors.ts          # Tầng 2 (Semantic): AppColors (lightColors, darkColors)
├── spacing.ts         # Spacing scale 4pt/8pt (none, 3xs, 2xs, xs, sm, md, base, lg, xl, 2xl...)
├── radius.ts          # Radius token (none, xs, sm, md, lg, xl, 2xl, 3xl, full)
├── typography.ts      # Typography tokens (sizes, weights, variants)
├── shadows.ts         # Thống nhất iOS (shadow*) và Android (elevation)
├── theme.ts           # AppTheme, lightTheme, darkTheme, toNavigationTheme
├── ThemeProvider.tsx  # React Context Provider hỗ trợ system/light/dark và lưu vào kvStorage
├── useTheme.ts        # Typed hook lấy thông tin theme
├── makeStyles.ts      # Helper tạo StyleSheet tự động tối ưu hóa với useMemo
└── index.ts           # Xuất khẩu tập trung qua alias @/theme
```

---

## 2. Bảng Ánh Xạ Token Ngữ Nghĩa (Semantic Tokens)

| Token Ngữ Nghĩa (`theme.colors.*`) | Light Mode | Dark Mode | Ngữ Cảnh Sử Dụng Chuẩn |
| :--- | :--- | :--- | :--- |
| `primary` | `#2E7D4F` | `#34D399` | Màu thương hiệu Emerald Green chính, nút CTA, tiêu đề nổi bật |
| `primaryPressed` | `#256640` | `#2E7D4F` | Trạng thái nhấn nút chính |
| `primarySoft` | `#DCEFE3` | `rgba(46,125,79,0.25)` | Nền badge thành công, container mềm |
| `primaryBevel` | `#1B4D31` | `#143B25` | Đế nổi khối nút bấm 3D TactileButton |
| `secondary` | `#10B981` | `#4ADE80` | Bạc hà tươi mát, biểu tượng thành công, điểm nhấn phụ |
| `secondarySoft` | `#D1FAE5` | `rgba(16,185,129,0.16)` | Nền phụ mềm mại |
| `accent` | `#D97706` | `#FBBF24` | Hổ phách/Vàng kim ấm, icon ngôi sao, quầng sáng sống động |
| `accentSoft` | `#FEF3C7` | `rgba(245,158,11,0.18)` | Nền cảnh báo nhẹ |
| `background` | `#FAF7F2` | `#101512` | Nền màn hình toàn ứng dụng |
| `surface` | `#FFFFFF` | `#1A211D` | Mặt thẻ Card, Modal, Sheet |
| `surfaceVariant` | `#F0ECE4` | `#2C352F` | Mặt thẻ phụ, input fill mờ |
| `card` | `rgba(255,255,255,0.92)` | `rgba(20,32,25,0.82)` | Kính mờ hiệu ứng 3D |
| `cardBorder` | `rgba(46,125,79,0.18)` | `rgba(52,211,153,0.28)` | Viền kính phản xạ ánh lục |
| `textPrimary` | `#1F2D26` | `#EAF1EC` | Chữ chính (độ tương phản cao WCAG AA) |
| `textSecondary` | `#5F6B64` | `#9AA8A0` | Chữ phụ, mô tả, nhãn phụ |
| `textDisabled` | `#9AA8A0` | `#4E5A53` | Chữ bị vô hiệu hóa |
| `textOnPrimary` | `#FFFFFF` | `#FFFFFF` | Chữ trên nền nút chính hoặc huy hiệu |
| `textLink` | `#2E7D4F` | `#34D399` | Chữ liên kết hành động |
| `border` | `#E6E0D6` | `#2C352F` | Đường viền ngăn cách mặc định |
| `borderFocus` | `#2E7D4F` | `#34D399` | Viền input khi người dùng đang trỏ |
| `divider` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.12)` | Vạch kẻ mảnh phân cách |
| `success` / `...Soft` | `#2E7D4F` / `#DCEFE3` | `#7CCB9A` / `#1E3A29` | Thông báo thành công, trạng thái đồ tươi |
| `warning` / `...Soft` | `#8A5A00` / `#FDEBC8` | `#F5C969` / `#3A2E10` | Cảnh báo hạn dùng sắp hết |
| `error` / `...Soft` | `#DC2626` / `#FBE0E0` | `#F87171` / `#3E1D1D` | Báo lỗi, đồ quá hạn |
| `info` / `...Soft` | `#0284C7` / `#E0F2FE` | `#38BDF8` / `#0C4A6E` | Gợi ý, thông tin hệ thống, bữa tối |
| `shadow` | `#1F2D26` | `#000000` | Màu bóng đổ tự nhiên |
| `shadowGlow` | `#10B981` | `#34D399` | Ánh sáng phát quang cho nút 3D và huy hiệu |
| `topRim` | `rgba(255,255,255,0.45)` | `rgba(255,255,255,0.2)` | Viền sáng cạnh trên cho nút tactile 3D |

---

## 3. Cách Sử Dụng Đúng Chuẩn (Code Examples)

### Ví dụ 1: Sử dụng trong Function Component với `useTheme`
```tsx
import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme';
import { AppText } from '@/components/ui';

export function ExampleCard() {
  const { colors, radius, shadows, spacing } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderColor: colors.border,
        borderRadius: radius['2xl'],
        padding: spacing.base,
        ...shadows.sm,
      }}
    >
      <AppText style={{ color: colors.textPrimary }}>Thẻ Nguyên Liệu Mới</AppText>
      <AppText style={{ color: colors.textSecondary }}>Hạn sử dụng còn 3 ngày</AppText>
    </View>
  );
}
```

### Ví dụ 2: Tối ưu hiệu năng với `makeStyles`
```tsx
import React from 'react';
import { View } from 'react-native';
import { makeStyles } from '@/theme';

const useStyles = makeStyles((theme) => ({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.base,
    borderRadius: theme.radius.xl,
  },
  title: {
    color: theme.colors.primary,
    ...theme.typography.variants.heading,
  },
}));

export function EfficientComponent() {
  const styles = useStyles();
  return <View style={styles.container} />;
}
```

---

## 4. Quy Tắc & Thực Hành Cấm Kỵ (Do's & Don'ts)

| ❌ KHÔNG ĐƯỢC LÀM (Anti-patterns) | ✅ ĐÚNG CHUẨN (Best practices) |
| :--- | :--- |
| `color: '#FFFFFF'` hoặc `color: '#10B981'` rải rác | `color: colors.textOnPrimary` hoặc `color: colors.secondary` |
| Viết số bo góc tùy ý `borderRadius: 17` | Dùng token `borderRadius: radius.xl` |
| Viết bóng đổ thủ công không đồng bộ iOS/Android | Dùng token `...shadows.tactile` hoặc `...shadows.sm` |
| Ép kiểu `as any` khi viết style | Ràng buộc kiểu chặt chẽ với `makeStyles` hoặc `ViewStyle` |

---

## 5. Đổi Màu Thương Hiệu Trong Tương Lai
Nếu muốn đổi màu chủ đạo (ví dụ chuyển sang Forest Green hoặc Indigo):
1. Mở file `src/theme/palette.ts`.
2. Thay đổi giá trị gốc ở thang `palette.emerald`.
3. Toàn bộ nút 3D, thanh tab bar, thẻ card, viền focus input và gradient trên khắp ứng dụng sẽ tự động đồng bộ ngay lập tức!

