import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { TactileButton } from "@/components/ui/TactileButton";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { showAlert } from "@/components/ui/dialogs";
import { useMealPlan } from "@/features/mealplan/useMealPlan";
import { useShopping } from "@/features/shopping/useShopping";
import { toDisplayDate } from "@/core/format/datetime";
import type { ShoppingItemResponse, ShoppingListResponse } from "@/types";

const PAGE_SIZE = 8;

/** Kiểm tra xem tên danh sách mua sắm có thuộc tuần thực đơn đang chọn không */
function isShoppingListForWeek(listName: string, weekStart?: string): boolean {
  if (!listName || !weekStart) return false;
  const name = listName.toLowerCase().trim();

  // Khớp chuỗi YYYY-MM-DD trực tiếp
  if (name.includes(weekStart.toLowerCase())) return true;

  const parts = weekStart.split("-").map(Number);
  if (parts.length === 3) {
    const [y, m, d] = parts;
    const dPad = String(d).padStart(2, "0");
    const mPad = String(m).padStart(2, "0");

    const patterns = [
      `${dPad}/${mPad}/${y}`,
      `${d}/${m}/${y}`,
      `${dPad}-${mPad}-${y}`,
      `${d}-${m}-${y}`,
    ];

    for (const pat of patterns) {
      if (name.includes(pat)) return true;
    }
  }
  return false;
}

export default function MealPlanShoppingPreviewScreen() {
  const router = useRouter();
  const { brand, palette, colors, isDark } = useAppTheme();
  const { currentPlan, shoppingPreview, isLoading, loadShoppingList } =
    useMealPlan();

  const {
    lists,
    load: loadShoppingLists,
    createFromMealPlan,
    removeList,
    isSaving: savingList,
  } = useShopping();

  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    void loadShoppingLists();
  }, [loadShoppingLists]);

  useEffect(() => {
    if (currentPlan?.id) {
      loadShoppingList().catch(() => {});
    }
  }, [currentPlan?.id, loadShoppingList]);

  // Lọc nguyên liệu theo từ khoá tìm kiếm
  const safeList = useMemo(
    () => (Array.isArray(shoppingPreview) ? shoppingPreview : []),
    [shoppingPreview],
  );

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return safeList;
    const query = searchQuery.trim().toLowerCase();
    return safeList.filter((item) => item.name.toLowerCase().includes(query));
  }, [safeList, searchQuery]);

  // Tính toán số trang
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

  // Đảm bảo currentPage luôn nằm trong phạm vi hợp lệ
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Cắt danh sách theo trang hiện tại
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  const executeSave = async (oldDuplicates: ShoppingListResponse[] = []) => {
    if (!currentPlan?.id) return;

    // Dọn dẹp các danh sách cũ trùng tuần này để không bị nhân bản
    if (oldDuplicates.length > 0) {
      for (const old of oldDuplicates) {
        await removeList(old.id).catch(() => {});
      }
    }

    const result = await createFromMealPlan(currentPlan.id);
    if (!result.ok) {
      showAlert("Chưa tạo được danh sách", result.message);
      return;
    }

    const isUpdated = oldDuplicates.length > 0;
    const message = isUpdated
      ? `Đã cập nhật lại ${safeList.length} nguyên liệu cho thực đơn tuần này. Bạn có muốn mở danh sách đi chợ ngay bây giờ không?`
      : `Hệ thống đã lưu ${safeList.length} nguyên liệu vào danh sách mua sắm. Bạn có muốn mở danh sách đi chợ ngay bây giờ không?`;

    if (Platform.OS === "web") {
      const openNow = window.confirm(
        `${isUpdated ? "Đã cập nhật danh sách mua sắm!" : "Đã lưu danh sách mua sắm!"}\n\n${message}`,
      );
      if (openNow) {
        router.push(`/shopping/${result.data.id}` as any);
      } else {
        router.back();
      }
      return;
    }

    Alert.alert(
      isUpdated ? "Đã cập nhật danh sách mua sắm" : "Đã lưu danh sách mua sắm",
      message,
      [
        {
          text: "Để sau",
          style: "cancel",
          onPress: () => router.back(),
        },
        {
          text: "Mở danh sách",
          style: "default",
          onPress: () => router.push(`/shopping/${result.data.id}` as any),
        },
      ],
      { cancelable: true },
    );
  };

  const handleSaveToShoppingList = async () => {
    if (!currentPlan?.id) return;
    if (safeList.length === 0) {
      showAlert("Thông báo", "Không có nguyên liệu nào để tạo danh sách mua");
      return;
    }

    // Kiểm tra xem đã có danh sách mua sắm nào trùng tuần này chưa
    const existingDuplicates = lists.filter((l) =>
      isShoppingListForWeek(l.name, currentPlan.weekStart),
    );

    if (existingDuplicates.length > 0) {
      const weekDateLabel = currentPlan.weekStart
        ? toDisplayDate(currentPlan.weekStart)
        : "";

      if (Platform.OS === "web") {
        const confirmUpdate = window.confirm(
          `Đã có danh sách mua sắm cho tuần này (${weekDateLabel}).\n\nBạn có muốn cập nhật lại danh sách theo thực đơn mới nhất không?`,
        );
        if (confirmUpdate) {
          await executeSave(existingDuplicates);
        }
        return;
      }

      Alert.alert(
        "Cập nhật danh sách mua sắm",
        `Đã có danh sách mua sắm cho tuần ${weekDateLabel}. Bạn có muốn cập nhật lại danh sách này theo thực đơn mới nhất không?`,
        [
          { text: "Huỷ", style: "cancel" },
          {
            text: "Cập nhật lại",
            style: "default",
            onPress: () => void executeSave(existingDuplicates),
          },
        ],
        { cancelable: true },
      );
      return;
    }

    // Chưa có danh sách nào -> lưu mới bình thường
    await executeSave();
  };

  const formatQuantity = (item: ShoppingItemResponse) => {
    if (item.quantity === null || item.quantity === undefined) return "Vừa đủ";
    const rounded = Math.round(item.quantity * 100) / 100;
    return `${rounded} ${item.unit || ""}`.trim();
  };

  // Tạo mảng số trang để nhảy nhanh
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + 4);
      if (end - start < 4) {
        start = Math.max(1, end - 4);
      }
      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  }, [totalPages, currentPage]);

  return (
    <View className="flex-1 bg-canvas dark:bg-canvas-dark">
      <Screen>
        {/* Header */}
        <View className="flex-row items-center justify-between pb-2 border-b border-line dark:border-line-dark">
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-soft dark:bg-surface-dark active:opacity-70">
              <Ionicons name="arrow-back" size={20} color={palette.ink} />
            </Pressable>
            <View>
              <AppText variant="title">Nguyên liệu cần mua</AppText>
              <AppText variant="caption" className="text-muted">
                Tính toán tự động từ các bữa ăn trong tuần
              </AppText>
            </View>
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brandSoft dark:bg-surface-dark">
            <Ionicons name="cart-outline" size={20} color={brand} />
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: 14,
            paddingBottom: 24,
            gap: 12,
          }}>
          {/* Summary Card */}
          <Card className="flex-row items-center justify-between bg-brandSoft/40 p-4 shadow-sm dark:bg-surface-dark">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brand/15">
                <Ionicons name="calculator-outline" size={22} color={brand} />
              </View>
              <View>
                <AppText className="font-bold text-brand">
                  {safeList.length} nguyên liệu cần thiết
                </AppText>
                <AppText variant="caption" className="text-muted">
                  Đã đối soát với các món trong tủ
                </AppText>
              </View>
            </View>
            <Badge label="Tự động" tone="success" />
          </Card>

          {/* Search bar when items exist */}
          {safeList.length > 0 && (
            <View
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderWidth: 1.2,
              }}
              className="flex-row items-center gap-2.5 rounded-2xl px-3.5 py-2.5 shadow-xs">
              <Ionicons name="search-outline" size={18} color={palette.muted} />
              <TextInput
                placeholder="Tìm nhanh nguyên liệu cần mua..."
                placeholderTextColor={palette.muted}
                value={searchQuery}
                onChangeText={(t) => {
                  setSearchQuery(t);
                  setCurrentPage(1);
                }}
                style={{
                  flex: 1,
                  color: palette.ink,
                  fontSize: 14,
                  paddingVertical: 0,
                }}
              />
              {searchQuery ? (
                <Pressable
                  onPress={() => {
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  hitSlop={8}
                  className="p-0.5">
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={palette.muted}
                  />
                </Pressable>
              ) : null}
            </View>
          )}

          {/* List Content */}
          {isLoading && safeList.length === 0 ? (
            <View className="items-center py-16">
              <ActivityIndicator size="large" color={brand} />
              <AppText variant="caption" className="mt-2 text-muted">
                Đang tính toán nguyên liệu...
              </AppText>
            </View>
          ) : safeList.length === 0 ? (
            <Card className="items-center justify-center p-8 text-center shadow-sm">
              <Ionicons name="bag-check-outline" size={44} color={brand} />
              <AppText variant="heading" className="mt-2 text-center">
                Đủ nguyên liệu!
              </AppText>
              <AppText variant="caption" className="mt-1 text-center text-muted">
                Tủ lạnh của bạn đã có đủ nguyên liệu cho các bữa ăn tuần này,
                không cần mua thêm.
              </AppText>
            </Card>
          ) : filteredItems.length === 0 ? (
            <Card className="items-center justify-center p-8 text-center shadow-sm">
              <Ionicons name="search-outline" size={36} color={palette.muted} />
              <AppText variant="heading" className="mt-2 text-center text-sm">
                Không tìm thấy nguyên liệu
              </AppText>
              <AppText variant="caption" className="mt-1 text-center text-muted">
                Không có món nào khớp với &quot;{searchQuery}&quot;
              </AppText>
            </Card>
          ) : (
            <View className="gap-2.5">
              {/* Paginated Cards */}
              {paginatedItems.map((item) => (
                <Card
                  key={item.id}
                  className="flex-row items-center justify-between p-3.5 shadow-sm">
                  <View className="flex-row items-center gap-3 flex-1 pr-2">
                    <View className="h-10 w-10 items-center justify-center rounded-2xl bg-soft shadow-inner dark:bg-soft-dark">
                      <Ionicons
                        name="basket-outline"
                        size={19}
                        color={brand}
                      />
                    </View>
                    <View className="flex-1">
                      <AppText
                        variant="heading"
                        numberOfLines={1}
                        className="text-sm font-bold text-ink dark:text-ink-dark">
                        {item.name}
                      </AppText>
                      <AppText variant="caption" className="mt-0.5 text-muted">
                        Cần: {formatQuantity(item)}
                      </AppText>
                    </View>
                  </View>

                  <Badge label="Cần mua" tone="warn" />
                </Card>
              ))}

              {/* Pagination Controls Bar */}
              {totalPages > 1 && (
                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                  }}
                  className="mt-2 rounded-2xl p-3 shadow-xs gap-2.5">
                  <View className="flex-row items-center justify-between">
                    <Pressable
                      onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      style={{ opacity: currentPage <= 1 ? 0.35 : 1 }}
                      className="flex-row items-center gap-1 rounded-xl bg-soft px-3 py-1.5 dark:bg-soft-dark active:opacity-70">
                      <Ionicons
                        name="chevron-back"
                        size={15}
                        color={palette.ink}
                      />
                      <AppText className="text-xs font-bold text-ink dark:text-ink-dark">
                        Trước
                      </AppText>
                    </Pressable>

                    {/* Quick Jump Page Number Pills */}
                    <View className="flex-row items-center gap-1.5">
                      {pageNumbers.map((pageNum) => {
                        const isCurrent = pageNum === currentPage;
                        return (
                          <Pressable
                            key={pageNum}
                            onPress={() => setCurrentPage(pageNum)}
                            style={{
                              backgroundColor: isCurrent
                                ? brand
                                : isDark
                                  ? "rgba(255,255,255,0.06)"
                                  : "#F1F5F9",
                            }}
                            className="h-7 w-7 items-center justify-center rounded-lg active:scale-95">
                            <AppText
                              style={{
                                color: isCurrent ? "#fff" : palette.ink,
                                fontSize: 11,
                                fontWeight: isCurrent ? "800" : "600",
                              }}>
                              {pageNum}
                            </AppText>
                          </Pressable>
                        );
                      })}
                    </View>

                    <Pressable
                      onPress={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage >= totalPages}
                      style={{
                        opacity: currentPage >= totalPages ? 0.35 : 1,
                      }}
                      className="flex-row items-center gap-1 rounded-xl bg-soft px-3 py-1.5 dark:bg-soft-dark active:opacity-70">
                      <AppText className="text-xs font-bold text-ink dark:text-ink-dark">
                        Sau
                      </AppText>
                      <Ionicons
                        name="chevron-forward"
                        size={15}
                        color={palette.ink}
                      />
                    </Pressable>
                  </View>

                  {/* Summary Text */}
                  <View className="items-center">
                    <AppText
                      variant="caption"
                      className="text-[11px] text-muted">
                      Hiển thị {(currentPage - 1) * PAGE_SIZE + 1} -{" "}
                      {Math.min(currentPage * PAGE_SIZE, filteredItems.length)}{" "}
                      trong tổng số {filteredItems.length} nguyên liệu
                    </AppText>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Save to Shopping List CTA */}
          {safeList.length > 0 && (
            <View className="pt-2">
              <TactileButton
                title={
                  savingList
                    ? "Đang tạo danh sách mua..."
                    : `Lưu ${safeList.length} món vào danh sách mua sắm`
                }
                onPress={handleSaveToShoppingList}
                disabled={savingList || safeList.length === 0}
              />
            </View>
          )}
        </ScrollView>
      </Screen>
    </View>
  );
}
