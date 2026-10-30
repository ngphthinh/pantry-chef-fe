import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { AppText } from "./AppText";

interface PageHeaderProps {
  title: string;
  /** Nút phụ ở bên phải tiêu đề (ví dụ nút "+"). */
  right?: ReactNode;
}

/** Hàng tiêu đề của màn hình con: nút quay lại + tiêu đề + nút phụ. Dùng trong PageScreen và làm `header` của ListScreen. */
export function PageHeader({ title, right }: PageHeaderProps) {
  const router = useRouter();
  const { palette } = useAppTheme();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  return (
    <View className="flex-row items-center gap-2">
      <Pressable
        onPress={goBack}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Quay lại"
        className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
      >
        <Ionicons name="chevron-back" size={24} color={palette.ink} />
      </Pressable>
      <AppText variant="heading" className="flex-1" numberOfLines={1}>
        {title}
      </AppText>
      {right}
    </View>
  );
}
