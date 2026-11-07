import { useEffect } from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
<<<<<<< HEAD
import { EmptyState } from "@/components/ui/EmptyState";
import { PageScreen } from "@/components/ui/PageScreen";
=======
import { Screen } from "@/components/ui/Screen";
import { BackHeader } from "@/components/recipe/BackHeader";
import { AppliedSubstituteInfo, SubstituteButton } from "@/components/recipe/SubstituteButton";
>>>>>>> ace6f51 (feat(ai): implement recipe substitution, adapt recipe, and fix meal plan creation)
import { cn } from "@/components/ui/cn";
import { showAlert } from "@/components/ui/dialogs";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { useCustomRecipeDetail } from "@/features/customRecipe/useCustomRecipeDetail";
<<<<<<< HEAD
import { useShopping } from "@/features/shopping/useShopping";
=======
import { formatIngredientAmount } from "@/features/recipe/recipeLabels";
import { useOpenAdaptedRecipe } from "@/features/ai/useOpenAdaptedRecipe";
import { useAppliedSubstitutions } from "@/features/ai/useAppliedSubstitutions";
>>>>>>> ace6f51 (feat(ai): implement recipe substitution, adapt recipe, and fix meal plan creation)

export default function CustomRecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
<<<<<<< HEAD
  const { brand } = useAppTheme();
  const { recipe, meta, ingredientLines, stepLines, isLoading, loadError, notFound, load, confirmAndRemove } =
    useCustomRecipeDetail(id);
=======
  const { palette, brand } = useAppTheme();
  const openAdapted = useOpenAdaptedRecipe();
  const {
    recipe,
    meta,
    ingredientLines,
    stepLines,
    isLoading,
    loadError,
    notFound,
    load,
    confirmAndRemove,
  } = useCustomRecipeDetail(id);
  const { adaptStepText } = useAppliedSubstitutions(recipe?.id, recipe?.title);
>>>>>>> ace6f51 (feat(ai): implement recipe substitution, adapt recipe, and fix meal plan creation)

  const { createFromRecipe, isSaving: isCreatingList } = useShopping();

  useEffect(() => {
    void load();
  }, [load]);

  // const handleCreateShoppingList = async () => {
  //   if (!recipe) return;
  //   const result = await createFromRecipe(recipe.id);
  //   if (result.ok) router.push(`/shopping/${result.data.id}` as Href);
  //   else showAlert("Chưa tạo được danh sách", result.message);
  // };

  const handleRemove = async () => {
    const result = await confirmAndRemove();
    if (!result) return;
    if (result.ok) router.back();
    else showAlert("Lỗi", result.message);
  };

  return (
    <PageScreen title={recipe?.title ?? "Công thức"}>
      {isLoading && !recipe ? <ActivityIndicator color={brand} className="py-6" /> : null}

      {notFound && !recipe ? (
        <>
          <EmptyState icon="alert-circle-outline" title="Không tìm thấy công thức" message={loadError ?? undefined} />
          <Button title="Về danh sách món tự tạo" onPress={() => router.replace("/recipe/custom" as Href)} />
        </>
      ) : null}

      {loadError && !notFound && !recipe ? (
        <Card className="items-center gap-3 p-4">
          <AppText variant="error" className="text-center">
            {loadError}
          </AppText>
<<<<<<< HEAD
          <Button title="Thử lại" variant="outline" onPress={() => void load()} className="self-stretch" />
=======
        </View>
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => changeServings(-1)}
            accessibilityLabel="Giảm khẩu phần"
            className="h-10 w-10 items-center justify-center rounded-full bg-soft dark:bg-soft-dark">
            <Ionicons name="remove" size={20} color={palette.ink} />
          </Pressable>
          <View className="min-w-8 items-center">
            <AppText variant="heading">{servings ?? "-"}</AppText>
          </View>
          <Pressable
            onPress={() => changeServings(1)}
            accessibilityLabel="Tăng khẩu phần"
            className="h-10 w-10 items-center justify-center rounded-full bg-soft dark:bg-soft-dark">
            <Ionicons name="add" size={20} color={palette.ink} />
          </Pressable>
        </View>
      </Card>

      {/* Nguyên liệu */}
      <View className="gap-2">
        <AppText variant="heading">Nguyên liệu</AppText>
        <Card className="overflow-hidden">
          {ingredientLines.map((line, index) => {
            const amount = amountLabelOf(line);
            return (
              <View
                key={line.id}
                className={cn(
                  "flex-row items-center justify-between gap-3 px-4 py-3",
                  index > 0 && "border-t border-line dark:border-line-dark",
                )}>
                <View className="flex-1">
                  <AppText className="font-medium">{line.name}</AppText>
                  <AppliedSubstituteInfo
                    recipeTitle={recipe.title}
                    recipeId={recipe.id}
                    ingredientName={line.name}
                  />
                </View>
                <View className="flex-row items-center gap-2">
                  {amount ? (
                    <AppText variant="caption" className="font-semibold">
                      {amount}
                    </AppText>
                  ) : null}
                  <SubstituteButton
                    recipeTitle={recipe.title}
                    recipeId={recipe.id}
                    ingredientName={line.name}
                  />
                </View>
              </View>
            );
          })}
>>>>>>> ace6f51 (feat(ai): implement recipe substitution, adapt recipe, and fix meal plan creation)
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
<<<<<<< HEAD
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
=======
            <AppText>{adaptStepText(step.text)}</AppText>
          </Card>
        ))}
      </View>

      {/* Hành động */}
      <View className="gap-3">
        <Button
          title="Bắt đầu nấu"
          disabled={stepLines.length === 0}
          onPress={() =>
            router.push({
              pathname: "/recipe/cooking",
              params: { id: recipe.id, custom: "1" },
            })
          }
        />
        <Button
          title="Thêm vào thực đơn"
          variant="secondary"
          onPress={() =>
            router.push({
              pathname: "/meal-plan/add-entry",
              params: {
                id: recipe.id,
                custom: "1",
                title: recipe.title,
                servings: String(servings ?? baseServings ?? 1),
              },
            })
          }
        />
        <Button
          title="Điều chỉnh theo nguyên liệu loại trừ"
          variant="outline"
          onPress={() => openAdapted(recipe.id)}
        />
        <Button
          title="Món tương tự"
          variant="outline"
          onPress={() =>
            router.push({
              pathname: "/recipe/similar",
              params: { id: recipe.id, custom: "1", title: recipe.title },
            })
          }
        />
>>>>>>> ace6f51 (feat(ai): implement recipe substitution, adapt recipe, and fix meal plan creation)

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
            {/* <Button
              title="Tạo danh sách mua"
              loading={isCreatingList}
              onPress={() => void handleCreateShoppingList()}
            /> */}
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
