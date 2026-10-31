import { useState, type ReactElement } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { useRouter, type Href } from "expo-router";

import { SavedRecipeTile } from "@/components/saved/SavedRecipeTile";
import { AppText } from "@/components/ui/AppText";
import { ListScreen } from "@/components/ui/ListScreen";
import { TextField } from "@/components/ui/TextField";
import { cn } from "@/components/ui/cn";
import {useDebouncedValue} from "@/core/hooks/useDebounceValue";
import { brand } from "@/core/theme/colors";
import { confirmAction, notify } from "@/core/ui/dialogs";
import { useSavedList } from "@/features/savedRecipes/useSavedList";

interface Props {
  favoriteOnly?: boolean;
  header: ReactElement;
}

const RATING_FILTERS = [
  { label: "Mọi sao", value: undefined },
  { label: "từ 3★", value: 3 },
  { label: "từ 4★", value: 4 },
  { label: "5★", value: 5 },
] as const;

export function SavedRecipeList({ favoriteOnly = false, header }: Props) {
  const router = useRouter();

  const [text, setText] = useState("");
  const [minRating, setMinRating] = useState<number | undefined>();
  const keyword = useDebouncedValue(text.trim(), 400);

  const {
    items,
    error,
    isLoading,
    isLoadingMore,
    refresh,
    loadMore,
    toggleFavorite,
    remove,
  } = useSavedList({
    favorite: favoriteOnly ? true : undefined,
    keyword,
    minRating,
  });

  const isFiltering = keyword !== "" || minRating !== undefined;
  const visible = favoriteOnly ? items.filter((i) => i.favorite) : items;

  const handleEndReached = () => {
    if (visible.length === 0 || isLoading || isLoadingMore) return;
    void loadMore(); // hook đã tự chặn khi hết trang
  };

  const handleToggle = async (item: (typeof items)[number]) => {
    const result = await toggleFavorite(item);
    if (!result.ok) notify("Lỗi", result.message);
  };

  const handleRemove = async (item: (typeof items)[number]) => {
    const ok = await confirmAction({
      title: "Bỏ lưu món",
      message: `Bỏ lưu "${item.recipeTitle}"?`,
      confirmText: "Bỏ lưu",
      destructive: true,
    });
    if (!ok) return;
    const result = await remove(item.id);
    if (!result.ok) notify("Lỗi", result.message);
  };

  const empty = isLoading ? (
      <View className="items-center py-10">
        <ActivityIndicator color={brand.DEFAULT} />
      </View>
  ) : error ? (
      <View className="items-center gap-3 py-10">
        <AppText variant="caption">{error}</AppText>
        <Pressable onPress={() => void refresh()}>
          <AppText className="font-bold text-brand">Thử lại</AppText>
        </Pressable>
      </View>
  ) : (
      <AppText variant="caption">
        {isFiltering ? "Không có món nào khớp." : "Chưa có món nào."}
      </AppText>
  );

  const listHeader = (
      <View className="gap-3">
        {header}
        <TextField
            label="Tìm món"
            value={text}
            onChangeText={setText}
            placeholder="Nhập tên món..."
        />
        <View className="flex-row flex-wrap gap-2">
          {RATING_FILTERS.map((f) => (
              <Pressable
                  key={f.label}
                  onPress={() => setMinRating(f.value)}
                  className={cn(
                      "rounded-full px-3 py-1.5",
                      f.value === minRating ? "bg-brand" : "bg-soft dark:bg-soft-dark",
                  )}
              >
                <AppText className={cn("text-sm font-bold", f.value === minRating && "text-white")}>
                  {f.label}
                </AppText>
              </Pressable>
          ))}
        </View>
      </View>
  );

  return (
      <ListScreen
          data={visible}
          keyExtractor={(i) => String(i.id)}
          header={listHeader}
          empty={empty}
          isLoadingMore={isLoadingMore}
          onEndReached={handleEndReached}
          numColumns={2}
          renderItem={({ item }) => (
              <SavedRecipeTile
                  item={item}
                  onPress={() => router.push(`/recipe/saved/${item.id}` as Href)}
                  onToggleFavorite={() => void handleToggle(item)}
                  onRemove={() => void handleRemove(item)}
              />
          )}
      />
  );
}