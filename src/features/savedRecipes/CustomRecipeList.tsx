import { useCallback, useRef, type ReactElement } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter, type Href } from "expo-router";

import { SavedRecipeImage } from "@/components/saved/SavedRecipeImage";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { ListScreen } from "@/components/ui/ListScreen";
import { brand } from "@/core/theme/colors";
import {
  useCustomRecipe,
  type CustomRecipeRow,
} from "@/features/customRecipe/useCustomRecipe";

function CustomRecipeTile({
  item,
  onPress,
}: {
  item: CustomRecipeRow;
  onPress: () => void;
}) {
  return (
    <Pressable style={{ flex: 1, maxWidth: "48.5%" }} onPress={onPress}>
      <Card className="overflow-hidden">
        <SavedRecipeImage uri={item.imageUrl} className="h-28 w-full" />
        {/* Cao cố định: 2 dòng tiêu đề + 1 dòng meta -> mọi card bằng nhau */}
        <View className="h-[84px] justify-center p-3">
          <AppText className="font-bold" numberOfLines={2}>
            {item.title}
          </AppText>
          <AppText variant="caption" numberOfLines={1}>
            {item.meta}
          </AppText>
        </View>
      </Card>
    </Pressable>
  );
}

export function CustomRecipeList({ header }: { header: ReactElement }) {
  const router = useRouter();
  const {
    recipes,
    hasNext,
    isLoading,
    isLoadingMore,
    loadError,
    load,
    loadMore,
  } = useCustomRecipe();

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const userScrolled = useRef(false);

  const handleEndReached = () => {
    if (!userScrolled.current) return;
    if (!hasNext || isLoading || isLoadingMore || recipes.length === 0) return;
    void loadMore();
  };

  const empty = isLoading ? (
    <View className="items-center py-10">
      <ActivityIndicator color={brand.DEFAULT} />
    </View>
  ) : loadError ? (
    <View className="items-center gap-3 py-10">
      <AppText variant="caption">{loadError}</AppText>
      <Pressable onPress={() => void load()}>
        <AppText className="font-bold text-brand">Thử lại</AppText>
      </Pressable>
    </View>
  ) : (
    <View className="items-center gap-3 py-10">
      <AppText variant="caption">Bạn chưa tạo công thức nào.</AppText>
      <Pressable
        onPress={() => router.push("/recipe/custom/form" as Href)}
        className="flex-row items-center gap-1.5">
        <Ionicons name="add-circle" size={18} color={brand.DEFAULT} />
        <AppText className="font-bold text-brand">Tạo công thức</AppText>
      </Pressable>
    </View>
  );

  return (
    <ListScreen
      data={recipes}
      keyExtractor={(i) => i.id}
      header={header}
      empty={empty}
      isLoadingMore={isLoadingMore}
      onEndReached={handleEndReached}
      onScrollBeginDrag={() => {
        userScrolled.current = true;
      }}
      onRefresh={() => void load()}
      numColumns={2}
      gap={12}
      renderItem={({ item }) => (
        <CustomRecipeTile
          item={item}
          onPress={() => router.push(`/recipe/custom/${item.id}` as Href)}
        />
      )}
    />
  );
}
