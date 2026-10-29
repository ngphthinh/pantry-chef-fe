import { useState } from "react";
import { Image, View } from "react-native";

import { cn } from "@/components/ui/cn";
import type { SavedRecipeResponse } from "@/types";

export const getSavedRecipeImage = (item: SavedRecipeResponse) =>
  item.recipeImageUrl ?? item.imageUrl;

/** Có ảnh thì hiện ảnh, không có (hoặc lỗi tải) thì giữ khung xám như bản đầu. */
export function SavedRecipeImage({ uri, className }: { uri?: string | null; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (!uri || failed) {
    return <View className={cn("bg-soft dark:bg-soft-dark", className)} />;
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