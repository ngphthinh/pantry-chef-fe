import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { getSavedRecipeImage, SavedRecipeImage } from "@/components/saved/SavedRecipeImage";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { brand } from "@/core/theme/colors";
import type { SavedRecipeResponse } from "@/types";

interface Props {
    item: SavedRecipeResponse;
    onPress: () => void;
    onToggleFavorite: () => void;
}

export function SavedRecipeTile({ item, onPress, onToggleFavorite }: Props) {
    return (
        <Pressable style={{ flex: 1, maxWidth: "48.5%" }} onPress={onPress}>
            <Card className="overflow-hidden">
                <SavedRecipeImage uri={getSavedRecipeImage(item)} className="h-28 w-full" />
                <View className="flex-row items-center justify-between gap-2 p-3">
                    <AppText className="flex-1 font-bold" numberOfLines={2}>
                        {item.recipeTitle}
                    </AppText>
                    <Pressable hitSlop={8} onPress={onToggleFavorite}>
                        <Ionicons
                            name={item.favorite ? "heart" : "heart-outline"}
                            size={20}
                            color={brand.DEFAULT}
                        />
                    </Pressable>
                </View>
            </Card>
        </Pressable>
    );
}