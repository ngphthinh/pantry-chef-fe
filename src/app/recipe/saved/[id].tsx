// app/recipe/saved/[id].tsx  (SavedRecipeScreen)
import { useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";

import { SavedRecipeImage } from "@/components/saved/SavedRecipeImage";
import { AddToCollectionModal } from "@/components/ui/AddToCollectionModal";
import { AppText } from "@/components/ui/AppText";
import { BackHeader } from "@/components/ui/BackHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { cn } from "@/components/ui/cn";
import {confirmAction, notify } from "@/core/ui/dialogs";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { useSavedRecipeForm } from "@/features/savedRecipes/useSavedRecipeForm";

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

export default function SavedRecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { brand } = useAppTheme();
  const {
    recipe,
    values,
    errors,
    setField,
    submit,
      remove,
    isDirty,
    isLoading,
    isSubmitting,
    loadError,
  } = useSavedRecipeForm(id);
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleSave = async () => {
    const result = await submit();
    if (result.ok) router.back();
    else notify("Lỗi", result.message);
  };

  const handleRemove = async () => {
    const ok = await confirmAction({
      title: "Bỏ lưu món",
      message: `Bỏ lưu "${recipe?.title ?? "món này"}"?`,
      confirmText: "Bỏ lưu",
      destructive: true,
    });
    if (!ok) return;
    const result = await remove();
    if (result.ok) router.back();
    else notify("Lỗi", result.message);
  };

  if (isLoading) {
    return (
      <Screen>
        <BackHeader title="Món đã lưu" fallbackHref={"/saved" as Href} />
        <View className="items-center py-16">
          <ActivityIndicator size="large" color={brand} />
        </View>
      </Screen>
    );
  }

  if (!recipe) {
    return (
      <Screen>
        <BackHeader title="Món đã lưu" fallbackHref={"/saved" as Href} />
        <Card className="items-center gap-3 p-5 shadow-sm">
          <Ionicons name="alert-circle" size={32} color={brand} />
          <AppText variant="caption" className="text-center">
            {loadError ?? "Không tìm thấy món đã lưu."}
          </AppText>
        </Card>
      </Screen>
    );
  }

  const ingredients = recipe.ingredients;
  const steps = recipe.steps;

  return (
    <Screen>
      <BackHeader title="Món đã lưu" fallbackHref={"/saved" as Href} />

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
            {recipe.readyInMinutes ? (
              <AppText variant="caption">{recipe.readyInMinutes} phút</AppText>
            ) : null}
          </View>
        </View>

        {/* Rating + favorite */}
        <View className="gap-2.5">
          <SectionTitle icon="star" label="Đánh giá của bạn" />
          <Card className="flex-row items-center justify-between p-4 shadow-sm">
            <View className="flex-row gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Pressable
                  key={n}
                  hitSlop={6}
                  className="active:scale-90"
                  onPress={() =>
                    setField("rating", values.rating === n ? 0 : n)
                  }>
                  <Ionicons
                    name={n <= values.rating ? "star" : "star-outline"}
                    size={26}
                    color={brand}
                  />
                </Pressable>
              ))}
            </View>
            <Pressable
              hitSlop={8}
              className="h-10 w-10 items-center justify-center rounded-full bg-brandSoft active:scale-90 dark:bg-surface-dark"
              onPress={() => setField("favorite", !values.favorite)}>
              <Ionicons
                name={values.favorite ? "heart" : "heart-outline"}
                size={22}
                color={brand}
              />
            </Pressable>
          </Card>
          {errors.rating ? (
            <AppText variant="caption" className="px-1">
              {errors.rating}
            </AppText>
          ) : null}
        </View>

        {/* Note */}
        <View className="gap-2.5">
          <SectionTitle icon="create" label="Ghi chú" />
          <TextField
            value={values.note}
            onChangeText={(t) => setField("note", t)}
            error={errors.note}
            placeholder="Thêm ghi chú cho món này..."
            multiline
          />
          <Button
            title="Thêm vào bộ sưu tập"
            variant="outline"
            onPress={() => setPickerOpen(true)}
          />
        </View>

        {/* Ingredients */}
        <View className="gap-2.5">
          <SectionTitle icon="basket" label="Nguyên liệu" />
          <Card className="overflow-hidden shadow-sm">
            {ingredients.length === 0 ? (
              <AppText variant="caption" className="p-4">
                Chưa có dữ liệu nguyên liệu.
              </AppText>
            ) : (
              ingredients.map((ing, index) => {
                const amount = [ing.amount, ing.unit]
                  .filter((v) => v != null && String(v).trim() !== "")
                  .join(" ");
                return (
                  <View
                    key={ing.id}
                    className={cn(
                      "flex-row items-center justify-between gap-3 px-4 py-3",
                      index > 0 && "border-t border-line dark:border-line-dark",
                    )}>
                    <AppText className="flex-1 font-semibold">
                      {ing.name}
                    </AppText>
                    {amount ? (
                      <View className="rounded-full bg-brandSoft px-2.5 py-1 dark:bg-surface-dark">
                        <AppText className="text-xs font-bold text-brand">
                          {amount}
                        </AppText>
                      </View>
                    ) : null}
                  </View>
                );
              })
            )}
          </Card>
        </View>

        {/* Steps */}
        <View className="gap-2.5">
          <SectionTitle icon="list" label="Các bước" />
          {steps.length === 0 ? (
            <AppText variant="caption" className="px-1">
              Chưa có dữ liệu các bước.
            </AppText>
          ) : (
            steps.map((s, index) => (
              <Card key={s.id} className="flex-row gap-3 p-4 shadow-sm">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-brand">
                  <AppText className="font-bold text-white">
                    {index + 1}
                  </AppText>
                </View>
                <View className="flex-1">
                  <AppText>{s.text}</AppText>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Actions */}
        <Button
          title="Lưu thay đổi"
          variant="primary"
          loading={isSubmitting}
          disabled={!isDirty}
          onPress={handleSave}
        />
        <Pressable className="items-center py-3" onPress={() => void handleRemove()}>
          <AppText className="font-bold text-danger">Bỏ lưu món này</AppText>
        </Pressable>
      </View>

      <AddToCollectionModal
        visible={pickerOpen}
        savedRecipeId={id}
        onClose={() => setPickerOpen(false)}
      />
    </Screen>
  );
}
