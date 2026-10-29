// ListScreen.tsx
import type { ReactElement } from "react";
import {
  ActivityIndicator,
  FlatList,
  View,
  type ListRenderItem,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { brand } from "@/core/theme/colors";

interface ListScreenProps<T> {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: ListRenderItem<T>;
  header?: ReactElement;
  empty?: ReactElement | null;
  onEndReached?: () => void;
  isLoadingMore?: boolean;
  /** >1 thì render dạng lưới; không đổi giá trị này khi component đang mount. */
  numColumns?: number;
  /** Khoảng cách giữa các cột/hàng khi dùng lưới. */
  gap?: number;
  onRefresh?: () => void;
  refreshing?: boolean;
  /** Gọi khi người dùng bắt đầu kéo cuộn. */
  onScrollBeginDrag?: () => void;
}

export function ListScreen<T>({
  data,
  keyExtractor,
  renderItem,
  header,
  empty,
  onEndReached,
  isLoadingMore = false,
  numColumns = 1,
  gap = 16,
  onRefresh,
  refreshing = false,
  onScrollBeginDrag,
}: ListScreenProps<T>) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? { gap } : undefined}
        ListHeaderComponent={header}
        ListEmptyComponent={empty ?? undefined}
        ListFooterComponent={
          isLoadingMore ? (
            <View className="items-center p-4">
              <ActivityIndicator color={brand.DEFAULT} />
            </View>
          ) : undefined
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onScrollBeginDrag={onScrollBeginDrag}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 32,
          gap,
        }}
      />
    </View>
  );
}
