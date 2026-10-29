import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { brand } from "@/core/theme/colors";
import { notify } from "@/core/ui/dialogs";
import { useCollections } from "@/features/collections/useCollections";
import { useSavedPicker } from "@/features/savedRecipes/useSavedPicker";

interface Props {
    visible: boolean;
    collectionId: string;
    /** id các món đã nằm trong bộ sưu tập (theo danh sách đang tải). */
    existingIds: string[];
    /** `changed` = true nếu vừa thêm món, để màn hình cha tải lại. */
    onClose: (changed: boolean) => void;
}

export function AddRecipesToCollectionModal({ visible, collectionId, existingIds, onClose }: Props) {
    const { items, error, isLoading, load, loadMore } = useSavedPicker();
    const { addRecipe, isSaving } = useCollections();
    const [addedIds, setAddedIds] = useState<string[]>([]);

    useEffect(() => {
        if (visible) {
            setAddedIds([]);
            void load();
        }
    }, [visible, load]);

    const handleAdd = async (savedRecipeId: string) => {
        const result = await addRecipe(collectionId, savedRecipeId);
        if (result.ok) setAddedIds((prev) => [...prev, savedRecipeId]);
        else notify("Lỗi", result.message);
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={() => onClose(addedIds.length > 0)}>
            <View className="flex-1 items-center justify-center bg-black/40 px-6">
                <View className="max-h-[75%] w-full gap-3 rounded-2xl bg-surface p-5">
                    <AppText variant="heading">Thêm món vào bộ sưu tập</AppText>

                    <FlatList
                        data={items}
                        keyExtractor={(i) => i.id}
                        onEndReached={() => void loadMore()}
                        onEndReachedThreshold={0.4}
                        ListEmptyComponent={
                            isLoading ? (
                                <ActivityIndicator color={brand.DEFAULT} />
                            ) : (
                                <AppText variant="caption">{error ?? "Bạn chưa lưu món nào."}</AppText>
                            )
                        }
                        renderItem={({ item }) => {
                            const added = existingIds.includes(item.id) || addedIds.includes(item.id);
                            return (
                                <View className="flex-row items-center justify-between gap-3 py-3">
                                    <AppText className="flex-1" numberOfLines={2}>
                                        {item.recipeTitle}
                                    </AppText>
                                    {added ? (
                                        <AppText variant="caption">Đã thêm ✓</AppText>
                                    ) : (
                                        <Pressable disabled={isSaving} onPress={() => void handleAdd(item.id)}>
                                            <AppText className="font-bold text-brand">Thêm</AppText>
                                        </Pressable>
                                    )}
                                </View>
                            );
                        }}
                    />

                    <Button title="Xong" onPress={() => onClose(addedIds.length > 0)} />
                </View>
            </View>
        </Modal>
    );
}