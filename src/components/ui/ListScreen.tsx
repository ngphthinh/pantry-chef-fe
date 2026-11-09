import React, { type ReactElement } from "react";
import {
  ActivityIndicator,
  FlatList,
  View,
  type ListRenderItem,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { useTheme } from "@/theme";

interface ListScreenProps<T> {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: ListRenderItem<T>;
  /** Phần đầu danh sách (tiêu đề, ô tìm kiếm, bộ lọc...). */
  header?: ReactElement;
  /** Hiện khi danh sách rỗng (chỉ truyền khi đã tải xong). */
  empty?: ReactElement | null;
  /** Phần cuối danh sách (nút hành động phụ, thông tin cảnh báo...). */
  footer?: ReactElement;
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
  onScrollBeginDrag?: () => void;
  /** Header dính ở trên khi cuộn. */
  stickyHeader?: boolean;
}

/**
 * Màn hình dạng danh sách cuộn vô hạn với FlatList tối ưu hóa,
 * tự động đồng bộ màu nền và hiệu ứng tải theo Theme Token.
 */
export function ListScreen<T>({
  data,
  keyExtractor,
  renderItem,
  header,
  empty,
  footer,
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
  const { colors } = useTheme();
  const sticky = stickyHeader && !!header;

  const renderEmptyComponent = () => {
    if (isLoading && data.length === 0) {
      return (
        <View className="items-center justify-center py-16">
          <ActivityIndicator size="large" color={colors.primary} />
          {loadingMessage ? (
            <AppText
              variant="caption"
              style={{ color: colors.textSecondary }}
              className="mt-3 font-medium">
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
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText
            variant="caption"
            style={{ color: colors.textSecondary }}
            className="mt-2 text-xs font-medium">
            Đang tải thêm...
          </AppText>
        </View>
      );
    }
    if (footer) {
      return (
        <View>
          {footer}
          {hasNext === false && data.length > 0 && (
            <View className="items-center justify-center py-4">
              <AppText
                variant="caption"
                style={{ color: colors.textDisabled }}
                className="text-xs">
                Đã hiển thị tất cả ({data.length}) món
              </AppText>
            </View>
          )}
        </View>
      );
    }
    if (hasNext === false && data.length > 0) {
      return (
        <View className="items-center justify-center py-6">
          <AppText
            variant="caption"
            style={{ color: colors.textDisabled }}
            className="text-xs">
            Đã hiển thị tất cả ({data.length}) món
          </AppText>
        </View>
      );
    }
    return undefined;
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top,
      }}>
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
              style={
                sticky
                  ? { backgroundColor: colors.background, paddingBottom: 12 }
                  : undefined
              }>
              {header}
            </View>
          ) : undefined
        }
        stickyHeaderIndices={sticky ? [0] : undefined}
        ListEmptyComponent={renderEmptyComponent()}
        ListFooterComponent={renderFooterComponent()}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onScrollBeginDrag={onScrollBeginDrag}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 32,
          gap: 16,
        }}
      />
    </View>
  );
}
