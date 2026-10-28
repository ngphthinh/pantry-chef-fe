import { Image, Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { recipeMatchLabel, recipeMetaLabel } from '@/features/recipe/recipeLabels';
import type { RecipeSummaryResponse } from '@/types';

const MAX_MISSING_SHOWN = 3;

interface RecipeSummaryCardProps {
  recipe: RecipeSummaryResponse;
  onPress: (recipe: RecipeSummaryResponse) => void;
}

/** Một dòng công thức trong danh sách tìm kiếm / gợi ý / khám phá. */
export function RecipeSummaryCard({ recipe, onPress }: RecipeSummaryCardProps) {
  const { palette } = useAppTheme();
  const meta = recipeMetaLabel(recipe);
  const match = recipeMatchLabel(recipe);
  const missing = recipe.missingIngredients ?? [];

  return (
    <Pressable onPress={() => onPress(recipe)} accessibilityRole="button" className="active:opacity-80">
      <Card className="flex-row gap-3 overflow-hidden p-3">
        {recipe.imageUrl ? (
          <Image source={{ uri: recipe.imageUrl }} className="h-24 w-24 rounded-2xl bg-soft dark:bg-soft-dark" />
        ) : (
          <View className="h-24 w-24 items-center justify-center rounded-2xl bg-soft dark:bg-soft-dark">
            <Ionicons name="restaurant-outline" size={28} color={palette.muted} />
          </View>
        )}

        <View className="flex-1 gap-1">
          <AppText className="font-bold" numberOfLines={2}>{recipe.title}</AppText>
          {meta ? <AppText variant="caption">{meta}</AppText> : null}

          <View className="flex-row flex-wrap items-center gap-1.5">
            {recipe.custom ? <Badge label="Tự tạo" tone="success" /> : null}
            {recipe.cuisine ? <Badge label={recipe.cuisine.name} tone="warn" /> : null}
          </View>

          {match ? <AppText variant="caption" className="font-semibold text-brand">{match}</AppText> : null}
          {missing.length > 0 ? (
            <AppText variant="caption" numberOfLines={2}>
              Thiếu: {missing.slice(0, MAX_MISSING_SHOWN).join(', ')}
              {missing.length > MAX_MISSING_SHOWN ? ` +${missing.length - MAX_MISSING_SHOWN}` : ''}
            </AppText>
          ) : null}
        </View>
      </Card>
    </Pressable>
  );
}
