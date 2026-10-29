import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { AppText } from "./AppText";
import { Screen } from "./Screen";

interface PageScreenProps {
  title: string;
  /** Nút phụ ở bên phải tiêu đề (ví dụ nút "+"). */
  right?: ReactNode;
  className?: string;
  children: ReactNode;
  scroll?: boolean;
}

/** Khung cho màn hình con (không nằm trong tab): tiêu đề + nút quay lại + tránh bàn phím. */
export function PageScreen({
  title,
  right,
  className,
  children,
  scroll = true,
}: PageScreenProps) {
  const router = useRouter();
  const { palette } = useAppTheme();

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Screen className={className} scroll={scroll}>
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
        {children}
      </Screen>
    </KeyboardAvoidingView>
  );
}
