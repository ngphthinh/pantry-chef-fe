// SavedRecipeTile.tsx
import { Pressable, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  getSavedRecipeImage,
  SavedRecipeImage,
} from "@/components/saved/SavedRecipeImage";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { brand } from "@/core/theme/colors";
import type { SavedRecipeResponse } from "@/types";

interface Props {
  item: SavedRecipeResponse;
  onPress: () => void;
  onToggleFavorite: () => void;
  onRemove?: () => void;
}

export function SavedRecipeTile({ item, onPress, onToggleFavorite, onRemove }: Props) {
  const imageUri = getSavedRecipeImage(item);

  return (
      <TouchableOpacity style={{ flex: 1, maxWidth: "48.5%" }} onPress={onPress}>
        <Card className="overflow-hidden">
          <View>
            <SavedRecipeImage uri={imageUri} className="h-28 w-full" />
            {item.rating != null && item.rating > 0 ? (
                <View className="absolute bottom-2 left-2 flex-row items-center gap-1 rounded-full bg-black/60 px-2 py-1">
                  <Ionicons name="star" size={12} color="#FACC15" />
                  <AppText className="text-xs font-bold text-white">{item.rating}</AppText>
                </View>
            ) : null}
            {onRemove ? (
                <Pressable
                    hitSlop={8}
                    onPress={onRemove}
                    className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-black/50"
                >
                  <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                </Pressable>
            ) : null}
          </View>
          {/* Chiều cao cố định = đủ 2 dòng tiêu đề -> mọi card bằng nhau */}
          <View className="h-[68px] flex-row items-center justify-between gap-2 p-3">
            <AppText className="flex-1 font-bold" numberOfLines={2}>
              {item.recipeTitle}
            </AppText>
            <TouchableOpacity hitSlop={8} onPress={onToggleFavorite}>
              <Ionicons
                  name={item.favorite ? "heart" : "heart-outline"}
                  size={20}
                  color={brand.DEFAULT}
              />
            </TouchableOpacity>
          </View>
        </Card>
      </TouchableOpacity>
  );
}