import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { BackHeader } from '@/components/recipe/BackHeader';
import { AppliedSubstituteInfo, SubstituteButton } from '@/components/recipe/SubstituteButton';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { formatIngredientAmount, formatTimer, recipeMetaLabel } from '@/features/recipe/recipeLabels';
import { useRecipeDetail } from '@/features/recipe/useRecipeDetail';
import { useOpenAdaptedRecipe } from '@/features/ai/useOpenAdaptedRecipe';
import { useAppliedSubstitutions } from '@/features/ai/useAppliedSubstitutions';

export default function ExternalRecipeDetailScreen() {
  const { externalId } = useLocalSearchParams<{ externalId: string }>();
  const router = useRouter();
  const { palette, brand } = useAppTheme();
  const recipe = useRecipeDetail(externalId);
  const openAdapted = useOpenAdaptedRecipe();
  const [saving, setSaving] = useState(false);

  const { detail } = recipe;
  const { adaptStepText } = useAppliedSubstitutions(detail?.id, detail?.title);

  const save = async () => {
    setSaving(true);
    const result = await recipe.saveRecipe();
    setSaving(false);
    Alert.alert(result.ok ? 'Đã lưu' : 'Chưa thể lưu', result.ok ? 'Công thức đã được lưu vào mục Đã lưu.' : result.message);
  };

  if (recipe.isLoading || (!detail && !recipe.error)) {
    return (
      <Screen>
        <BackHeader title="Công thức" />
        <ActivityIndicator color={brand} />
      </Screen>
    );
  }

  if (!detail) {
    return (
      <Screen>
        <BackHeader title="Công thức" />
        <Card className="items-center gap-2 p-5">
          <AppText variant="error" className="text-center">{recipe.error}</AppText>
          <Button title="Thử lại" variant="outline" onPress={recipe.reload} />
        </Card>
      </Screen>
    );
  }

  const steps = [...(Array.isArray(detail.steps) ? detail.steps : [])].sort(
    (a, b) => a.stepOrder - b.stepOrder,
  );

  return (
    <Screen>
      <BackHeader title={detail.title} />

      {detail.imageUrl ? (
        <Image source={{ uri: detail.imageUrl }} className="h-52 w-full rounded-3xl bg-soft dark:bg-soft-dark" />
      ) : null}

      <View className="gap-2">
        <AppText variant="caption">{recipeMetaLabel({ ...detail, servings: recipe.servings })}</AppText>
        <View className="flex-row flex-wrap gap-2">
          {detail.cuisine ? <Badge label={detail.cuisine.name} tone="warn" /> : null}
          {recipe.isScaled ? <Badge label="Đã quy đổi khẩu phần" tone="success" /> : null}
        </View>
      </View>

      <Card className="flex-row items-center justify-between p-4">
        <View>
          <AppText className="font-bold">Khẩu phần</AppText>
          <AppText variant="caption">Số lượng nguyên liệu tự điều chỉnh</AppText>
        </View>
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => recipe.changeServings(-1)}
            accessibilityLabel="Giảm khẩu phần"
            className="h-10 w-10 items-center justify-center rounded-full bg-soft dark:bg-soft-dark"
          >
            <Ionicons name="remove" size={20} color={palette.ink} />
          </Pressable>
          <View className="min-w-8 items-center">
            {recipe.isScaling ? <ActivityIndicator color={brand} /> : <AppText variant="heading">{recipe.servings ?? '-'}</AppText>}
          </View>
          <Pressable
            onPress={() => recipe.changeServings(1)}
            accessibilityLabel="Tăng khẩu phần"
            className="h-10 w-10 items-center justify-center rounded-full bg-soft dark:bg-soft-dark"
          >
            <Ionicons name="add" size={20} color={palette.ink} />
          </Pressable>
        </View>
      </Card>
      {recipe.scaleError ? <AppText variant="error">{recipe.scaleError}</AppText> : null}

      <View className="gap-2">
        <AppText variant="heading">Nguyên liệu</AppText>
        <Card className="overflow-hidden">
          {(Array.isArray(detail.ingredients) ? detail.ingredients : []).map(
            (ingredient, index) => {
              const amount = formatIngredientAmount(
                ingredient.amount,
                ingredient.unit,
              );
              return (
                <View
                  key={ingredient.id}
                  className={`flex-row items-center justify-between gap-3 px-4 py-3 ${index > 0 ? 'border-t border-line dark:border-line-dark' : ''}`}
                >
                  <View className="flex-1">
                    <AppText className="font-medium">{ingredient.name}</AppText>
                    <AppliedSubstituteInfo
                      recipeTitle={detail.title}
                      recipeId={detail.id}
                      ingredientName={ingredient.name}
                    />
                  </View>
                  <View className="flex-row items-center gap-2">
                    {amount ? (
                      <AppText variant="caption" className="font-semibold">
                        {amount}
                      </AppText>
                    ) : null}
                    <SubstituteButton
                      recipeTitle={detail.title}
                      recipeId={detail.id}
                      ingredientName={ingredient.name}
                    />
                  </View>
                </View>
              );
            },
          )}
        </Card>
      </View>

      <View className="gap-2">
        <AppText variant="heading">Cách làm</AppText>
        {steps.map((step) => (
          <Card key={step.id} className="gap-1 p-4">
            <View className="flex-row items-center justify-between">
              <AppText variant="label">Bước {step.stepOrder}</AppText>
              {step.timerSeconds ? <Badge label={formatTimer(step.timerSeconds)} tone="success" /> : null}
            </View>
            <AppText>{adaptStepText(step.text)}</AppText>
          </Card>
        ))}
      </View>

      <View className="gap-3">
        <Button
          title="Bắt đầu nấu"
          disabled={steps.length === 0}
          onPress={() => router.push({ pathname: '/recipe/cooking', params: { externalId: detail.externalId ?? externalId } })}
        />
        <Button
          title="Thêm vào thực đơn"
          variant="secondary"
          disabled={!recipe.mealPlanParams}
          onPress={() => recipe.mealPlanParams && router.push({ pathname: '/meal-plan/add-entry', params: recipe.mealPlanParams })}
        />
        <Button
          title="Điều chỉnh theo nguyên liệu loại trừ"
          variant="outline"
          disabled={!detail.id}
          onPress={() => detail.id && openAdapted(detail.id)}
        />
        <Button title="Lưu công thức" variant="outline" loading={saving} onPress={save} />
        <Button
          title="Món tương tự"
          variant="outline"
          onPress={() => router.push({ pathname: '/recipe/similar', params: { externalId: detail.externalId ?? externalId, title: detail.title } })}
        />
      </View>
    </Screen>
  );
}
