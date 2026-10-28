import { Screen } from '@/components/ui/Screen';
import { BackHeader } from '@/components/recipe/BackHeader';
import { RecipeList } from '@/components/recipe/RecipeList';
import { useOpenRecipe } from '@/features/recipe/useOpenRecipe';
import { useRecipeSuggestions } from '@/features/recipe/useRecipeSuggestions';

export default function SuggestionsScreen() {
  const suggestions = useRecipeSuggestions();
  const openRecipe = useOpenRecipe();

  return (
    <Screen scroll={false}>
      <BackHeader title="Gợi ý theo tủ" subtitle="Dựa trên nguyên liệu bạn đang có" />
      <RecipeList
        items={suggestions.items}
        isLoading={suggestions.isLoading}
        isLoadingMore={suggestions.isLoadingMore}
        error={suggestions.error}
        isEmpty={suggestions.isEmpty}
        emptyTitle="Chưa có gợi ý"
        emptyMessage="Thêm nguyên liệu còn dùng được vào tủ để nhận gợi ý món nấu."
        onPressItem={openRecipe}
        onEndReached={suggestions.hasNext ? suggestions.loadMore : undefined}
        onRefresh={suggestions.reload}
      />
    </Screen>
  );
}
