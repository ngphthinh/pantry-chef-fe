import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { brand } from "@/core/theme/colors";
import { useAppTheme } from "@/core/theme/useAppTheme";

interface BackHeaderProps {
  title: string;
  subtitle?: string;
  /** Nút thao tác bên phải (sửa, xoá...). */
  right?: ReactNode;
  /** Đi tới đây khi không có màn hình trước (ví dụ tải lại trang trên web). */
  fallbackHref?: Href;
}

export function BackHeader({
  title,
  subtitle,
  right,
  fallbackHref = "/",
}: BackHeaderProps) {
  const router = useRouter();

  const { palette } = useAppTheme();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace(fallbackHref);
  };

  return (
    <View className="flex-row items-center gap-3">
      <Pressable
        onPress={goBack}
        hitSlop={8}
        className="h-10 w-10 items-center justify-center rounded-full bg-soft active:scale-90 dark:bg-surface-dark">
        <Ionicons name="arrow-back" size={20} color={palette.ink} />
      </Pressable>

      <View className="flex-1">
        <AppText variant="title" numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? <AppText variant="caption">{subtitle}</AppText> : null}
      </View>

      {right}
    </View>
  );
}
