import { ScrollView, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { BackHeader } from '@/components/recipe/BackHeader';
import { RecipeList } from '@/components/recipe/RecipeList';
import { useCuisines } from '@/features/cuisine/useCuisines';
import {
  DIFFICULTY_LABELS,
  DIFFICULTY_OPTIONS,
  MAX_MINUTES_OPTIONS,
} from '@/features/recipe/recipeLabels';
import { useOpenRecipe } from '@/features/recipe/useOpenRecipe';
import { useRecipeSearch } from '@/features/recipe/useRecipeSearch';

export default function SearchResultsScreen() {
  const search = useRecipeSearch();
  const cuisines = useCuisines();
  const openRecipe = useOpenRecipe();

  const header = (
    <View className="gap-3 pb-3">
      <View className="gap-2">
        <AppText variant="label">Nguyên liệu (chạm để bỏ)</AppText>
        <View className="flex-row flex-wrap gap-2">
          {search.ingredients.map((name) => (
            <Chip key={name} label={name} selected onPress={() => search.removeIngredient(name)} />
          ))}
        </View>
      </View>

      <View className="gap-2">
        <AppText variant="label">Độ khó</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
          {DIFFICULTY_OPTIONS.map((option) => (
            <Chip
              key={option ?? 'all'}
              label={option ? DIFFICULTY_LABELS[option] : 'Tất cả'}
              selected={search.difficulty === option}
              onPress={() => search.setDifficulty(option)}
            />
          ))}
        </ScrollView>
      </View>

      <View className="gap-2">
        <AppText variant="label">Thời gian</AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
          {MAX_MINUTES_OPTIONS.map((option) => (
            <Chip
              key={option ?? 'any'}
              label={option ? `≤ ${option} phút` : 'Bất kỳ'}
              selected={search.maxMinutes === option}
              onPress={() => search.setMaxMinutes(option)}
            />
          ))}
        </ScrollView>
      </View>

      {cuisines.length > 0 ? (
        <View className="gap-2">
          <AppText variant="label">Ẩm thực</AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
            <Chip label="Tất cả" selected={!search.cuisineId} onPress={() => search.setCuisine(undefined)} />
            {cuisines.map((cuisine) => (
              <Chip
                key={cuisine.id}
                label={cuisine.name}
                selected={search.cuisineId === cuisine.id}
                onPress={() => search.setCuisine(cuisine.id)}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );

  return (
    <Screen scroll={false}>
      <BackHeader title="Kết quả" subtitle="Món khớp với nguyên liệu bạn chọn" />
      <RecipeList
        items={search.items}
        isLoading={search.isLoading}
        isLoadingMore={search.isLoadingMore}
        error={search.error}
        isEmpty={search.isEmpty || search.ingredients.length === 0}
        emptyTitle="Chưa tìm thấy món phù hợp"
        emptyMessage="Thử bỏ bớt bộ lọc hoặc chọn thêm nguyên liệu."
        header={header}
        onPressItem={openRecipe}
        onEndReached={search.hasNext ? search.loadMore : undefined}
        onRefresh={search.reload}
      />
    </Screen>
  );
}
