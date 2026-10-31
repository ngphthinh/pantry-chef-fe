import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  View,
  type ListRenderItem,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ListScreen } from "@/components/ui/ListScreen";
import { Screen } from "@/components/ui/Screen";
import { toDisplayDate } from "@/core/format/datetime";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { useMealPlan } from "@/features/mealplan/useMealPlan";
import type { MealPlanEntryResponse, MealType } from "@/types";

const MEAL_ICONS: Record<
  MealType,
  { icon: keyof typeof Ionicons.glyphMap; label: string; color: string }
> = {
  BREAKFAST: { icon: "sunny-outline", label: "Bữa sáng", color: "#F59E0B" },
  LUNCH: { icon: "partly-sunny-outline", label: "Bữa trưa", color: "#10B981" },
  DINNER: { icon: "moon-outline", label: "Bữa tối", color: "#6366F1" },
};

export default function MealPlanDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { brand, palette } = useAppTheme();
  const {
    currentPlan,
    isLoading,
    isSaving,
    loadPlanById,
    toggleCooked,
    removeEntry,
    removePlan,
  } = useMealPlan();

  const [isFetching, setIsFetching] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Tải chi tiết thực đơn theo ID (GET /v1/meal-plans/{id})
  useEffect(() => {
    let isMounted = true;
    if (id) {
      setIsFetching(true);
      setFetchError(null);
      loadPlanById(id)
        .catch((err: any) => {
          if (isMounted) {
            setFetchError(err?.message || "Không thể tải chi tiết thực đơn");
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsFetching(false);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [id, loadPlanById]);

  const onRefresh = async () => {
    if (!id) return;
    setRefreshing(true);
    try {
      await loadPlanById(id);
    } finally {
      setRefreshing(false);
    }
  };

  const plan = currentPlan && currentPlan.id === id ? currentPlan : null;

  // Sắp xếp các bữa ăn theo ngày và theo thứ tự Bữa sáng -> Bữa trưa -> Bữa tối
  const sortedEntries = useMemo(() => {
    if (!plan?.entries) return [];
    const mealOrder: Record<MealType, number> = {
      BREAKFAST: 1,
      LUNCH: 2,
      DINNER: 3,
    };
    return [...plan.entries].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return (mealOrder[a.mealType] || 0) - (mealOrder[b.mealType] || 0);
    });
  }, [plan?.entries]);

  const cookedCount = useMemo(() => {
    return sortedEntries.filter((e) => e.cooked).length;
  }, [sortedEntries]);

  const handleToggleCooked = async (entry: MealPlanEntryResponse) => {
    try {
      await toggleCooked(entry.id, entry.cooked);
    } catch {
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái bữa ăn");
    }
  };

  const handleDeleteEntry = (entry: MealPlanEntryResponse) => {
    Alert.alert(
      "Xác nhận xoá",
      `Bạn muốn bỏ bữa ăn "${entry.recipeTitle || "Món ăn"}"?`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            try {
              await removeEntry(entry.id);
            } catch {
              Alert.alert("Lỗi", "Không thể xoá bữa ăn");
            }
          },
        },
      ],
    );
  };

  const handleDeletePlan = () => {
    Alert.alert(
      "Xoá toàn bộ thực đơn",
      "Bạn có chắc muốn xoá toàn bộ thực đơn tuần này?",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá thực đơn",
          style: "destructive",
          onPress: async () => {
            try {
              await removePlan();
              Alert.alert("Thành công", "Đã xoá thực đơn tuần", [
                { text: "OK", onPress: () => router.back() },
              ]);
            } catch {
              Alert.alert("Lỗi", "Không thể xoá thực đơn");
            }
          },
        },
      ],
    );
  };

  // Hiển thị loading animation khi đang tải dữ liệu
  if ((isFetching || isLoading) && !plan) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas dark:bg-canvas-dark">
        <ActivityIndicator size="large" color={brand} />
        <AppText variant="caption" className="mt-3 font-medium text-muted">
          Đang tải chi tiết thực đơn...
        </AppText>
      </View>
    );
  }

  if (fetchError && !plan) {
    return (
      <Screen>
        <View className="flex-row items-center gap-3 pb-4">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-soft dark:bg-surface-dark">
            <Ionicons name="arrow-back" size={20} color={palette.ink} />
          </Pressable>
          <AppText variant="heading">Chi tiết thực đơn</AppText>
        </View>
        <Card className="items-center p-8 text-center shadow-sm">
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={palette.warnInk}
          />
          <AppText variant="heading" className="mt-3 text-center">
            {fetchError}
          </AppText>
          <Button
            title="Quay lại"
            onPress={() => router.back()}
            className="mt-6 w-full max-w-xs"
          />
        </Card>
      </Screen>
    );
  }

  // Header component hiển thị thông tin thực đơn tuần và các nút tác vụ nhanh
  const renderHeader = () => (
    <View className="gap-4 pb-2">
      {/* Navigation Header */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-soft active:scale-95 dark:bg-surface-dark">
            <Ionicons name="arrow-back" size={20} color={palette.ink} />
          </Pressable>
          <View>
            <AppText variant="title">Chi tiết thực đơn</AppText>
            <AppText variant="caption">
              Tuần từ {plan?.weekStart ? toDisplayDate(plan.weekStart) : "N/A"}
            </AppText>
          </View>
        </View>

        <Pressable
          onPress={handleDeletePlan}
          className="h-10 w-10 items-center justify-center rounded-full bg-dangerBg active:scale-95 dark:bg-dangerBg-dark">
          <Ionicons name="trash-outline" size={18} color={palette.dangerInk} />
        </Pressable>
      </View>

      {/* Overview Statistics Card */}
      <Card className="p-4 shadow-sm">
        <View className="flex-row items-center justify-between pb-3">
          <View>
            <AppText variant="label" className="text-muted">
              Tiến độ nấu tuần này
            </AppText>
            <AppText variant="heading" className="mt-0.5 text-xl font-bold">
              {cookedCount} / {sortedEntries.length} bữa hoàn thành
            </AppText>
          </View>
          <Badge
            label={
              cookedCount === sortedEntries.length && sortedEntries.length > 0
                ? "Hoàn thành"
                : `${Math.round(
                    sortedEntries.length
                      ? (cookedCount / sortedEntries.length) * 100
                      : 0,
                  )}%`
            }
            tone={
              cookedCount === sortedEntries.length && sortedEntries.length > 0
                ? "success"
                : "warn"
            }
          />
        </View>

        {/* Shortcuts bar */}
        <View className="flex-row gap-2 border-t border-line pt-3 dark:border-line-dark">
          <Pressable
            onPress={() => router.push("/meal-plan/add-entry" as Href)}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl bg-brandSoft p-2.5 active:scale-95 dark:bg-surface-dark">
            <Ionicons name="add-circle" size={18} color={brand} />
            <AppText className="text-xs font-bold text-brand">Thêm bữa</AppText>
          </Pressable>

          <Pressable
            onPress={() => router.push("/meal-plan/shopping-preview" as Href)}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl bg-brandSoft p-2.5 active:scale-95 dark:bg-surface-dark">
            <Ionicons name="cart" size={18} color={brand} />
            <AppText className="text-xs font-bold text-brand">Mua sắm</AppText>
          </Pressable>

          <Pressable
            onPress={() => router.push("/ai/meal-plan" as Href)}
            className="flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl bg-brandSoft p-2.5 active:scale-95 dark:bg-surface-dark">
            <Ionicons name="sparkles" size={18} color={brand} />
            <AppText className="text-xs font-bold text-brand">AI gợi ý</AppText>
          </Pressable>
        </View>
      </Card>

      <View className="flex-row items-center justify-between px-1 pt-1">
        <AppText variant="label" className="text-sm font-bold">
          Danh sách các bữa ăn ({sortedEntries.length})
        </AppText>
        <AppText variant="caption" className="text-muted">
          Kéo xuống để tải lại
        </AppText>
      </View>
    </View>
  );

  // Render từng item bữa ăn bằng ListScreen
  const renderItem: ListRenderItem<MealPlanEntryResponse> = ({ item, index }) => {
    const meta = MEAL_ICONS[item.mealType] || MEAL_ICONS.LUNCH;
    const isFirstOfDay =
      index === 0 || sortedEntries[index - 1]?.date !== item.date;

    return (
      <View className="gap-2">
        {isFirstOfDay && (
          <View className="flex-row items-center gap-2 px-1 pt-2">
            <View className="h-2 w-2 rounded-full bg-brand" />
            <AppText variant="label" className="text-sm font-bold text-brand">
              {toDisplayDate(item.date)}
            </AppText>
          </View>
        )}

        <Card className="flex-row items-center justify-between p-4 shadow-sm">
          <View className="flex-row items-center gap-3.5 flex-1 pr-2">
            {item.recipeImageUrl ? (
              <Image
                source={{ uri: item.recipeImageUrl }}
                className="h-12 w-12 rounded-2xl bg-soft dark:bg-soft-dark"
                resizeMode="cover"
              />
            ) : (
              <View
                className="h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${meta.color}20` }}>
                <Ionicons name={meta.icon} size={22} color={meta.color} />
              </View>
            )}

            <View className="flex-1">
              <View className="flex-row items-center gap-1.5">
                <AppText
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: meta.color }}>
                  {meta.label}
                </AppText>
                {item.servings ? (
                  <AppText variant="caption" className="text-xs text-muted">
                    · {item.servings} người ăn
                  </AppText>
                ) : null}
              </View>

              <AppText
                variant="heading"
                className={`mt-0.5 text-base font-semibold ${
                  item.cooked ? "line-through text-muted opacity-75" : ""
                }`}
                numberOfLines={1}>
                {item.recipeTitle || "Món ăn chưa đặt tên"}
              </AppText>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            {/* Toggle Cooked */}
            <Pressable
              onPress={() => handleToggleCooked(item)}
              className={`flex-row items-center gap-1 rounded-full px-2.5 py-1.5 active:scale-95 ${
                item.cooked
                  ? "bg-successBg dark:bg-successBg-dark"
                  : "bg-soft dark:bg-soft-dark"
              }`}>
              <Ionicons
                name={item.cooked ? "checkmark-circle" : "ellipse-outline"}
                size={16}
                color={item.cooked ? palette.successInk : palette.muted}
              />
              <AppText
                variant="caption"
                className={
                  item.cooked
                    ? "font-bold text-success"
                    : "font-semibold text-muted"
                }>
                {item.cooked ? "Đã nấu" : "Chưa nấu"}
              </AppText>
            </Pressable>

            {/* Delete Entry */}
            <Pressable
              onPress={() => handleDeleteEntry(item)}
              hitSlop={8}
              className="p-1 active:opacity-70">
              <Ionicons
                name="trash-outline"
                size={16}
                color={palette.dangerInk}
              />
            </Pressable>
          </View>
        </Card>
      </View>
    );
  };

  const renderEmpty = () => (
    <Card className="items-center justify-center p-8 shadow-sm">
      <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-brandSoft dark:bg-surface-dark">
        <Ionicons name="calendar-outline" size={32} color={brand} />
      </View>
      <AppText variant="heading" className="text-center">
        Chưa có bữa ăn nào trong thực đơn
      </AppText>
      <AppText variant="caption" className="mt-1 text-center">
        Hãy bắt đầu lên kế hoạch các bữa ăn cho tuần này nhé
      </AppText>
      <Button
        title="Thêm bữa ăn đầu tiên"
        onPress={() => router.push("/meal-plan/add-entry" as Href)}
        className="mt-4 w-full max-w-xs"
      />
    </Card>
  );

  return (
    <ListScreen<MealPlanEntryResponse>
      data={sortedEntries}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      header={renderHeader()}
      empty={renderEmpty()}
      isLoading={isFetching || (isLoading && !plan)}
      loadingMessage="Đang tải chi tiết thực đơn..."
      onRefresh={onRefresh}
      refreshing={refreshing}
      gap={10}
    />
  );
}
