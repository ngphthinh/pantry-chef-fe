import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import type { ReactElement } from "react";

import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { brand } from "@/core/theme/colors";
import { notify } from "@/core/ui/dialogs";
import { useSavedList } from "@/features/savedRecipes/useSavedList";

export function SavedRecipeGrid({
  favoriteOnly = false,
  header,
}: {
  favoriteOnly?: boolean;
  /** Tiêu đề / tab / bộ lọc phía trên lưới. Truyền ELEMENT. */
  header?: ReactElement;
}) {
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

  const handleToggle = async (item: (typeof items)[number]) => {
    const result = await toggleFavorite(item);
    if (!result.ok) notify("Lỗi", result.message);
  };

  const handleEndReached = () => {
    if (hasNext && !isLoading && !isLoadingMore && visible.length > 0) {
      void loadMore();
    }
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
    <FlatList
      data={visible}
      keyExtractor={(r) => String(r.id)}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ListFooterComponent={
        isLoadingMore ? (
          <View className="items-center p-4">
            <ActivityIndicator color={brand.DEFAULT} />
          </View>
        ) : undefined
      }
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.4}
      onRefresh={() => void refresh()}
      refreshing={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ gap: 12, paddingBottom: 32 }}
      renderItem={({ item: r }) => (
        <Pressable
          className="w-[48.5%]"
          onPress={() => router.push(`/recipe/saved/${r.id}` as Href)}>
          <Card className="overflow-hidden">
            <View className="h-28 bg-soft dark:bg-soft-dark" />
            <View className="flex-row items-center justify-between gap-2 p-3">
              <AppText className="flex-1 font-bold" numberOfLines={2}>
                {r.recipeTitle}
              </AppText>
              <Pressable hitSlop={8} onPress={() => void handleToggle(r)}>
                <Ionicons
                  name={r.favorite ? "heart" : "heart-outline"}
                  size={20}
                  color={brand.DEFAULT}
                />
              </Pressable>
            </View>
          </Card>
        </Pressable>
      )}
    />
  );
}
