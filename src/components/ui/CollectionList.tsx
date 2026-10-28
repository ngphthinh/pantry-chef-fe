import { useCallback, useState } from "react";
import { ActivityIndicator, Modal, Pressable, View } from "react-native";
import { AppText as Text } from "@/components/ui/AppText";
import { useFocusEffect, useRouter } from "expo-router";

import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { confirmAction, notify } from "@/components/ui/dialogs";
import { useCollectionForm } from "@/features/collections/useCollectionForm";
import { useCollections } from "@/features/collections/useCollections";

type Editing = { id: string; name: string } | "new" | null;

export function CollectionList() {
    const router = useRouter();
    const { items, isLoading, load, remove } = useCollections();
    const [editing, setEditing] = useState<Editing>(null);

    useFocusEffect(
        useCallback(() => {
            void load();
        }, [load]),
    );

    const handleRemove = async (id: string, name: string) => {
        const ok = await confirmAction({
            title: "Xoá bộ sưu tập",
            message: `Xoá "${name}"? Các món đã lưu vẫn được giữ.`, // xác nhận câu này với backend
            confirmText: "Xoá",
            destructive: true,
        });
        if (!ok) return;
        const result = await remove(id);
        if (!result.ok) notify("Lỗi", result.message);
    };

    return (
        <View className="flex-1">
            <Button title="Tạo bộ sưu tập" onPress={() => setEditing("new")} />

            {isLoading && items.length === 0 ? (
                <ActivityIndicator />
            ) : items.length === 0 ? (
                <Text>Chưa có bộ sưu tập nào.</Text>
            ) : (
                items.map((item) => (
                    <View key={item.id} className="flex-row items-center justify-between py-3">
                        <Pressable className="flex-1" onPress={() => router.push(`/collection/${item.id}`)}>
                            <Text>{item.name}</Text>
                            <Text>{item.recipeCount} món</Text>
                        </Pressable>
                        <Pressable onPress={() => setEditing({ id: item.id, name: item.name })}>
                            <Text>Sửa</Text>
                        </Pressable>
                        <Pressable className="ml-3" onPress={() => void handleRemove(item.id, item.name)}>
                            <Text>Xoá</Text>
                        </Pressable>
                    </View>
                ))
            )}

            {/* Chỉ mount khi mở, kèm key: useCollectionForm lấy tên ban đầu từ useState nên phải mount mới mỗi lần. */}
            {editing !== null && (
                <CollectionDialog
                    key={editing === "new" ? "new" : editing.id}
                    collection={editing === "new" ? undefined : editing}
                    onClose={() => setEditing(null)}
                />
            )}
        </View>
    );
}

function CollectionDialog({
                              collection,
                              onClose,
                          }: {
    collection?: { id: string; name: string };
    onClose: () => void;
}) {
    const { name, error, setName, submit, isSubmitting } = useCollectionForm(collection);

    const handleSubmit = async () => {
        const result = await submit();
        if (result.ok) onClose();
        else if (!error) notify("Lỗi", result.message); // lỗi nhập đã hiện ở ô nhập
    };

    return (
        <Modal visible transparent animationType="fade" onRequestClose={onClose}>
            <View className="flex-1 items-center justify-center bg-black/40">
                <View className="w-4/5 gap-3 rounded-2xl bg-white p-4">
                    <TextField label="Tên bộ sưu tập" value={name} onChangeText={setName} error={error} />
                    <Button title={collection ? "Lưu" : "Tạo"} loading={isSubmitting} onPress={handleSubmit} />
                    <Button title="Huỷ" onPress={onClose} />
                </View>
            </View>
        </Modal>
    );
}