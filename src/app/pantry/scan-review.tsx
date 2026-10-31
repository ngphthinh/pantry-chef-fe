import React, { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { getErrorMessage } from "@/core/http/apiError";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { ingredientPicker } from "@/features/ingredient/ingredientPicker";
import { usePantry } from "@/features/pantry/usePantry";
import type { PantryItemCreateRequest, StorageLocation, Unit } from "@/types";

/** Dữ liệu `pantry/scan` truyền sang (một phần tử của `RecognizedIngredientResponse`). */
interface ScannedParamItem {
  name: string;
  nameEn?: string;
  confidence: number;
  quantityHint?: string | null;
}

interface ScannedReviewItem {
  key: string;
  name: string;
  confidence: number;
  quantity: number;
  unit: Unit;
  location: StorageLocation;
  expiryDate?: string;
  /** Gán qua `select-ingredient`; chưa có thì chưa lưu được. */
  ingredientId?: string;
  ingredientName?: string;
}

const UNITS: Unit[] = [
  "MG",
  "G",
  "KG",
  "ML",
  "L",
  "PCS",
  "TBSP",
  "TSP",
  "CUP",
  "PINCH",
];
const isUnit = (value: string | null | undefined): value is Unit =>
  !!value && (UNITS as string[]).includes(value);

const UNIT_ALIASES: Record<string, Unit> = {
  g: "G",
  kg: "KG",
  ml: "ML",
  l: "L",
  lít: "L",
};

/** Đọc số lượng / đơn vị từ gợi ý của AI, ví dụ "500g", "2 quả". Không đọc được thì 1 PCS. */
function parseQuantityHint(hint?: string | null): {
  quantity: number;
  unit: Unit;
} {
  const match = hint?.match(/(\d+(?:[.,]\d+)?)\s*(kg|g|ml|lít|l)?/i);
  if (!match) return { quantity: 1, unit: "PCS" };
  const quantity = Number(match[1].replace(",", "."));
  return {
    quantity: quantity > 0 ? quantity : 1,
    unit: UNIT_ALIASES[match[2]?.toLowerCase() ?? ""] ?? "PCS",
  };
}

/** Gram / ml thì tăng giảm theo 50, các đơn vị còn lại theo 1. */
const stepOf = (unit: Unit) => (unit === "G" || unit === "ML" ? 50 : 1);

const locationLabel = (location: StorageLocation) =>
  location === "FREEZER"
    ? "Tủ đông"
    : location === "PANTRY_SHELF"
      ? "Kệ bếp"
      : "Tủ mát";

function parseItems(raw?: string): ScannedReviewItem[] {
  if (!raw) return [];
  try {
    const list = JSON.parse(raw) as ScannedParamItem[];
    return list.map((r, index) => ({
      key: `${index}-${r.nameEn ?? r.name}`,
      name: r.name,
      confidence: r.confidence,
      location: "FRIDGE" as StorageLocation,
      ...parseQuantityHint(r.quantityHint),
    }));
  } catch {
    return [];
  }
}

export default function PantryScanReviewScreen() {
  const router = useRouter();
  const { brand, palette } = useAppTheme();
  const { createBatch, isSaving } = usePantry();
  const params = useLocalSearchParams<{ items?: string }>();

  const [items, setItems] = useState<ScannedReviewItem[]>(() =>
    parseItems(params.items),
  );

  const unassigned = items.filter((i) => !i.ingredientId).length;

  const updateItemQty = (key: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;
        const step = stepOf(item.unit);
        return {
          ...item,
          quantity: Math.max(step, item.quantity + delta * step),
        };
      }),
    );
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  };

  /** Mở màn chọn nguyên liệu mà vẫn giữ danh sách này (không bị thay thế). */
  const pickIngredient = (key: string) => {
    ingredientPicker.request((picked) => {
      setItems((prev) =>
        prev.map((item) =>
          item.key === key
            ? {
                ...item,
                ingredientId: picked.ingredientId,
                ingredientName: picked.ingredientName,
                unit: isUnit(picked.defaultUnit)
                  ? picked.defaultUnit
                  : item.unit,
              }
            : item,
        ),
      );
    });
    router.push({
      pathname: "/pantry/select-ingredient",
      params: { pick: "1" },
    } as Href);
  };

  const handleSaveBatch = async () => {
    if (items.length === 0) {
      Alert.alert("Thông báo", "Không có nguyên liệu nào để lưu");
      return;
    }
    if (unassigned > 0) {
      Alert.alert(
        "Thông báo",
        `Còn ${unassigned} món chưa chọn nguyên liệu trong danh mục.`,
      );
      return;
    }

    try {
      const batchPayload: PantryItemCreateRequest[] = items.map((i) => ({
        ingredientId: i.ingredientId as string,
        quantity: i.quantity,
        unit: i.unit,
        location: i.location,
        expiryDate: i.expiryDate,
      }));

      await createBatch({ items: batchPayload });
      Alert.alert("Thành công", `Đã lưu ${items.length} món vào tủ!`, [
        { text: "Về tủ đồ", onPress: () => router.push("/(tabs)/pantry") },
      ]);
    } catch (error) {
      Alert.alert("Lỗi", getErrorMessage(error));
    }
  };

  return (
    <View className="flex-1 bg-canvas dark:bg-canvas-dark">
      <Screen>
        {/* Header */}
        <View className="flex-row items-center justify-between pb-2">
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-soft dark:bg-surface-dark"
            >
              <Ionicons name="arrow-back" size={20} color={palette.ink} />
            </Pressable>
            <View>
              <AppText variant="title">Kiểm tra quét AI</AppText>
              <AppText variant="caption">
                AI nhận diện {items.length} nguyên liệu
              </AppText>
            </View>
          </View>
          <Badge label="AI Smart" tone="success" />
        </View>

        {/* Info banner */}
        <Card className="flex-row items-center gap-3 bg-brandSoft/50 p-4 shadow-sm dark:bg-surface-dark">
          <Ionicons name="sparkles" size={24} color={brand} />
          <AppText variant="caption" className="flex-1 font-medium text-brand">
            Chọn nguyên liệu trong danh mục cho từng món, chỉnh số lượng hoặc bỏ
            món nhận diện sai trước khi lưu.
          </AppText>
        </Card>

        {/* List of scanned items */}
        <ScrollView showsVerticalScrollIndicator={false} className="gap-3 pb-8">
          {items.map((item) => (
            <Card key={item.key} className="p-4 shadow-sm">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                  <AppText variant="heading">{item.name}</AppText>
                  <View className="mt-1 flex-row items-center gap-2">
                    <AppText variant="caption">Độ tin cậy:</AppText>
                    <Badge
                      label={`${Math.round(item.confidence * 100)}%`}
                      tone="success"
                    />
                  </View>
                </View>

                <Pressable
                  onPress={() => removeItem(item.key)}
                  accessibilityRole="button"
                  accessibilityLabel={`Bỏ ${item.name}`}
                  className="h-8 w-8 items-center justify-center rounded-full bg-dangerBg dark:bg-dangerBg-dark"
                >
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color={palette.dangerInk}
                  />
                </Pressable>
              </View>

              {/* Gán nguyên liệu trong danh mục */}
              <Pressable
                onPress={() => pickIngredient(item.key)}
                accessibilityRole="button"
                className={`mt-3 flex-row items-center justify-between rounded-2xl p-3 active:opacity-70 ${
                  item.ingredientId
                    ? "bg-brandSoft dark:bg-surface-dark"
                    : "border border-dashed border-line dark:border-line-dark"
                }`}
              >
                <View className="flex-1 flex-row items-center gap-2">
                  <Ionicons
                    name={
                      item.ingredientId ? "checkmark-circle" : "search-outline"
                    }
                    size={18}
                    color={item.ingredientId ? brand : palette.muted}
                  />
                  <AppText
                    numberOfLines={1}
                    className={
                      item.ingredientId
                        ? "flex-1 font-bold text-brand"
                        : "flex-1 text-muted"
                    }
                  >
                    {item.ingredientName ??
                      "Chọn nguyên liệu trong danh mục..."}
                  </AppText>
                </View>
                <AppText variant="caption" className="font-bold text-brand">
                  {item.ingredientId ? "Đổi" : "Chọn"}
                </AppText>
              </Pressable>

              {/* Quantity stepper & location */}
              <View className="mt-3 flex-row items-center justify-between border-t border-line pt-3 dark:border-line-dark">
                <View className="flex-row items-center gap-2">
                  <Ionicons
                    name="cube-outline"
                    size={16}
                    color={palette.muted}
                  />
                  <AppText variant="caption">
                    {locationLabel(item.location)}
                  </AppText>
                </View>

                <View className="flex-row items-center gap-2 rounded-2xl bg-soft p-1 dark:bg-soft-dark">
                  <Pressable
                    onPress={() => updateItemQty(item.key, -1)}
                    className="h-7 w-7 items-center justify-center rounded-xl bg-white shadow-xs active:scale-95 dark:bg-surface-dark"
                  >
                    <Ionicons name="remove" size={16} color={palette.ink} />
                  </Pressable>
                  <AppText className="min-w-16 text-center font-bold">
                    {item.quantity} {item.unit}
                  </AppText>
                  <Pressable
                    onPress={() => updateItemQty(item.key, 1)}
                    className="h-7 w-7 items-center justify-center rounded-xl bg-white shadow-xs active:scale-95 dark:bg-surface-dark"
                  >
                    <Ionicons name="add" size={16} color={palette.ink} />
                  </Pressable>
                </View>
              </View>
            </Card>
          ))}

          {items.length === 0 && (
            <Card className="items-center p-8">
              <AppText variant="caption">
                Không có món nào trong danh sách
              </AppText>
            </Card>
          )}

          {/* Submit batch */}
          <Button
            title={
              isSaving
                ? "Đang lưu vào tủ..."
                : unassigned > 0
                  ? `Còn ${unassigned} món chưa chọn nguyên liệu`
                  : `Lưu tất cả (${items.length} món)`
            }
            onPress={handleSaveBatch}
            variant="primary"
            disabled={isSaving || items.length === 0 || unassigned > 0}
            className="mt-3"
          />
        </ScrollView>
      </Screen>
    </View>
  );
}
