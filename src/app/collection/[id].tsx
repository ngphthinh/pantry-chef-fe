import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/components/ui/Button";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { confirmAction, notify } from "@/core/ui/dialogs";
import { useCollectionDetail } from "@/features/collections/useCollectionDetail";
import { useCollectionForm } from "@/features/collections/useCollectionForm";

export default function CollectionDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const {
        collection,
        items,
        hasNext,
        error,
        isLoading,
        isLoadingMore,
        refresh,
        loadMore,
        removeFromCollection,
        deleteCollection,
    } = useCollectionDetail(id);
    const [renaming, setRenaming] = useState(false);

    const handleDelete = async () => {
        const ok = await confirmAction({
            title: "Xoá bộ sưu tập",
            message: `Xoá "${collection?.name ?? ""}"? Các món đã lưu vẫn được giữ.`,
            confirmText: "Xoá",
            destructive: true,
        });
        if (!ok) return;
        const result = await deleteCollection();
        if (result.ok) router.back();
        else notify("Lỗi", result.message);
    };

    const handleRemoveRecipe = async (savedRecipeId: string) => {
        const result = await removeFromCollection(savedRecipeId);
        if (!result.ok) notify("Lỗi", result.message);
    };

    return (
        <Screen>
            <View className="flex-row items-center justify-between">
                <View>
                    <Text className="font-bold">{collection?.name ?? "Bộ sưu tập"}</Text>
                    {collection && <Text>{collection.recipeCount} món</Text>}
                </View>
                {collection && (
                    <View className="flex-row gap-3">
                        <Pressable onPress={() => setRenaming(true)}><Text>Đổi tên</Text></Pressable>
                        <Pressable onPress={() => void handleDelete()}><Text>Xoá</Text></Pressable>
                    </View>
                )}
            </View>
            {isLoading && items.length === 0 ? (
                <ActivityIndicator />
            ) : error && items.length === 0 ? (
                <View>
                    <Text>{error}</Text>
                    <Button title="Thử lại" onPress={() => void refresh()} />
                </View>
            ) : items.length === 0 ? (
                <Text>Bộ sưu tập chưa có món nào.</Text>
            ) : (
                <View>
                    {items.map((item) => (
                        <View key={item.id} className="flex-row items-center justify-between py-3">
                            <Pressable className="flex-1" onPress={() => router.push(`/recipe/saved/${item.id}`)}>
                                <Text>{item.recipeTitle}</Text>
                            </Pressable>
                            <Pressable onPress={() => void handleRemoveRecipe(item.id)}>
                                <Text>Bỏ khỏi bộ sưu tập</Text>
                            </Pressable>
                        </View>
                    ))}
                    {hasNext && (
                        <Pressable className="items-center py-3" onPress={() => void loadMore()}>
                            {isLoadingMore ? <ActivityIndicator /> : <Text>Tải thêm</Text>}
                        </Pressable>
                    )}
                </View>
            )}

            {renaming && collection && (
                <RenameDialog collection={collection} onClose={() => setRenaming(false)} />
            )}
        </Screen>
    );
}

function RenameDialog({
                          collection,
                          onClose,
                      }: {
    collection: { id: string; name: string };
    onClose: () => void;
}) {
    const { name, error, setName, submit, isSubmitting } = useCollectionForm(collection);

    const handleSubmit = async () => {
        const result = await submit();
        if (result.ok) onClose();
        else if (!error) notify("Lỗi", result.message);
    };

    return (
        <Modal visible transparent animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 items-center justify-center bg-black/40">
                <View className="w-4/5 gap-3 rounded-2xl bg-white p-4">
                    <TextField label="Tên bộ sưu tập" value={name} onChangeText={setName} error={error} />
                    <Button title="Lưu" loading={isSubmitting} onPress={handleSubmit} />
                    <Button title="Huỷ" onPress={onClose} />
                </View>
            </View>
        </Modal>
    );
}