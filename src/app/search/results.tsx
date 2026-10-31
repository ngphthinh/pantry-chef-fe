import { ScrollView, TextInput, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { BackHeader } from '@/components/recipe/BackHeader';
import { RecipeList } from '@/components/recipe/RecipeList';
import { useAppTheme } from '@/core/theme/useAppTheme';
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
  const { palette } = useAppTheme();

  const nameHeader = (
    <View className="gap-2 pb-3">
      <AppText variant="label">Tên món</AppText>
      <TextInput
        value={search.keyword}
        onChangeText={search.setKeyword}
        returnKeyType="search"
        placeholder="Nhập tên món, ví dụ: phở bò"
        placeholderTextColor={palette.muted}
        className="h-12 rounded-full border border-line bg-surface px-4 text-base text-ink dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark"
      />
    </View>
  );

  const ingredientHeader = (
    <View className="gap-3 pb-3">
      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <AppText variant="label">Nguyên liệu (chạm để thêm/bỏ)</AppText>
          <AppText variant="caption">Đã chọn {search.ingredients.length}</AppText>
        </View>
        {search.ingredientChips.length === 0 ? (
          <AppText variant="caption">Tủ của bạn đang trống.</AppText>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {search.ingredientChips.map((name) => (
              <Chip
                key={name}
                label={name}
                selected={search.ingredients.includes(name)}
                onPress={() => search.toggleIngredient(name)}
              />
            ))}
          </View>
        )}
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
      <BackHeader
        title="Kết quả"
        subtitle={search.isNameMode ? 'Tìm theo tên món' : 'Món khớp với nguyên liệu bạn chọn'}
      />
      <RecipeList
        items={search.items}
        isLoading={search.isLoading}
        isLoadingMore={search.isLoadingMore}
        error={search.error}
        isEmpty={search.isEmpty || !search.hasInput}
        emptyTitle={search.hasInput ? 'Chưa tìm thấy món phù hợp' : 'Chưa có điều kiện tìm'}
        emptyMessage={
          search.hasInput
            ? 'Thử bỏ bớt bộ lọc hoặc đổi nguyên liệu.'
            : search.isNameMode
              ? 'Nhập tên món để bắt đầu tìm.'
              : 'Chọn ít nhất một nguyên liệu để tìm món.'
        }
        header={search.isNameMode ? nameHeader : ingredientHeader}
        onPressItem={openRecipe}
        onEndReached={search.hasNext ? search.loadMore : undefined}
        onRefresh={search.reload}
      />
    </Screen>
  );
}
