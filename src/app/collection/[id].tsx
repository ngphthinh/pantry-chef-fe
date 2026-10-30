import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";

import {SavedRecipeCard} from "@/components/saved/SaveRecipeCard";
import { AppText } from "@/components/ui/AppText";
import { BackHeader } from "@/components/ui/BackHeader";
import { CollectionDialog } from "@/components/ui/CollectionList";
import { ListScreen } from "@/components/ui/ListScreen";
import { brand } from "@/core/theme/colors";
import { confirmAction, notify } from "@/core/ui/dialogs";
import { useCollectionDetail } from "@/features/collections/useCollectionDetail";

export default function CollectionDetailScreen() {
    const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
    const router = useRouter();
    const {
        collection,
        items,
        error,
        isLoading,
        isLoadingMore,
        refresh,
        loadMore,
        removeFromCollection,
        deleteCollection,
    } = useCollectionDetail(id);
    const [renaming, setRenaming] = useState(false);

    const title = collection?.name ?? name ?? "Bộ sưu tập";

    const handleDelete = async () => {
        const ok = await confirmAction({
            title: "Xoá bộ sưu tập",
            message: `Xoá "${title}"? Các món đã lưu vẫn được giữ.`,
            confirmText: "Xoá",
            destructive: true,
        });
        if (!ok) return;
        const result = await deleteCollection();
        if (!result.ok) return notify("Lỗi", result.message);
        if (router.canGoBack()) router.back();
        else router.replace("/collection" as Href);
    };

    const handleRemoveRecipe = async (savedRecipeId: string) => {
        const result = await removeFromCollection(savedRecipeId);
        if (!result.ok) notify("Lỗi", result.message);
    };

    const header = (
        <BackHeader
            title={title}
            subtitle={collection ? `${collection.recipeCount} món` : undefined}
            fallbackHref={"/collection" as Href}
            right={
                <View className="flex-row items-center gap-4">
                    <Pressable hitSlop={8} onPress={() => setRenaming(true)}>
                        <Ionicons name="create-outline" size={22} color={brand.DEFAULT} />
                    </Pressable>
                    <Pressable hitSlop={8} onPress={() => void handleDelete()}>
                        <Ionicons name="trash-outline" size={22} color="#DC2626" />
                    </Pressable>
                </View>
            }
        />
    );

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
        <AppText variant="caption">Bộ sưu tập chưa có món nào.</AppText>
    );

    return (
        <>
            <ListScreen
                data={items}
                keyExtractor={(i) => i.id}
                header={header}
                empty={empty}
                isLoadingMore={isLoadingMore}
                onEndReached={() => void loadMore()}
                renderItem={({ item }) => (
                    <SavedRecipeCard
                        item={item}
                        onPress={() => router.push(`/recipe/saved/${item.id}` as Href)}
                        right={
                            <Pressable hitSlop={8} onPress={() => void handleRemoveRecipe(item.id)}>
                                <Ionicons name="close-circle-outline" size={24} color={brand.DEFAULT} />
                            </Pressable>
                        }
                    />
                )}
            />

            {renaming && (
                <CollectionDialog
                    collection={{ id, name: title }}
                    onClose={() => setRenaming(false)}
                />
            )}
        </>
    );
}