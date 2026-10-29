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
  /** Phần đầu danh sách (tiêu đề, ô tìm kiếm, bộ lọc...). Truyền ELEMENT, không truyền component. */
  header?: ReactElement;
  /** Hiện khi danh sách rỗng (chỉ truyền khi đã tải xong, nếu không sẽ nháy lên lúc đang tải). */
  empty?: ReactElement | null;
  /** Gọi khi người dùng cuộn gần tới cuối. */
  onEndReached?: () => void;
  isLoadingMore?: boolean;
  numColumns?: number;
}

/**
 * Màn hình dạng danh sách cuộn vô hạn. Dùng FlatList làm vùng cuộn chính
 * (không lồng trong ScrollView) nên onEndReached hoạt động đúng.
 *
 * Nếu màu nền / khoảng đệm không giống `Screen`, chỉ cần chỉnh ở file này.
 */
export function ListScreen<T>({
  data,
  keyExtractor,
  renderItem,
  header,
  empty,
  onEndReached,
  isLoadingMore = false,
                                numColumns = 1,
}: ListScreenProps<T>) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-canvas dark:bg-canvas-dark" style={{ paddingTop: insets.top }}>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
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
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 32,
          gap: 16,
        }}
        numColumns={numColumns}
        columnWrapperStyle={numColumns > 1 ? {gap: 12} : undefined}
      />
    </View>
  );
}
