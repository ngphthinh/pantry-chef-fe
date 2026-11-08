import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  TextInput,
  View,
  type ListRenderItem,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ListScreen } from "@/components/ui/ListScreen";
import { PantryItemThumbnail } from "@/components/pantry/PantryItemThumbnail";
import { useTheme } from "@/theme";
import {
  usePantry,
  type EnrichedPantryItem,
} from "@/features/pantry/usePantry";
import { UNIT_LABEL, type StorageLocation } from "@/types";

const TONE_MAP = {
  fresh: "success",
  soon: "warn",
  expired: "danger",
} as const;

const ACTIONS: {
  title: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    title: "Quét mã vạch",
    route: "/pantry/barcode",
    icon: "barcode-outline",
  },
  {
    title: "Quét ảnh AI",
    route: "/pantry/scan",
    icon: "camera-outline",
  },
  {
    title: "Thêm thủ công",
    route: "/pantry/new",
    icon: "create-outline",
  },
  {
    icon: "swap-horizontal-outline",
    title: "Nguyên liệu thay thế",
    route: "ai/substitutions",
  },
];

const PAGE_SIZE = 5;

const LOCATIONS: {
  value: StorageLocation | "ALL";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: "ALL", label: "Tất cả", icon: "apps-outline" },
  { value: "FRIDGE", label: "Tủ mát", icon: "snow-outline" },
  { value: "FREEZER", label: "Tủ đông", icon: "cube-outline" },
  { value: "PANTRY_SHELF", label: "Kệ bếp", icon: "basket-outline" },
];

export default function PantryHubScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const brand = colors.primary;
  const palette = {
    muted: colors.textSecondary,
    ink: colors.textPrimary,
    warnInk: colors.warning,
  };
  const {
    items,
    expiringItems,
    isLoading,
    hasNext,
    nextCursor,
    loadItems,
    loadMore,
    loadExpiring,
  } = usePantry();

  // Search & Filter state - mapping 1:1 với GET /v1/pantry-items?cursor=&size=&categoryId=&location=&keyword=
  const [keyword, setKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<
    StorageLocation | "ALL"
  >("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
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
      location: selectedLocation === "ALL" ? undefined : selectedLocation,
      size: PAGE_SIZE,
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
        location: selectedLocation === "ALL" ? undefined : selectedLocation,
        size: PAGE_SIZE,
      }),
      loadExpiring(3),
    ]);
    setRefreshing(false);
  };

  // Tải trang tiếp theo qua Cursor (Lướt đến đâu load đến đó - Infinite Scroll)
  const handleLoadMore = async () => {
    if (!hasNext || !nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      await loadMore({
        keyword: debouncedKeyword ? debouncedKeyword : undefined,
        location: selectedLocation === "ALL" ? undefined : selectedLocation,
        size: PAGE_SIZE,
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleClearFilters = () => {
    setKeyword("");
    setDebouncedKeyword("");
    setSelectedLocation("ALL");
    setSelectedCategory("Tất cả");
  };

  const categories = useMemo(() => {
    return ["Tất cả", ...new Set(items.map((i) => i.categoryName || "Khác"))];
  }, [items]);

  // Đếm số lượng món theo từng danh mục
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { "Tất cả": items.length };
    items.forEach((item) => {
      const cat = item.categoryName || "Khác";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [items]);

  // Lọc theo vị trí, danh mục và loại bỏ nguyên liệu có số lượng <= 0
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const hasQuantity = Number(item.quantity) > 0;
      const matchLocation =
        selectedLocation === "ALL" || item.location === selectedLocation;
      const matchCategory =
        selectedCategory === "Tất cả" ||
        (item.categoryName || "Khác") === selectedCategory;
      return hasQuantity && matchLocation && matchCategory;
    });
  }, [items, selectedLocation, selectedCategory]);

  // Nhóm theo danh mục để hiển thị mượt mà trên FlatList
  const sortedFilteredItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const catA = a.categoryName || "Khác";
      const catB = b.categoryName || "Khác";
      return catA.localeCompare(catB);
    });
  }, [filteredItems]);

  const isFiltering = Boolean(
    debouncedKeyword ||
    selectedLocation !== "ALL" ||
    selectedCategory !== "Tất cả",
  );

  // Header của danh sách bao gồm tiêu đề, tìm kiếm, banner cảnh báo, bộ lọc
  const renderHeader = () => (
    <View className="gap-3 pb-2">
      {/* Header 3D Aesthetic */}
      <View className="flex-row items-center justify-between">
        <View>
          <AppText variant="title">Tủ nguyên liệu</AppText>
          <AppText variant="caption" className="mt-0.5">
            Quản lý kho thực phẩm 3D thông minh
          </AppText>
        </View>
        <View className="flex-row items-center gap-1.5 rounded-full border border-line bg-brandSoft px-3.5 py-1.5 shadow-sm dark:bg-surface-dark">
          <Ionicons name="cube" size={15} color={brand} />
          <AppText className="text-xs font-bold text-brand">
            {items.length} món
          </AppText>
        </View>
      </View>

      {/* Search Bar - Tìm kiếm nguyên liệu theo keyword */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1.2,
        }}
        className="flex-row items-center gap-2.5 rounded-2xl px-3.5 py-2.5 shadow-xs"
      >
        <Ionicons
          name="search-outline"
          size={18}
          color={colors.textSecondary}
        />
        <TextInput
          placeholder="Tìm kiếm theo tên nguyên liệu..."
          placeholderTextColor={colors.textSecondary}
          value={keyword}
          onChangeText={setKeyword}
          returnKeyType="search"
          style={{
            flex: 1,
            color: colors.textPrimary,
            fontSize: 14,
            paddingVertical: 0,
          }}
        />
        {keyword ? (
          <Pressable
            onPress={() => setKeyword("")}
            hitSlop={8}
            className="p-0.5"
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>

      {/* 3D Modern Expiring Banner */}
      {expiringItems.length > 0 && !debouncedKeyword && (
        <Pressable
          onPress={() => router.push("/pantry/expiring" as Href)}
          style={{
            backgroundColor: isDark ? "rgba(245, 158, 11, 0.14)" : "#FEF3C7",
            borderColor: isDark
              ? "rgba(245, 158, 11, 0.35)"
              : "rgba(217, 119, 6, 0.25)",
            borderWidth: 1.2,
          }}
          className="overflow-hidden rounded-3xl p-3.5 shadow-sm active:scale-[0.99]"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-3 flex-1 pr-2">
              <View
                style={{
                  backgroundColor: isDark
                    ? "rgba(245, 158, 11, 0.25)"
                    : "rgba(217, 119, 6, 0.15)",
                }}
                className="h-10 w-10 items-center justify-center rounded-2xl"
              >
                <Ionicons
                  name="warning"
                  size={20}
                  color={isDark ? "#FBBF24" : "#D97706"}
                />
              </View>
              <View className="flex-1">
                <AppText
                  style={{
                    color: isDark ? "#FDE68A" : "#92400E",
                    fontWeight: "800",
                    fontSize: 14,
                  }}
                >
                  {expiringItems.length} nguyên liệu sắp hết hạn!
                </AppText>
                <AppText
                  style={{
                    color: isDark ? "rgba(253, 230, 138, 0.8)" : "#B45309",
                    fontSize: 12,
                    marginTop: 1,
                  }}
                >
                  Chạm để xem chi tiết & ưu tiên nấu
                </AppText>
              </View>
            </View>
            <View
              style={{
                backgroundColor: isDark
                  ? "rgba(245, 158, 11, 0.2)"
                  : "rgba(217, 119, 6, 0.1)",
              }}
              className="h-7 w-7 items-center justify-center rounded-full"
            >
              <Ionicons
                name="chevron-forward"
                size={16}
                color={isDark ? "#FBBF24" : "#D97706"}
              />
            </View>
          </View>
        </Pressable>
      )}

      {/* 1. Storage Location Segmented Dock (Modern, 4 Cột vừa vặn, không cuộn) */}
      <View
        style={{
          backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#EEF2EF",
          borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8E4",
          borderWidth: 1,
          borderRadius: 16,
          padding: 3,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {LOCATIONS.map((loc) => {
          const isSelected = selectedLocation === loc.value;
          return (
            <Pressable
              key={loc.value}
              onPress={() => setSelectedLocation(loc.value)}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
                paddingVertical: 8,
                paddingHorizontal: 2,
                borderRadius: 13,
                backgroundColor: isSelected ? colors.surface : "transparent",
                ...(isSelected
                  ? {
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1.5 },
                      shadowOpacity: isDark ? 0.35 : 0.08,
                      shadowRadius: 3,
                      elevation: 2,
                    }
                  : {}),
              }}
            >
              <Ionicons
                name={loc.icon}
                size={14}
                color={isSelected ? colors.primary : colors.textSecondary}
              />
              <AppText
                style={{
                  fontSize: 12.5,
                  fontWeight: isSelected ? "700" : "500",
                  color: isSelected ? colors.primary : colors.textSecondary,
                }}
                numberOfLines={1}
              >
                {loc.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {/* 2. Category Filter Pills (Soft Tag Pills, cuộn mượt mà có badge đếm số lượng) */}
      {categories.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-4 px-4 py-0.5"
          contentContainerStyle={{ gap: 8, alignItems: "center" }}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = categoryCounts[cat] ?? 0;
            return (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 999,
                  backgroundColor: isSelected
                    ? isDark
                      ? "rgba(16, 185, 129, 0.18)"
                      : "#EAF6EE"
                    : colors.surface,
                  borderColor: isSelected ? colors.primary : colors.border,
                  borderWidth: isSelected ? 1.5 : 1,
                  gap: 6,
                }}
              >
                {isSelected && (
                  <View
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: 2.5,
                      backgroundColor: colors.primary,
                    }}
                  />
                )}
                <AppText
                  style={{
                    fontSize: 12.5,
                    fontWeight: isSelected ? "700" : "500",
                    color: isSelected ? colors.primary : colors.textPrimary,
                  }}
                >
                  {cat}
                </AppText>
                <View
                  style={{
                    paddingHorizontal: 5.5,
                    paddingVertical: 1,
                    borderRadius: 999,
                    backgroundColor: isSelected
                      ? isDark
                        ? "rgba(16, 185, 129, 0.28)"
                        : "rgba(46, 125, 79, 0.12)"
                      : isDark
                        ? "rgba(255, 255, 255, 0.08)"
                        : "#F0F2F1",
                  }}
                >
                  <AppText
                    style={{
                      fontSize: 10.5,
                      fontWeight: isSelected ? "700" : "600",
                      color: isSelected ? colors.primary : colors.textSecondary,
                    }}
                  >
                    {count}
                  </AppText>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Filter / Search Feedback Bar */}
      {isFiltering && (
        <View className="flex-row items-center justify-between rounded-xl bg-brandSoft/60 px-3 py-1.5 dark:bg-surface-dark">
          <AppText variant="caption" className="font-semibold text-brand">
            Tìm thấy {sortedFilteredItems.length} món{" "}
            {debouncedKeyword ? `cho "${debouncedKeyword}"` : ""}
          </AppText>
          <Pressable onPress={handleClearFilters} hitSlop={8}>
            <AppText variant="caption" className="font-bold text-brand">
              Đặt lại ✕
            </AppText>
          </Pressable>
        </View>
      )}
    </View>
  );

  // Render từng thẻ nguyên liệu bằng ListScreen
  const renderItem: ListRenderItem<EnrichedPantryItem> = ({ item, index }) => {
    if (Number(item.quantity) <= 0) {
      return null;
    }

    const prevCat =
      index > 0 ? sortedFilteredItems[index - 1]?.categoryName || "Khác" : null;
    const currentCat = item.categoryName || "Khác";
    const isNewCategory =
      selectedCategory === "Tất cả" && (index === 0 || prevCat !== currentCat);

    return (
      <View className="gap-2">
        {isNewCategory && (
          <View className="flex-row items-center gap-2 px-1 pt-2">
            <View className="h-2 w-2 rounded-full bg-brand" />
            <AppText variant="label" className="text-sm font-bold text-brand">
              {currentCat}
            </AppText>
          </View>
        )}

        <Pressable
          onPress={() => router.push(`/pantry/${item.id}` as Href)}
          className="active:scale-[0.985]"
        >
          <Card className="flex-row items-center justify-between p-4 shadow-sm">
            <View className="flex-row items-center gap-3.5 flex-1 pr-2">
              <PantryItemThumbnail
                photoUri={item.photoUri}
                location={item.location}
                name={item.ingredientName}
                className="h-12 w-12"
              />
              <View className="flex-1">
                <AppText
                  variant="heading"
                  className="text-base font-semibold"
                  numberOfLines={1}
                >
                  {item.ingredientName}
                </AppText>
                <AppText variant="caption" className="mt-0.5">
                  {Math.round(item.quantity)} {UNIT_LABEL[item.unit]} ·{" "}
                  {item.location === "FREEZER"
                    ? "Tủ đông"
                    : item.location === "PANTRY_SHELF"
                      ? "Kệ bếp"
                      : "Tủ mát"}
                </AppText>
              </View>
            </View>

            <Badge
              label={item.freshness.label}
              tone={TONE_MAP[item.freshness.status]}
            />
          </Card>
        </Pressable>
      </View>
    );
  };

  const renderEmpty = () => {
    return (
      <Card className="items-center justify-center p-8 shadow-sm">
        <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-brandSoft dark:bg-surface-dark">
          <Ionicons
            name={isFiltering ? "search-outline" : "nutrition-outline"}
            size={32}
            color={brand}
          />
        </View>
        <AppText variant="heading" className="text-center">
          {isFiltering ? "Không tìm thấy nguyên liệu" : "Chưa có nguyên liệu"}
        </AppText>
        <AppText variant="caption" className="mt-1 text-center">
          {isFiltering
            ? "Thử tìm với từ khoá khác hoặc xoá bộ lọc"
            : "Nhấn nút (+) bên dưới để thêm món vào tủ"}
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
    );
  };

  return (
    <View className="flex-1 bg-canvas dark:bg-canvas-dark">
      {/* ListScreen trong components: lướt đến đâu load đến đó (onEndReached) */}
      <ListScreen<EnrichedPantryItem>
        data={sortedFilteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        header={renderHeader()}
        empty={renderEmpty()}
        isLoading={isLoading && items.length === 0}
        loadingMessage="Đang tải danh sách nguyên liệu..."
        onEndReached={handleLoadMore}
        isLoadingMore={
          isLoadingMore || (isLoading && items.length > 0 && hasNext)
        }
        hasNext={hasNext}
        onRefresh={onRefresh}
        refreshing={refreshing}
        gap={8}
      />

      {/* Floating Action Button & 3D Menu */}
      <View
        className="absolute bottom-6 right-6 items-end gap-3"
        pointerEvents="box-none"
      >
        {fabOpen &&
          ACTIONS.map((action) => (
            <Pressable
              key={action.route}
              onPress={() => {
                setFabOpen(false);
                router.push(action.route as Href);
              }}
              className="flex-row items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-2.5 shadow-lg active:scale-95 dark:border-line-dark dark:bg-surface-dark"
            >
              <Ionicons name={action.icon} size={18} color={brand} />
              <AppText className="text-xs font-bold">{action.title}</AppText>
            </Pressable>
          ))}

        <Pressable
          onPress={() => setFabOpen(!fabOpen)}
          style={{
            backgroundColor: colors.primary,
            shadowColor: colors.shadowGlow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.35,
            shadowRadius: 8,
            elevation: 6,
          }}
          className="h-14 w-14 items-center justify-center rounded-3xl active:scale-90"
        >
          <Ionicons
            name={fabOpen ? "close" : "add"}
            size={28}
            color={colors.textOnPrimary}
          />
        </Pressable>
      </View>
    </View>
  );
}
