import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { usePantry } from '@/features/pantry/usePantry';
import type { StorageLocation } from '@/types';

const TONE_MAP = {
  fresh: 'success',
  soon: 'warn',
  expired: 'danger',
} as const;

const ACTIONS = [
  { title: 'Quét mã vạch', route: '/pantry/barcode', icon: 'barcode-outline' as const },
  { title: 'Quét ảnh AI', route: '/pantry/scan-review', icon: 'camera-outline' as const },
  { title: 'Thêm thủ công', route: '/pantry/new', icon: 'create-outline' as const },
];

const LOCATIONS: { value: StorageLocation | 'ALL'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: 'ALL', label: 'Tất cả vị trí', icon: 'apps-outline' },
  { value: 'FRIDGE', label: 'Tủ mát ❄️', icon: 'leaf-outline' },
  { value: 'FREEZER', label: 'Tủ đông 🧊', icon: 'snow-outline' },
  { value: 'PANTRY_SHELF', label: 'Kệ bếp 🥫', icon: 'cube-outline' },
];

export default function PantryHubScreen() {
  const router = useRouter();
  const { brand, palette } = useAppTheme();
  const {
    items,
    expiringItems,
    groupByCategory,
    isLoading,
    hasNext,
    nextCursor,
    loadItems,
    loadMore,
    loadExpiring,
  } = usePantry();

  // Search & Filter state - mapping 1:1 với GET /v1/pantry-items?cursor=&size=&categoryId=&location=&keyword=
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<StorageLocation | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Debounce keyword 400ms để tối ưu số lần gọi API khi người dùng gõ tìm kiếm
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword.trim());
    }, 400);
    return () => clearTimeout(handler);
  }, [keyword]);

  // Gọi API backend GET /v1/pantry-items với query params tương ứng
  useEffect(() => {
    loadItems({
      keyword: debouncedKeyword ? debouncedKeyword : undefined,
      location: selectedLocation === 'ALL' ? undefined : selectedLocation,
      size: 20,
    }).catch(() => {});
  }, [debouncedKeyword, selectedLocation, loadItems]);

  // Tải danh sách sắp hết hạn ban đầu
  useEffect(() => {
    loadExpiring(3).catch(() => {});
  }, [loadExpiring]);

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([
      loadItems({
        keyword: debouncedKeyword ? debouncedKeyword : undefined,
        location: selectedLocation === 'ALL' ? undefined : selectedLocation,
        size: 20,
      }),
      loadExpiring(3),
    ]);
    setRefreshing(false);
  };

  // Tải trang tiếp theo qua Cursor (Cursor-based Pagination)
  const handleLoadMore = async () => {
    if (!hasNext || !nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      await loadMore({
        keyword: debouncedKeyword ? debouncedKeyword : undefined,
        location: selectedLocation === 'ALL' ? undefined : selectedLocation,
        size: 20,
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleClearFilters = () => {
    setKeyword('');
    setDebouncedKeyword('');
    setSelectedLocation('ALL');
    setSelectedCategory('Tất cả');
  };

  const categories = ['Tất cả', ...new Set(items.map((i) => i.categoryName || 'Khác'))];

  // Lọc category trên danh sách đã tải từ backend
  const filteredGroups = groupByCategory
    .filter((g) => selectedCategory === 'Tất cả' || g.categoryName === selectedCategory)
    .map((g) => ({
      ...g,
      items: g.items,
    }))
    .filter((g) => g.items.length > 0);

  const isFiltering = Boolean(debouncedKeyword || selectedLocation !== 'ALL' || selectedCategory !== 'Tất cả');

  return (
    <View className="flex-1 bg-canvas dark:bg-canvas-dark">
      <Screen>
        {/* Header 3D Aesthetic */}
        <View className="mb-2">
          <View className="flex-row items-center justify-between">
            <View>
              <AppText variant="title">Tủ nguyên liệu</AppText>
              <AppText variant="caption" className="mt-0.5">
                Quản lý kho thực phẩm 3D thông minh
              </AppText>
            </View>
            <View className="flex-row items-center gap-1.5 rounded-full border border-line bg-brandSoft px-3.5 py-1.5 shadow-sm dark:bg-surface-dark">
              <Ionicons name="cube" size={15} color={brand} />
              <AppText className="text-xs font-bold text-brand">{items.length} món</AppText>
            </View>
          </View>
        </View>

        {/* Search Bar - Tìm kiếm nguyên liệu theo keyword */}
        <View className="mb-2 flex-row items-center gap-2.5 rounded-2xl border border-line bg-soft px-3.5 py-2.5 dark:border-line-dark dark:bg-soft-dark">
          <Ionicons name="search-outline" size={18} color={palette.muted} />
          <TextInput
            placeholder="Tìm kiếm theo tên nguyên liệu..."
            placeholderTextColor={palette.muted}
            value={keyword}
            onChangeText={setKeyword}
            returnKeyType="search"
            style={{ flex: 1, color: palette.ink, fontSize: 14, paddingVertical: 0 }}
          />
          {keyword ? (
            <Pressable onPress={() => setKeyword('')} hitSlop={8} className="p-0.5">
              <Ionicons name="close-circle" size={18} color={palette.muted} />
            </Pressable>
          ) : null}
        </View>

        {/* 3D Modern Expiring Banner */}
        {expiringItems.length > 0 && !debouncedKeyword && (
          <Pressable
            onPress={() => router.push('/pantry/expiring' as Href)}
            className="mb-2 overflow-hidden rounded-3xl border border-warnInk/25 bg-warnBg p-3.5 shadow-sm active:scale-[0.99] dark:bg-warnBg-dark"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-2xl bg-warnInk/15 dark:bg-warnInk-dark/20">
                  <Ionicons name="warning-outline" size={22} color={palette.warnInk} />
                </View>
                <View>
                  <AppText className="font-bold text-warnInk dark:text-warnInk-dark">
                    {expiringItems.length} nguyên liệu sắp hết hạn!
                  </AppText>
                  <AppText variant="caption" className="text-warnInk/85 dark:text-warnInk-dark/80">
                    Chạm để xem chi tiết & ưu tiên nấu
                  </AppText>
                </View>
              </View>
              <View className="h-7 w-7 items-center justify-center rounded-full bg-warnInk/10 dark:bg-warnInk-dark/20">
                <Ionicons name="chevron-forward" size={16} color={palette.warnInk} />
              </View>
            </View>
          </Pressable>
        )}

        {/* Storage Location Filter Chips */}
        <View className="mb-2 flex-row flex-wrap gap-2">
          {LOCATIONS.map((loc) => {
            const isSelected = selectedLocation === loc.value;
            return (
              <Pressable
                key={loc.value}
                onPress={() => setSelectedLocation(loc.value)}
                className={`rounded-xl border px-3 py-1.5 active:scale-95 ${
                  isSelected
                    ? 'border-brand bg-brandSoft dark:bg-surface-dark'
                    : 'border-line bg-soft dark:border-line-dark dark:bg-soft-dark'
                }`}
              >
                <AppText
                  className={`text-xs font-bold ${
                    isSelected ? 'text-brand' : 'text-muted'
                  }`}
                >
                  {loc.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {/* Category Filters */}
        {categories.length > 2 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="-mx-4 px-4 py-1"
            contentContainerStyle={{ gap: 8 }}
          >
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                selected={selectedCategory === cat}
                onPress={() => setSelectedCategory(cat)}
              />
            ))}
          </ScrollView>
        )}

        {/* Filter / Search Feedback Bar */}
        {isFiltering && (
          <View className="my-1.5 flex-row items-center justify-between rounded-xl bg-brandSoft/60 px-3 py-1.5 dark:bg-surface-dark">
            <AppText variant="caption" className="font-semibold text-brand">
              Tìm thấy {items.length} món {debouncedKeyword ? `cho "${debouncedKeyword}"` : ''}
            </AppText>
            <Pressable onPress={handleClearFilters} hitSlop={8}>
              <AppText variant="caption" className="font-bold text-brand">
                Đặt lại ✕
              </AppText>
            </Pressable>
          </View>
        )}

        {/* Grouped Items List */}
        {isLoading && items.length === 0 ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color={brand} />
            <AppText variant="caption" className="mt-2">Đang tải tủ đồ...</AppText>
          </View>
        ) : filteredGroups.length === 0 ? (
          <Card className="items-center justify-center p-8 shadow-sm">
            <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-brandSoft dark:bg-surface-dark">
              <Ionicons
                name={isFiltering ? 'search-outline' : 'nutrition-outline'}
                size={32}
                color={brand}
              />
            </View>
            <AppText variant="heading" className="text-center">
              {isFiltering ? 'Không tìm thấy nguyên liệu' : 'Chưa có nguyên liệu'}
            </AppText>
            <AppText variant="caption" className="mt-1 text-center">
              {isFiltering
                ? 'Thử tìm với từ khoá khác hoặc xoá bộ lọc'
                : 'Nhấn nút (+) bên dưới để thêm món vào tủ'}
            </AppText>
            {isFiltering && (
              <Button
                title="Xoá bộ lọc"
                variant="outline"
                onPress={handleClearFilters}
                className="mt-4"
              />
            )}
          </Card>
        ) : (
          <View className="gap-5 pb-28">
            {filteredGroups.map((group) => (
              <View key={group.categoryName} className="gap-2.5">
                {/* Category Header */}
                <View className="flex-row items-center justify-between px-1">
                  <View className="flex-row items-center gap-2">
                    <View className="h-2 w-2 rounded-full bg-brand" />
                    <AppText variant="label" className="text-sm font-bold">
                      {group.categoryName}
                    </AppText>
                  </View>
                  <AppText variant="caption" className="text-xs">
                    {group.items.length} món
                  </AppText>
                </View>

                {/* Items in Category */}
                {group.items.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => router.push(`/pantry/${item.id}` as Href)}
                    className="active:scale-[0.985]"
                  >
                    <Card className="flex-row items-center justify-between p-4 shadow-sm">
                      <View className="flex-row items-center gap-3.5">
                        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-soft shadow-inner dark:bg-soft-dark">
                          <Ionicons
                            name={
                              item.location === 'FREEZER'
                                ? 'snow-outline'
                                : item.location === 'PANTRY_SHELF'
                                ? 'cube-outline'
                                : 'leaf-outline'
                            }
                            size={22}
                            color={brand}
                          />
                        </View>
                        <View>
                          <AppText variant="heading" className="text-base font-semibold">
                            {item.ingredientName}
                          </AppText>
                          <AppText variant="caption" className="mt-0.5">
                            {item.quantity} {item.unit} ·{' '}
                            {item.location === 'FREEZER'
                              ? 'Tủ đông'
                              : item.location === 'PANTRY_SHELF'
                              ? 'Kệ bếp'
                              : 'Tủ lạnh'}
                          </AppText>
                        </View>
                      </View>

                      {/* Freshness label calculated inside the hook */}
                      <Badge
                        label={item.freshness.label}
                        tone={TONE_MAP[item.freshness.status]}
                      />
                    </Card>
                  </Pressable>
                ))}
              </View>
            ))}

            {/* Cursor Pagination: Nút Tải thêm trang tiếp theo */}
            {hasNext && (
              <View className="items-center pt-2">
                <Button
                  title={isLoadingMore ? 'Đang tải thêm...' : 'Tải thêm nguyên liệu...'}
                  variant="outline"
                  onPress={handleLoadMore}
                  disabled={isLoadingMore}
                  className="w-full max-w-xs"
                />
              </View>
            )}
          </View>
        )}
      </Screen>

      {/* Floating Action Button & 3D Menu */}
      <View className="absolute bottom-6 right-6 items-end gap-3" pointerEvents="box-none">
        {fabOpen &&
          ACTIONS.map((action) => (
            <Pressable
              key={action.route}
              onPress={() => {
                setFabOpen(false);
                router.push(action.route as Href);
              }}
              className="flex-row items-center gap-3 active:scale-95"
            >
              <Card className="px-4 py-2 shadow-lg">
                <AppText className="font-bold">{action.title}</AppText>
              </Card>
              <View className="h-12 w-12 items-center justify-center rounded-full bg-brandSoft shadow-lg dark:bg-surface-dark">
                <Ionicons name={action.icon} size={22} color={brand} />
              </View>
            </Pressable>
          ))}

        <Pressable
          onPress={() => setFabOpen((prev) => !prev)}
          className="h-14 w-14 items-center justify-center rounded-full bg-brand shadow-xl active:scale-90"
        >
          <Ionicons name={fabOpen ? 'close' : 'add'} size={28} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}
