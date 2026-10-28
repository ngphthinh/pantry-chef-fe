import { ActivityIndicator, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { brand } from "@/core/theme/colors";
import { notify } from "@/core/ui/dialogs";
import { useSavedList } from "@/features/savedRecipes/useSavedList";

export function SavedRecipeGrid({ favoriteOnly = false }: { favoriteOnly?: boolean }) {
    const router = useRouter();
    const { items, hasNext, error, isLoading, isLoadingMore, refresh, loadMore, toggleFavorite } =
        useSavedList({ favorite: favoriteOnly ? true : undefined });

    const visible = favoriteOnly ? items.filter((i) => i.favorite) : items;

    const handleToggle = async (item: (typeof items)[number]) => {
        const result = await toggleFavorite(item);
        if (!result.ok) notify("Lỗi", result.message);
    };

    if (isLoading && items.length === 0) return <ActivityIndicator />;

    if (error && items.length === 0) {
        return (
            <View className="items-center gap-3">
                <AppText variant="caption">{error}</AppText>
                <Pressable onPress={() => void refresh()}>
                    <AppText className="font-bold text-brand">Thử lại</AppText>
                </Pressable>
            </View>
        );
    }

    if (visible.length === 0) return <AppText variant="caption">Chưa có món nào.</AppText>;

    return (
        <View className="gap-3">
            <View className="flex-row flex-wrap justify-between gap-y-3">
                {visible.map((r) => (
                    <Pressable
                        key={r.id}
                        className="w-[48.5%]"
                        onPress={() => router.push(`/recipe/saved/${r.id}` as Href)}
                    >
                        <Card className="overflow-hidden">
                            <View className="h-28 bg-soft dark:bg-soft-dark" />
                            <View className="flex-row items-center justify-between gap-2 p-3">
                                <AppText className="flex-1 font-bold" numberOfLines={2}>
                                    {r.recipeTitle}
                                </AppText>
                                <Pressable hitSlop={8} onPress={() => void handleToggle(r)}>
                                    <Ionicons
                                        name={r.favorite ? "heart" : "heart-outline"}
                                        size={20}
                                        color={brand.DEFAULT}
                                    />
                                </Pressable>
                            </View>
                        </Card>
                    </Pressable>
                ))}
            </View>

            {hasNext && (
                <Pressable className="items-center py-3" onPress={() => void loadMore()}>
                    {isLoadingMore ? (
                        <ActivityIndicator />
                    ) : (
                        <AppText className="font-bold text-brand">Tải thêm</AppText>
                    )}
                </Pressable>
            )}
        </View>
    );
}