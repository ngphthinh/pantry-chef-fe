import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter, type Href } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { brand } from "@/core/theme/colors";
import { confirmAction, notify } from "@/core/ui/dialogs";
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
      message: `Xoá "${name}"? Các món đã lưu vẫn được giữ.`,
      confirmText: "Xoá",
      destructive: true,
    });
    if (!ok) return;
    const result = await remove(id);
    if (!result.ok) notify("Lỗi", result.message);
  };

  
  return (
    <View className="gap-3">
      <Button title="Tạo bộ sưu tập" onPress={() => setEditing("new")} />

      {isLoading && items.length === 0 ? (
        <ActivityIndicator color={brand.DEFAULT} />
      ) : items.length === 0 ? (
        <Card className="items-center gap-2 p-6">
          <Ionicons
            name="folder-open-outline"
            size={32}
            color={brand.DEFAULT}
          />
          <AppText variant="caption">
            Chưa có bộ sưu tập nào. Hãy tạo bộ sưu tập đầu tiên.
          </AppText>
        </Card>
      ) : (
        items.map((item) => (
          <Card key={item.id} className="flex-row items-center gap-3 p-3">
            <TouchableOpacity
              className="flex-1 flex-row items-center gap-3"
              onPress={() =>
                router.push(
                  `/collection/${item.id}?name=${encodeURIComponent(item.name)}` as Href,
                )
              }>
              <View className="h-12 w-12 items-center justify-center rounded-xl bg-brandSoft">
                <Ionicons
                  name="folder-outline"
                  size={24}
                  color={brand.DEFAULT}
                />
              </View>
              <View className="flex-1">
                <AppText className="font-bold" numberOfLines={1}>
                  {item.name}
                </AppText>
                <AppText variant="caption">{`${item.recipeCount} món`}</AppText>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              hitSlop={8}
              onPress={() => setEditing({ id: item.id, name: item.name })}>
              <Ionicons name="create-outline" size={22} color={brand.DEFAULT} />
            </TouchableOpacity>
            <TouchableOpacity
              hitSlop={8}
              onPress={() => void handleRemove(item.id, item.name)}>
              <Ionicons name="trash-outline" size={22} color="#DC2626" />
            </TouchableOpacity>
          </Card>
        ))
      )}

      {/* Chỉ mount khi mở, kèm key: tên ban đầu lấy từ useState nên phải mount mới mỗi lần. */}
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
import { useRef } from "react";

export function CollectionDialog({
  collection,
  onClose,
}: {
  collection?: { id: string; name: string };
  onClose: () => void;
}) {
  const { name, error, setName, submit, isSubmitting } =
    useCollectionForm(collection);
  const submittingRef = useRef(false);

  const handleSubmit = async () => {
    if (submittingRef.current) return; // chặn gọi trùng
    submittingRef.current = true;
    try {
      const result = await submit();
      if (result.ok) onClose();
      else if (!error) notify("Lỗi", result.message);
    } finally {
      submittingRef.current = false;
    }
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/40 px-6">
        <View className="w-full gap-4 rounded-2xl bg-surface p-5">
          <AppText variant="heading">
            {collection ? "Đổi tên bộ sưu tập" : "Tạo bộ sưu tập"}
          </AppText>
          <TextField
            label="Tên bộ sưu tập"
            value={name}
            onChangeText={setName}
            error={error}
          />
          <Button
            title={collection ? "Lưu" : "Tạo"}
            loading={isSubmitting}
            disabled={isSubmitting}
            onPress={handleSubmit}
          />
          <Pressable className="items-center py-1" onPress={onClose}>
            <AppText className="font-bold text-brand">Huỷ</AppText>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
