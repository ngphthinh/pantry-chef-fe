import type { ReactElement } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { useRouter, type Href } from "expo-router";

import {SavedRecipeTile} from "@/components/saved/SavedRecipeTile";
import { AppText } from "@/components/ui/AppText";
import { ListScreen } from "@/components/ui/ListScreen";
import { brand } from "@/core/theme/colors";
import { notify } from "@/core/ui/dialogs";
import { useSavedList } from "@/features/savedRecipes/useSavedList";

interface Props {
    favoriteOnly?: boolean;
    header: ReactElement;
}

export function SavedRecipeList({ favoriteOnly = false, header }: Props) {
    const router = useRouter();
    const { items, error, isLoading, isLoadingMore, refresh, loadMore, toggleFavorite } =
        useSavedList({ favorite: favoriteOnly ? true : undefined });

    // Bỏ tim ở tab Yêu thích thì món biến mất ngay.
    const visible = favoriteOnly ? items.filter((i) => i.favorite) : items;

    const handleToggle = async (item: (typeof items)[number]) => {
        const result = await toggleFavorite(item);
        if (!result.ok) notify("Lỗi", result.message);
    };

    // ListScreen chỉ hiện `empty` khi danh sách rỗng nên dùng luôn cho trạng thái đang tải và lỗi.
    const empty = isLoading ? (
        <ActivityIndicator color={brand.DEFAULT} />
    ) : error ? (
        <View className="items-center gap-3">
            <AppText variant="caption">{error}</AppText>
            <Pressable onPress={() => void refresh()}>
                <AppText className="font-bold text-brand">Thử lại</AppText>
            </Pressable>
        </View>
    ) : (
        <AppText variant="caption">Chưa có món nào.</AppText>
    );
    console.log("SAVED ITEM:", JSON.stringify(items[0]));
    return (
        <ListScreen
            data={visible}
            keyExtractor={(i) => i.id}
            header={header}
            empty={empty}
            isLoadingMore={isLoadingMore}
            onEndReached={() => void loadMore()}
            numColumns={2}
            renderItem={({ item }) => (
                <SavedRecipeTile
                    item={item}
                    onPress={() => router.push(`/recipe/saved/${item.id}` as Href)}
                    onToggleFavorite={() => void handleToggle(item)}
                />
            )}
        />
    );
}