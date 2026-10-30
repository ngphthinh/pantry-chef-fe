import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { AppText } from "./AppText";

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  message?: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  const { brand } = useAppTheme();
  return (
    <View className="items-center gap-2 py-10">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-soft dark:bg-soft-dark">
        <Ionicons name={icon} size={28} color={brand} />
      </View>
      <AppText className="font-bold">{title}</AppText>
      {message ? (
        <AppText variant="caption" className="text-center">
          {message}
        </AppText>
      ) : null}
    </View>
  );
}
