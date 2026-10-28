import type { ReactElement } from 'react';
import { ActivityIndicator, FlatList, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { recipeKey } from '@/features/recipe/recipeLabels';
import type { RecipeSummaryResponse } from '@/types';
import { RecipeSummaryCard } from './RecipeSummaryCard';

const END_REACHED_THRESHOLD = 0.4;

interface RecipeListProps {
  items: RecipeSummaryResponse[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  /** true khi đã tải xong mà không có kết quả. */
  isEmpty: boolean;
  emptyTitle: string;
  emptyMessage: string;
  header?: ReactElement;
  onPressItem: (recipe: RecipeSummaryResponse) => void;
  onEndReached?: () => void;
  onRefresh?: () => void;
}

/** Danh sách công thức có đủ trạng thái: đang tải, lỗi (thử lại), rỗng, tải thêm khi cuộn tới cuối. */
export function RecipeList({
  items,
  isLoading,
  isLoadingMore,
  error,
  isEmpty,
  emptyTitle,
  emptyMessage,
  header,
  onPressItem,
  onEndReached,
  onRefresh,
}: RecipeListProps) {
  const { brand } = useAppTheme();

  const footer = (
    <View className="py-4">
      {isLoadingMore ? <ActivityIndicator color={brand} /> : null}
      {isLoading && items.length === 0 ? <ActivityIndicator color={brand} /> : null}
      {error ? (
        <Card className="items-center gap-2 p-4">
          <AppText variant="error" className="text-center">{error}</AppText>
          {onRefresh ? <Button title="Thử lại" variant="outline" onPress={onRefresh} /> : null}
        </Card>
      ) : null}
      {isEmpty && !error ? (
        <Card className="items-center gap-1 p-5">
          <AppText variant="heading">{emptyTitle}</AppText>
          <AppText variant="caption" className="text-center">{emptyMessage}</AppText>
        </Card>
      ) : null}
    </View>
  );

  return (
    <FlatList
      data={items}
      keyExtractor={recipeKey}
      renderItem={({ item }) => <RecipeSummaryCard recipe={item} onPress={onPressItem} />}
      ItemSeparatorComponent={() => <View className="h-3" />}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
      onEndReached={onEndReached}
      onEndReachedThreshold={END_REACHED_THRESHOLD}
      refreshing={isLoading && items.length > 0}
      onRefresh={onRefresh}
      showsVerticalScrollIndicator={false}
      contentContainerClassName="gap-0 pb-8"
    />
  );
}
