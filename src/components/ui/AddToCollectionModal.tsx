import { useEffect } from "react";
import { ActivityIndicator,FlatList, Modal, Pressable, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { notify } from "@/core/ui/dialogs";
import { useAddToCollection } from "@/features/collections/useAddToCollection";

interface Props {
    visible: boolean;
    savedRecipeId: string;
    onClose: () => void;
}

export function AddToCollectionModal({ visible, savedRecipeId, onClose }: Props) {
    const { collections, addedIds, isLoading, isAdding, load, add } =
        useAddToCollection(savedRecipeId);

    useEffect(() => {
        if (visible) void load(); // luôn lấy bản mới nhất mỗi lần mở
    }, [visible, load]);

    const handlePick = async (collectionId: string) => {
        const result = await add(collectionId);
        if (!result.ok) notify("Lỗi", result.message);
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 items-center justify-center bg-black/40">
                <View className="max-h-[70%] w-4/5 gap-3 rounded-2xl bg-white p-4">
                    <Text className="font-bold">Thêm vào bộ sưu tập</Text>
                    {isLoading && collections.length === 0 ? (
                        <ActivityIndicator />
                    ) : (
                        <FlatList
                            data={collections}
                            keyExtractor={(c) => c.id}
                            ListEmptyComponent={<Text>Bạn chưa có bộ sưu tập nào. Hãy tạo ở tab Đã lưu.</Text>}
                            renderItem={({ item }) => (
                                <Pressable
                                    className="flex-row items-center justify-between py-3"
                                    disabled={isAdding || addedIds.includes(item.id)}
                                    onPress={() => void handlePick(item.id)}
                                >
                                    <Text>{item.name}</Text>
                                    <Text>{addedIds.includes(item.id) ? "Đã thêm ✓" : `${item.recipeCount} món`}</Text>
                                </Pressable>
                            )}
                        />
                    )}
                    <Button title="Xong" onPress={onClose} />
                </View>
            </View>
        </Modal>
    );
}