// components/ui/CollectionList.tsx
import { useCallback, useRef, useState, type ReactElement } from "react";
import { ActivityIndicator, Modal, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter, type Href } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ListScreen } from "@/components/ui/ListScreen";
import { TextField } from "@/components/ui/TextField";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { confirmAction, notify } from "@/core/ui/dialogs";
import { useCollectionForm } from "@/features/collections/useCollectionForm";
import { useCollections } from "@/features/collections/useCollections";

type Editing = { id: string; name: string } | "new" | null;

interface CollectionItem {
  id: string;
  name: string;
  recipeCount: number;
}

function CollectionRow({
  item,
  index,
  onPress,
  onEdit,
  onDelete,
}: {
  item: CollectionItem;
  index: number;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { brand, palette } = useAppTheme();
  const tones = [brand, palette.warnInk, palette.successInk, palette.muted];
  const color = tones[index % tones.length];

  return (
    <Card className="flex-row items-center overflow-hidden shadow-sm">
      <View
        className="self-stretch"
        style={{ width: 5, backgroundColor: color }}
      />

      <Pressable
        className="flex-1 flex-row items-center gap-3 p-3.5 active:opacity-70"
        onPress={onPress}>
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${color}22` }}>
          <Ionicons name="folder" size={22} color={color} />
        </View>
        <View className="flex-1 gap-1">
          <AppText variant="heading" className="text-base" numberOfLines={1}>
            {item.name}
          </AppText>
          <View className="flex-row items-center gap-1 self-start rounded-full bg-soft px-2.5 py-0.5 dark:bg-soft-dark">
            <Ionicons
              name="restaurant-outline"
              size={12}
              color={palette.muted}
            />
            <AppText variant="caption" className="font-semibold">
              {`${item.recipeCount} món`}
            </AppText>
          </View>
        </View>
      </Pressable>

      <View className="flex-row items-center gap-2 pr-3.5">
        <Pressable
          hitSlop={8}
          onPress={onEdit}
          accessibilityLabel={`Đổi tên ${item.name}`}
          className="h-9 w-9 items-center justify-center rounded-full bg-brandSoft active:scale-90 dark:bg-surface-dark">
          <Ionicons name="create-outline" size={18} color={brand} />
        </Pressable>
        <Pressable
          hitSlop={8}
          onPress={onDelete}
          accessibilityLabel={`Xoá ${item.name}`}
          className="h-9 w-9 items-center justify-center rounded-full bg-dangerBg active:scale-90 dark:bg-dangerBg-dark">
          <Ionicons name="trash-outline" size={18} color={palette.dangerInk} />
        </Pressable>
      </View>
    </Card>
  );
}

export function CollectionList({ header }: { header?: ReactElement }) {
  const router = useRouter();
  const { brand } = useAppTheme();
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

  const listHeader = (
    <View className="gap-4">
      {header}

      <Card className="flex-row items-center gap-3 bg-brandSoft/50 p-4 shadow-sm dark:bg-surface-dark">
        <View className="h-11 w-11 items-center justify-center rounded-2xl bg-surface dark:bg-soft-dark">
          <Ionicons name="albums" size={22} color={brand} />
        </View>
        <View className="flex-1">
          <AppText variant="heading" className="text-base">
            Bộ sưu tập
          </AppText>
          <AppText variant="caption">Gom các món đã lưu theo chủ đề</AppText>
        </View>
        <Pressable
          onPress={() => setEditing("new")}
          accessibilityLabel="Tạo bộ sưu tập"
          className="flex-row items-center gap-1 rounded-full bg-brand px-3.5 py-2 active:scale-95">
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <AppText className="text-xs font-bold text-white">Tạo mới</AppText>
        </Pressable>
      </Card>

      {items.length > 0 ? (
        <View className="flex-row items-center justify-between px-1">
          <AppText
            variant="label"
            className="text-xs font-bold uppercase tracking-wider text-muted dark:text-muted-dark">
            Bộ sưu tập của bạn
          </AppText>
          <View className="rounded-full bg-brandSoft px-2.5 py-1 dark:bg-surface-dark">
            <AppText className="text-xs font-bold text-brand">
              {items.length}
            </AppText>
          </View>
        </View>
      ) : null}
    </View>
  );

  const empty = isLoading ? (
    <View className="items-center py-10">
      <ActivityIndicator size="large" color={brand} />
      <AppText variant="caption" className="mt-3">
        Đang tải bộ sưu tập...
      </AppText>
    </View>
  ) : (
    <Card className="items-center gap-2 p-8 shadow-sm">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-brandSoft dark:bg-soft-dark">
        <Ionicons name="folder-open" size={30} color={brand} />
      </View>
      <AppText variant="heading" className="mt-1">
        Chưa có bộ sưu tập
      </AppText>
      <AppText variant="caption" className="text-center">
        Hãy tạo bộ sưu tập đầu tiên để sắp xếp món đã lưu.
      </AppText>
    </Card>
  );

  return (
    <>
      <ListScreen
        data={items}
        keyExtractor={(i) => i.id}
        header={listHeader}
        empty={empty}
        onRefresh={() => void load()}
        renderItem={({ item, index }) => (
          <CollectionRow
            item={item}
            index={index}
            onPress={() =>
              router.push(
                `/collection/${item.id}?name=${encodeURIComponent(item.name)}` as Href,
              )
            }
            onEdit={() => setEditing({ id: item.id, name: item.name })}
            onDelete={() => void handleRemove(item.id, item.name)}
          />
        )}
      />

      {/* Chỉ mount khi mở, kèm key: tên ban đầu lấy từ useState nên phải mount mới mỗi lần. */}
      {editing !== null && (
        <CollectionDialog
          key={editing === "new" ? "new" : editing.id}
          collection={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}

export function CollectionDialog({
  collection,
  onClose,
}: {
  collection?: { id: string; name: string };
  onClose: () => void;
}) {
  const { brand } = useAppTheme();
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
      <View className="flex-1 items-center justify-center bg-black/50 px-6">
        <View className="w-full gap-4 rounded-3xl bg-surface p-5 shadow-2xl dark:bg-surface-dark">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-brandSoft dark:bg-soft-dark">
              <Ionicons
                name={collection ? "create" : "folder-open"}
                size={22}
                color={brand}
              />
            </View>
            <AppText variant="heading" className="flex-1">
              {collection ? "Đổi tên bộ sưu tập" : "Tạo bộ sưu tập"}
            </AppText>
            <Pressable hitSlop={10} onPress={onClose}>
              <Ionicons name="close" size={22} color={brand} />
            </Pressable>
          </View>

          <TextField
            label="Tên bộ sưu tập"
            placeholder="Ví dụ: Món ăn cuối tuần"
            value={name}
            onChangeText={setName}
            error={error}
          />

          <View className="flex-row gap-3">
            <Button
              title="Huỷ"
              variant="outline"
              className="flex-1"
              onPress={onClose}
            />
            <Button
              title={collection ? "Lưu" : "Tạo"}
              className="flex-1"
              loading={isSubmitting}
              disabled={isSubmitting}
              onPress={handleSubmit}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
