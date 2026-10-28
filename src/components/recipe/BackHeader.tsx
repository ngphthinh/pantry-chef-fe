import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { AppText } from '@/components/ui/AppText';

interface BackHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}

/** Thanh tiêu đề có nút quay lại, dùng chung cho các màn hình của nhóm công thức. */
export function BackHeader({ title, subtitle, right }: BackHeaderProps) {
  const router = useRouter();
  const { palette } = useAppTheme();
  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        onPress={() => router.back()}
        accessibilityRole="button"
        accessibilityLabel="Quay lại"
        className="h-10 w-10 items-center justify-center rounded-full bg-soft dark:bg-soft-dark"
      >
        <Ionicons name="arrow-back" size={20} color={palette.ink} />
      </Pressable>
      <View className="flex-1">
        <AppText variant="heading" numberOfLines={1}>{title}</AppText>
        {subtitle ? <AppText variant="caption" numberOfLines={1}>{subtitle}</AppText> : null}
      </View>
      {right}
    </View>
  );
}
