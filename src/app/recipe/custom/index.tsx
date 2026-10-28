import { useCallback } from "react";
import { ActivityIndicator, Image, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter, type Href } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageScreen } from "@/components/ui/PageScreen";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { useCustomRecipe } from "@/features/customRecipe/useCustomRecipe";

export default function CustomRecipesScreen() {
  const router = useRouter();
  const { palette, brand } = useAppTheme();
  const { recipes, hasNext, isLoading, isLoadingMore, loadError, load, loadMore } = useCustomRecipe();

  // Tải lại mỗi lần quay về (ví dụ sau khi tạo/sửa/xoá).
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const openForm = () => router.push("/recipe/custom/form" as Href);

  return (
    <PageScreen
      title="Món tự tạo"
      right={
        <Pressable onPress={openForm} hitSlop={10} accessibilityRole="button" accessibilityLabel="Tạo món mới">
          <Ionicons name="add-circle" size={30} color={brand} />
        </Pressable>
      }
    >
      {loadError ? (
        <Card className="items-center gap-3 p-4">
          <AppText variant="error" className="text-center">
            {loadError}
          </AppText>
          <Button title="Thử lại" variant="outline" onPress={() => void load()} className="self-stretch" />
        </Card>
      ) : null}

      {isLoading && recipes.length === 0 ? <ActivityIndicator color={brand} className="py-6" /> : null}

      {!isLoading && !loadError && recipes.length === 0 ? (
        <>
          <EmptyState
            icon="create-outline"
            title="Bạn chưa tạo món nào"
            message="Ghi lại công thức gia truyền của bạn để nấu lại bất cứ lúc nào."
          />
          <Button title="Tạo món đầu tiên" onPress={openForm} />
        </>
      ) : null}

      {recipes.map((recipe) => (
        <Pressable key={recipe.id} onPress={() => router.push(`/recipe/custom/${recipe.id}` as Href)}>
          <Card className="flex-row items-center gap-3 overflow-hidden p-3">
            {recipe.imageUrl ? (
              <Image source={{ uri: recipe.imageUrl }} className="h-20 w-20 rounded-2xl" resizeMode="cover" />
            ) : (
              <View className="h-20 w-20 items-center justify-center rounded-2xl bg-soft dark:bg-soft-dark">
                <Ionicons name="restaurant-outline" size={28} color={brand} />
              </View>
            )}
            <View className="flex-1 gap-1">
              <AppText className="font-bold" numberOfLines={2}>
                {recipe.title}
              </AppText>
              {recipe.meta ? <AppText variant="caption">{recipe.meta}</AppText> : null}
            </View>
            <Ionicons name="chevron-forward" size={18} color={palette.muted} />
          </Card>
        </Pressable>
      ))}

      {hasNext ? (
        <Button
          variant="outline"
          title={isLoadingMore ? "Đang tải..." : "Xem thêm"}
          disabled={isLoadingMore}
          onPress={() => void loadMore()}
        />
      ) : null}
    </PageScreen>
  );
}
