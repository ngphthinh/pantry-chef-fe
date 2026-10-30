// ListScreen.tsx
import type { ReactElement } from "react";
import {
  ActivityIndicator,
  FlatList,
  View,
  type ListRenderItem,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { brand } from "@/core/theme/colors";

interface ListScreenProps<T> {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: ListRenderItem<T>;
  header?: ReactElement;
  empty?: ReactElement | null;
  /** Trạng thái đang tải dữ liệu lần đầu */
  isLoading?: boolean;
  /** Dòng chữ thông báo khi đang tải */
  loadingMessage?: string;
  onEndReached?: () => void;
  isLoadingMore?: boolean;
  /** Còn trang tiếp theo không (để hiện footer phù hợp) */
  hasNext?: boolean;
  /** >1 thì render dạng lưới; không đổi giá trị này khi component đang mount. */
  numColumns?: number;
  /** Khoảng cách giữa các cột/hàng khi dùng lưới. */
  gap?: number;
  onRefresh?: () => void;
  refreshing?: boolean;
  /** Gọi khi người dùng bắt đầu kéo cuộn. */
  onScrollBeginDrag?: () => void;
  /** Header dính ở trên khi cuộn. Nên dùng với header gọn (tiêu đề, tìm kiếm, tab). */
  stickyHeader?: boolean;
}

export function ListScreen<T>({
  data,
  keyExtractor,
  renderItem,
  header,
  empty,
  isLoading = false,
  loadingMessage = "Đang tải dữ liệu...",
  onEndReached,
  isLoadingMore = false,
  hasNext,
  numColumns = 1,
  gap = 16,
  onRefresh,
  refreshing = false,
  onScrollBeginDrag,
  stickyHeader = true,
}: ListScreenProps<T>) {
  const insets = useSafeAreaInsets();
  const sticky = stickyHeader && !!header;

  const renderEmptyComponent = () => {
    if (isLoading && data.length === 0) {
      return (
        <View className="items-center justify-center py-16">
          <ActivityIndicator size="large" color={brand.DEFAULT} />
          {loadingMessage ? (
            <AppText variant="caption" className="mt-3 font-medium text-muted">
              {loadingMessage}
            </AppText>
          ) : null}
        </View>
      );
    }
    return empty ?? undefined;
  };

  const renderFooterComponent = () => {
    if (isLoadingMore) {
      return (
        <View className="items-center justify-center p-4 py-6">
          <ActivityIndicator size="small" color={brand.DEFAULT} />
          <AppText variant="caption" className="mt-2 text-xs font-medium text-muted">
            Đang tải thêm...
          </AppText>
        </View>
      );
    }
    if (hasNext === false && data.length > 0) {
      return (
        <View className="items-center justify-center py-6">
          <AppText variant="caption" className="text-xs text-muted/60">
            Đã hiển thị tất cả ({data.length}) món
          </AppText>
        </View>
      );
    }
    return undefined;
  };

  return (
    <View
      className="flex-1 bg-canvas dark:bg-canvas-dark"
      style={{ paddingTop: insets.top }}>
      <FlatList
        style={{ flex: 1 }}
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? { gap } : undefined}
        ListHeaderComponent={
          header ? (
            <View
              className={
                sticky ? "bg-canvas pb-3 dark:bg-canvas-dark" : undefined
              }>
              {header}
            </View>
          ) : undefined
        }
        stickyHeaderIndices={sticky ? [0] : undefined}
        ListEmptyComponent={empty ?? undefined}
        ListFooterComponent={
          isLoadingMore ? (
            <View className="items-center p-4">
              <ActivityIndicator color={brand.DEFAULT} />
            </View>
          ) : undefined
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
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
