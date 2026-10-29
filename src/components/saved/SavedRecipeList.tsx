// SavedRecipeList.tsx
import { useRef, type ReactElement } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { useRouter, type Href } from "expo-router";

import { SavedRecipeTile } from "@/components/saved/SavedRecipeTile";
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
  const {
    items,
    hasNext,
    error,
    isLoading,
    isLoadingMore,
    refresh,
    loadMore,
    toggleFavorite,
  } = useSavedList({ favorite: favoriteOnly ? true : undefined });

  const visible = favoriteOnly ? items.filter((i) => i.favorite) : items;

  // Chỉ loadMore sau khi người dùng thực sự cuộn (tránh bắn lúc mới mount / list ngắn)
  const userScrolled = useRef(false);

  const handleEndReached = () => {
    if (!userScrolled.current) return;
    if (!hasNext || isLoading || isLoadingMore || visible.length === 0) return;
    void loadMore();
  };

  const handleToggle = async (item: (typeof items)[number]) => {
    const result = await toggleFavorite(item);
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
    <AppText variant="caption" className="py-10 text-center">
      Chưa có món nào.
    </AppText>
  );

  return (
    <ListScreen
      data={visible}
      keyExtractor={(i) => String(i.id)}
      header={header}
      empty={empty}
      isLoadingMore={isLoadingMore}
      onEndReached={handleEndReached}
      onRefresh={() => void refresh()}
      numColumns={2}
      gap={12}
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
