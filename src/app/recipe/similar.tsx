import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/ui/Screen';
import { BackHeader } from '@/components/recipe/BackHeader';
import { RecipeList } from '@/components/recipe/RecipeList';
import { useOpenRecipe } from '@/features/recipe/useOpenRecipe';
import { useSimilarRecipes } from '@/features/recipe/useSimilarRecipes';

export default function SimilarRecipesScreen() {
  const { externalId, title } = useLocalSearchParams<{ externalId: string; title?: string }>();
  const similar = useSimilarRecipes(externalId);
  const openRecipe = useOpenRecipe();

  return (
    <Screen scroll={false}>
      <BackHeader title="Món tương tự" subtitle={title} />
      <RecipeList
        items={similar.items}
        isLoading={similar.isLoading}
        isLoadingMore={false}
        error={similar.error}
        isEmpty={similar.isEmpty}
        emptyTitle="Chưa có món tương tự"
        emptyMessage="Món này chưa có gợi ý liên quan."
        onPressItem={openRecipe}
        onRefresh={similar.reload}
      />
    </Screen>
  );
}
