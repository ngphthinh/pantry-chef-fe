import { useState } from "react";
import { Image, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { cn } from "@/components/ui/cn";
import { useAppTheme } from "@/core/theme/useAppTheme";
import type { SavedRecipeResponse } from "@/types";

export const getSavedRecipeImage = (item: SavedRecipeResponse) =>
  item.recipeImageUrl ?? item.imageUrl;

/** Có ảnh thì hiện ảnh; không có (hoặc lỗi tải) thì hiện khung "Không có ảnh". */
export function SavedRecipeImage({
  uri,
  className,
}: {
  uri?: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const { palette } = useAppTheme();

  if (!uri || failed) {
    return (
      <View
        className={cn(
          "items-center justify-center gap-1 bg-soft dark:bg-soft-dark",
          className,
        )}>
        <Ionicons name="image-outline" size={28} color={palette.muted} />
        <AppText variant="caption">Không có ảnh</AppText>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      className={cn("bg-soft dark:bg-soft-dark", className)}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  );
}
