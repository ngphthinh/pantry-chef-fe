// app/recipe/custom/[id].tsx  (CustomRecipeDetailScreen)
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";

import { SavedRecipeImage } from "@/components/saved/SavedRecipeImage";
import { AppText } from "@/components/ui/AppText";
import { BackHeader } from "@/components/ui/BackHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { cn } from "@/components/ui/cn";
import { showAlert } from "@/components/ui/dialogs";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { useCustomRecipeDetail } from "@/features/customRecipe/useCustomRecipeDetail";
import { useShopping } from "@/features/shopping/useShopping";

function SectionTitle({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  const { brand } = useAppTheme();
  return (
    <View className="flex-row items-center gap-2 px-1">
      <View className="h-8 w-8 items-center justify-center rounded-xl bg-brandSoft dark:bg-surface-dark">
        <Ionicons name={icon} size={16} color={brand} />
      </View>
      <AppText variant="heading" className="text-base">
        {label}
      </AppText>
    </View>
  );
}

export default function CustomRecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { brand } = useAppTheme();
  const {
    recipe,
    meta,
    ingredientLines,
    stepLines,
    isLoading,
    loadError,
    load,
    confirmAndRemove,
  } = useCustomRecipeDetail(id);

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
    <Screen>
      <BackHeader title="Công thức của tôi" fallbackHref={"/saved" as Href} />

      {isLoading && !recipe ? (
        <View className="items-center py-16">
          <ActivityIndicator size="large" color={brand} />
        </View>
      ) : null}

      {loadError && !recipe ? (
        <Card className="items-center gap-3 p-5 shadow-sm">
          <Ionicons name="alert-circle" size={32} color={brand} />
          <AppText variant="error" className="text-center">
            {loadError}
          </AppText>
          <Button
            title="Thử lại"
            variant="outline"
            onPress={() => void load()}
            className="self-stretch"
          />
        </Card>
      ) : null}

      {recipe ? (
        <View className="gap-5 pb-10">
          {/* Hero */}
          <SavedRecipeImage
            uri={recipe.imageUrl}
            className="h-56 w-full rounded-3xl"
          />

          {/* Title + badges */}
          <View className="gap-2">
            <AppText variant="title">{recipe.title}</AppText>
            <View className="flex-row flex-wrap items-center gap-2">
              {recipe.servings ? (
                <Badge tone="success" label={`${recipe.servings} khẩu phần`} />
              ) : null}
              {recipe.cuisine ? (
                <Badge tone="warn" label={recipe.cuisine.name} />
              ) : null}
              {meta ? <AppText variant="caption">{meta}</AppText> : null}
            </View>
          </View>

          {/* Ingredients */}
          <View className="gap-2.5">
            <SectionTitle icon="basket" label="Nguyên liệu" />
            <Card className="overflow-hidden shadow-sm">
              {ingredientLines.length === 0 ? (
                <AppText variant="caption" className="p-4">
                  Chưa có dữ liệu nguyên liệu.
                </AppText>
              ) : (
                ingredientLines.map((line, index) => (
                  <View
                    key={line.id}
                    className={cn(
                      "flex-row items-center justify-between gap-3 px-4 py-3",
                      index > 0 && "border-t border-line dark:border-line-dark",
                    )}>
                    <AppText className="flex-1 font-semibold">
                      {line.name}
                    </AppText>
                    <View className="rounded-full bg-brandSoft px-2.5 py-1 dark:bg-surface-dark">
                      <AppText className="text-xs font-bold text-brand">
                        {line.amountLabel}
                      </AppText>
                    </View>
                  </View>
                ))
              )}
            </Card>
          </View>

          {/* Steps */}
          <View className="gap-2.5">
            <SectionTitle icon="list" label="Các bước" />
            {stepLines.length === 0 ? (
              <AppText variant="caption" className="px-1">
                Chưa có dữ liệu các bước.
              </AppText>
            ) : (
              stepLines.map((step) => (
                <Card key={step.id} className="flex-row gap-3 p-4 shadow-sm">
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-brand">
                    <AppText className="font-bold text-white">
                      {step.order}
                    </AppText>
                  </View>
                  <View className="flex-1 gap-1.5">
                    <AppText>{step.text}</AppText>
                    {step.timerLabel ? (
                      <View className="flex-row items-center gap-1">
                        <Ionicons
                          name="timer-outline"
                          size={13}
                          color={brand}
                        />
                        <AppText variant="caption">{step.timerLabel}</AppText>
                      </View>
                    ) : null}
                  </View>
                </Card>
              ))
            )}
          </View>

          {/* Actions */}
          <View className="gap-3">
            <Button
              title="Tạo danh sách mua"
              loading={isCreatingList}
              onPress={() => void handleCreateShoppingList()}
            />
            <Button
              title="Sửa công thức"
              variant="primary"
              onPress={() =>
                router.push(`/recipe/custom/form?id=${recipe.id}` as Href)
              }
            />
            <Button
              title="Xoá công thức"
              variant="danger"
              onPress={() => void handleRemove()}
            />
          </View>
        </View>
      ) : null}
    </Screen>
  );
}
