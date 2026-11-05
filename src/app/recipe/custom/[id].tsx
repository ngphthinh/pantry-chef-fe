import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { BackHeader } from "@/components/recipe/BackHeader";
import { cn } from "@/components/ui/cn";
import { showAlert } from "@/components/ui/dialogs";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { useCustomRecipeDetail } from "@/features/customRecipe/useCustomRecipeDetail";
import { formatIngredientAmount } from "@/features/recipe/recipeLabels";

export default function CustomRecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { palette, brand } = useAppTheme();
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

  // Khẩu phần đang xem (quy đổi cục bộ vì món tự tạo không có API scale)
  const [servings, setServings] = useState<number | null>(null);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (recipe?.servings) setServings(recipe.servings);
  }, [recipe?.servings]);

  const baseServings = recipe?.servings ?? null;
  const isScaled = !!baseServings && !!servings && servings !== baseServings;
  const ratio = baseServings && servings ? servings / baseServings : 1;

  const changeServings = (delta: number) => {
    setServings((current) =>
      Math.max(1, (current ?? baseServings ?? 1) + delta),
    );
  };

  // Lấy số lượng gốc theo id để nhân tỉ lệ; nếu không có thì dùng nhãn có sẵn
  const amountLabelOf = (line: { id: string; amountLabel: string }) => {
    const source = (recipe as any)?.ingredients?.find(
      (i: any) => i.id === line.id,
    );
    if (source && typeof source.amount === "number") {
      return formatIngredientAmount(source.amount * ratio, source.unit);
    }
    return line.amountLabel;
  };

  const handleRemove = async () => {
    const result = await confirmAndRemove();
    if (!result) return;
    if (result.ok) router.back();
    else showAlert("Lỗi", result.message);
  };

  if (isLoading && !recipe) {
    return (
      <Screen>
        <BackHeader title="Công thức" />
        <ActivityIndicator color={brand} />
      </Screen>
    );
  }

  if (!recipe) {
    return (
      <Screen>
        <BackHeader title="Công thức" />
        <Card className="items-center gap-2 p-5">
          <AppText variant="error" className="text-center">
            {notFound ? "Không tìm thấy công thức" : loadError}
          </AppText>
          {notFound ? (
            <Button
              title="Về danh sách món tự tạo"
              variant="outline"
              onPress={() => router.replace("/recipe/custom" as Href)}
            />
          ) : (
            <Button
              title="Thử lại"
              variant="outline"
              onPress={() => void load()}
            />
          )}
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <BackHeader title={recipe.title} />

      {recipe.imageUrl ? (
        <Image
          source={{ uri: recipe.imageUrl }}
          className="h-52 w-full rounded-3xl bg-soft dark:bg-soft-dark"
        />
      ) : null}

      <View className="gap-2">
        {meta ? <AppText variant="caption">{meta}</AppText> : null}
        <View className="flex-row flex-wrap gap-2">
          {recipe.cuisine ? (
            <Badge label={recipe.cuisine.name} tone="warn" />
          ) : null}
          {isScaled ? (
            <Badge label="Đã quy đổi khẩu phần" tone="success" />
          ) : null}
        </View>
      </View>

      {/* Khẩu phần */}
      <Card className="flex-row items-center justify-between p-4">
        <View>
          <AppText className="font-bold">Khẩu phần</AppText>
          <AppText variant="caption">
            Số lượng nguyên liệu tự điều chỉnh
          </AppText>
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
          {ingredientLines.map((line, index) => (
            <View
              key={line.id}
              className={cn(
                "flex-row items-center justify-between gap-3 px-4 py-3",
                index > 0 && "border-t border-line dark:border-line-dark",
              )}>
              <AppText className="flex-1">{line.name}</AppText>
              <AppText variant="caption" className="font-semibold">
                {amountLabelOf(line)}
              </AppText>
            </View>
          ))}
        </Card>
      </View>

      {/* Cách làm */}
      <View className="gap-2">
        <AppText variant="heading">Cách làm</AppText>
        {stepLines.map((step) => (
          <Card key={step.id} className="gap-1 p-4">
            <View className="flex-row items-center justify-between">
              <AppText variant="label">Bước {step.order}</AppText>
              {step.timerLabel ? (
                <Badge label={step.timerLabel} tone="success" />
              ) : null}
            </View>
            <AppText>{step.text}</AppText>
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
          title="Món tương tự"
          variant="outline"
          onPress={() =>
            router.push({
              pathname: "/recipe/similar",
              params: { id: recipe.id, custom: "1", title: recipe.title },
            })
          }
        />

        {/* Riêng cho công thức tự tạo */}
        <Button
          title="Sửa công thức"
          variant="outline"
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
    </Screen>
  );
}
