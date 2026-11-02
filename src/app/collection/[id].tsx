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
import { AddRecipesToCollectionModal } from "@/components/ui/AddRecipesToCollectionModal";

import { TextField } from "@/components/ui/TextField";
import { useDebouncedValue } from "@/core/hooks/useDebounceValue";



export default function CollectionDetailScreen() {
    const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
    const router = useRouter();
    const [renaming, setRenaming] = useState(false);
    const [adding, setAdding] = useState(false);
    const [text, setText] = useState("");
    const keyword = useDebouncedValue(text.trim(), 400);
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
    } = useCollectionDetail(id, keyword);


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
    const showSearch = (collection?.recipeCount ?? 1) > 0;
    const header = (
        <View className = "gap-3">
            <BackHeader
                title={title}
                subtitle={collection ? `${collection.recipeCount} món` : undefined}
                fallbackHref={"/collection" as Href}
                right={
                    <View className="flex-row items-center gap-4">
                        <Pressable hitSlop={8} onPress={() => setAdding(true)}>
                            <Ionicons name="add-circle-outline" size={24} color={brand.DEFAULT} />
                        </Pressable>
                        <Pressable hitSlop={8} onPress={() => setRenaming(true)}>
                            <Ionicons name="create-outline" size={22} color={brand.DEFAULT} />
                        </Pressable>
                        <Pressable hitSlop={8} onPress={() => void handleDelete()}>
                            <Ionicons name="trash-outline" size={22} color="#DC2626" />
                        </Pressable>
                    </View>
                }
            />
            {showSearch && (
                <TextField
                    label="Tìm món trong bộ sưu tập"
                    value={text}
                    onChangeText={setText}
                    placeholder="Nhập tên món..."
                />
            )}
        </View>
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
        <AppText variant="caption">
            {keyword ? "Không có món nào khớp." : "Bộ sưu tập chưa có món nào. Bấm + để thêm."}
        </AppText>
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
            <AddRecipesToCollectionModal
                visible={adding}
                collectionId={id}
                existingIds={items.map((i) => i.id)}
                onClose={(changed) => {
                    setAdding(false);
                    if (changed) void refresh();
                }}
            />
        </>
    );
}