import type { ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { brand } from "@/core/theme/colors";
import type { SavedRecipeResponse } from "@/types";

interface Props {
    item: SavedRecipeResponse;
    onPress: () => void;
    /** Nút bên phải (tim, bỏ khỏi bộ sưu tập...). */
    right?: ReactNode;
}

export function SavedRecipeCard({ item, onPress, right }: Props) {
    return (
        <Card className="flex-row items-center gap-3 p-3">
            <Pressable className="flex-1 flex-row items-center gap-3" onPress={onPress}>
                <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-brandSoft">
                    <Ionicons name="restaurant-outline" size={26} color={brand.DEFAULT} />
                </View>
                <View className="flex-1 gap-1">
                    <AppText className="font-bold" numberOfLines={2}>
                        {item.recipeTitle}
                    </AppText>
                    {item.rating ? <AppText variant="caption">{`★ ${item.rating}/5`}</AppText> : null}
                </View>
            </Pressable>
            {right}
        </Card>
    );
}