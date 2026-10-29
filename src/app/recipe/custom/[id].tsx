import { useEffect } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageScreen } from "@/components/ui/PageScreen";
import { cn } from "@/components/ui/cn";
import { showAlert } from "@/components/ui/dialogs";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { useCustomRecipeDetail } from "@/features/customRecipe/useCustomRecipeDetail";
import { useShopping } from "@/features/shopping/useShopping";

export default function CustomRecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { brand } = useAppTheme();
  const { recipe, meta, ingredientLines, stepLines, isLoading, loadError, load, confirmAndRemove } =
    useCustomRecipeDetail(id);

  const { createFromRecipe, isSaving: isCreatingList } = useShopping();

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreateShoppingList = async () => {
    if (!recipe) return;
    const result = await createFromRecipe(recipe.id);
    if (result.ok) router.push(`/shopping/${result.data.id}` as Href);
    else showAlert("Chưa tạo được danh sách", result.message);
  };

  const handleRemove = async () => {
    const result = await confirmAndRemove();
    if (!result) return;
    if (result.ok) router.back();
    else showAlert("Lỗi", result.message);
  };

  return (
    <PageScreen title={recipe?.title ?? "Công thức"}>
      {isLoading && !recipe ? <ActivityIndicator color={brand} className="py-6" /> : null}

      {loadError && !recipe ? (
        <Card className="items-center gap-3 p-4">
          <AppText variant="error" className="text-center">
            {loadError}
          </AppText>
          <Button title="Thử lại" variant="outline" onPress={() => void load()} className="self-stretch" />
        </Card>
      ) : null}

      {recipe ? (
        <>
          {recipe.imageUrl ? (
            <Image source={{ uri: recipe.imageUrl }} className="h-52 w-full rounded-3xl" resizeMode="cover" />
          ) : null}

          <View className="gap-2">
            <AppText variant="title">{recipe.title}</AppText>
            <View className="flex-row flex-wrap items-center gap-2">
              {recipe.servings ? <Badge tone="success" label={`${recipe.servings} khẩu phần`} /> : null}
              {recipe.cuisine ? <Badge tone="warn" label={recipe.cuisine.name} /> : null}
              {meta ? <AppText variant="caption">{meta}</AppText> : null}
            </View>
          </View>

          <View className="gap-2">
            <AppText variant="label">Nguyên liệu</AppText>
            <Card className="overflow-hidden">
              {ingredientLines.map((line, index) => (
                <View
                  key={line.id}
                  className={cn(
                    "flex-row items-center justify-between gap-3 px-4 py-3",
                    index > 0 && "border-t border-line dark:border-line-dark",
                  )}
                >
                  <AppText className="flex-1 font-semibold">{line.name}</AppText>
                  <AppText variant="caption">{line.amountLabel}</AppText>
                </View>
              ))}
            </Card>
          </View>

          <View className="gap-2">
            <AppText variant="label">Các bước</AppText>
            {stepLines.map((step) => (
              <Card key={step.id} className="flex-row gap-3 p-4">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-brand">
                  <AppText className="font-bold text-white">{step.order}</AppText>
                </View>
                <View className="flex-1 gap-1">
                  <AppText>{step.text}</AppText>
                  {step.timerLabel ? <AppText variant="caption">Hẹn giờ: {step.timerLabel}</AppText> : null}
                </View>
              </Card>
            ))}
          </View>

          <View className="gap-3">
            <Button
              title="Tạo danh sách mua"
              loading={isCreatingList}
              onPress={() => void handleCreateShoppingList()}
            />
            <Button
              title="Sửa công thức"
              variant="outline"
              onPress={() => router.push(`/recipe/custom/form?id=${recipe.id}` as Href)}
            />
            <Button title="Xoá công thức" variant="danger" onPress={() => void handleRemove()} />
          </View>
        </>
      ) : null}
    </PageScreen>
  );
}
