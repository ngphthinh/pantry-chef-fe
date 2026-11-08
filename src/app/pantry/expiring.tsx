import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Screen } from "@/components/ui/Screen";
import { PantryItemThumbnail } from "@/components/pantry/PantryItemThumbnail";
import { TextField } from "@/components/ui/TextField";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { toDisplayDate } from "@/core/format/datetime";
import { usePantry } from "@/features/pantry/usePantry";

const DAY_OPTIONS = [
  { label: "1 ngày tới", days: 1 },
  { label: "3 ngày tới", days: 3 },
  { label: "7 ngày tới", days: 7 },
];

const MAX_DAYS = 365;

const TONE_MAP = {
  fresh: "success",
  soon: "warn",
  expired: "danger",
} as const;

export default function PantryExpiringScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { brand, palette, isDark, colors } = useAppTheme();
  const {
    items,
    expiringItems,
    isLoading,
    loadExpiring,
    loadItems,
    consume,
    remove,
  } = usePantry();

  // Tab chuyển đổi: "soon" (Sắp hết hạn) hoặc "expired" (Đã hết hạn)
  const [activeTab, setActiveTab] = useState<"soon" | "expired">(
    params.tab === "expired" ? "expired" : "soon",
  );

  const [selectedDays, setSelectedDays] = useState(3);
  // Text đang gõ số ngày; null = đang dùng chip nhanh
  const [customText, setCustomText] = useState<string | null>(null);

  // Quản lý Modal Dùng bớt nguyên liệu (hỗ trợ cả Android, iOS & Web)
  const [consumeTarget, setConsumeTarget] = useState<
    (typeof expiringItems)[number] | null
  >(null);
  const [consumeAmount, setConsumeAmount] = useState<string>("1");
  const [isConsuming, setIsConsuming] = useState(false);
  const [consumeError, setConsumeError] = useState<string | null>(null);

  useEffect(() => {
    if (params.tab === "expired") {
      setActiveTab("expired");
    } else if (params.tab === "soon") {
      setActiveTab("soon");
    }
  }, [params.tab]);

  useEffect(() => {
    loadExpiring(selectedDays).catch(() => {});
    if (items.length === 0) {
      loadItems().catch(() => {});
    }
  }, [selectedDays, loadExpiring, loadItems, items.length]);

  // Danh sách CHỈ thực phẩm SẮP hết hạn
  const soonItems = useMemo(
    () => expiringItems.filter((i) => i.freshness.status === "soon"),
    [expiringItems],
  );

  // Danh sách CHỈ thực phẩm ĐÃ hết hạn (kết hợp từ expiringItems và toàn bộ items trong tủ)
  const expiredItems = useMemo(() => {
    const map = new Map<string, (typeof expiringItems)[number]>();
    expiringItems.forEach((i) => {
      if (i.freshness.status === "expired") map.set(i.id, i);
    });
    items.forEach((i) => {
      if (i.freshness.status === "expired") map.set(i.id, i);
    });
    return Array.from(map.values()).sort(
      (a, b) =>
        (a.freshness.daysRemaining ?? 0) - (b.freshness.daysRemaining ?? 0),
    );
  }, [expiringItems, items]);

  const handlePickPreset = (days: number) => {
    setCustomText(null);
    setSelectedDays(days);
  };

  const handleCustomChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 3);
    setCustomText(digits);
    const n = parseInt(digits, 10);
    if (!isNaN(n) && n >= 1 && n <= MAX_DAYS) {
      setSelectedDays(n);
    }
  };

  const customNum = customText ? parseInt(customText, 10) : NaN;
  const isCustomInvalid =
    customText !== null &&
    customText !== "" &&
    (isNaN(customNum) || customNum < 1 || customNum > MAX_DAYS);

  const handleQuickConsume = (item: (typeof expiringItems)[number]) => {
    if (item.quantity <= 0) {
      Alert.alert(
        "Đã hết nguyên liệu",
        `"${item.ingredientName}" hiện còn 0 ${item.unit}. Bạn có muốn bỏ món này khỏi tủ không?`,
        [
          { text: "Để sau", style: "cancel" },
          {
            text: "Bỏ khỏi tủ",
            style: "destructive",
            onPress: () => handleQuickRemove(item.id, item.ingredientName),
          },
        ],
      );
      return;
    }
    setConsumeTarget(item);
    setConsumeAmount(item.quantity < 1 ? String(item.quantity) : "1");
    setConsumeError(null);
  };

  const handleConfirmConsume = async () => {
    if (!consumeTarget) return;
    const qty = parseFloat(consumeAmount.replace(",", "."));
    if (isNaN(qty) || qty <= 0) {
      setConsumeError("Vui lòng nhập số lượng hợp lệ lớn hơn 0");
      return;
    }
    if (qty > consumeTarget.quantity) {
      setConsumeError(
        `Số lượng dùng (${qty} ${consumeTarget.unit}) không thể lớn hơn lượng hiện có (${consumeTarget.quantity} ${consumeTarget.unit})`,
      );
      return;
    }

    try {
      setIsConsuming(true);
      await consume(consumeTarget.id, qty);
      const consumedItem = consumeTarget;
      setConsumeTarget(null);
      await Promise.all([loadExpiring(selectedDays), loadItems()]);
      Alert.alert(
        "Thành công",
        `Đã dùng ${qty} ${consumedItem.unit} ${consumedItem.ingredientName}.`,
      );
    } catch {
      Alert.alert("Lỗi", "Không thể dùng bớt nguyên liệu. Vui lòng thử lại.");
    } finally {
      setIsConsuming(false);
    }
  };

  const handleQuickRemove = (id: string, name?: string) => {
    Alert.alert(
      "Bỏ thực phẩm hết hạn",
      `Bạn có chắc chắn muốn bỏ "${name || "nguyên liệu"}" đã hết hạn này khỏi tủ?`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Bỏ đi",
          style: "destructive",
          onPress: async () => {
            try {
              await remove(id);
              await Promise.all([loadExpiring(selectedDays), loadItems()]);
              Alert.alert("Thành công", `Đã bỏ ${name || "nguyên liệu"} khỏi tủ.`);
            } catch {
              Alert.alert("Lỗi", "Không thể xoá");
            }
          },
        },
      ],
    );
  };

  const handleClearAllExpired = () => {
    if (expiredItems.length === 0) return;
    Alert.alert(
      "Dọn sạch thực phẩm hết hạn",
      `Bạn có chắc muốn bỏ toàn bộ ${expiredItems.length} thực phẩm đã hết hạn khỏi tủ?`,
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Bỏ tất cả",
          style: "destructive",
          onPress: async () => {
            try {
              await Promise.all(expiredItems.map((item) => remove(item.id)));
              await Promise.all([loadExpiring(selectedDays), loadItems()]);
              Alert.alert(
                "Đã dọn dẹp",
                `Đã dọn bỏ thành công ${expiredItems.length} thực phẩm hết hạn!`,
              );
            } catch {
              Alert.alert("Lỗi", "Không thể hoàn tất việc dọn dẹp.");
            }
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-canvas dark:bg-canvas-dark">
      <Screen>
        {/* Header */}
        <View className="flex-row items-center justify-between pb-1">
          <View className="flex-row items-center gap-3">
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-soft dark:bg-surface-dark active:opacity-75">
              <Ionicons name="arrow-back" size={20} color={palette.ink} />
            </Pressable>
            <View>
              <AppText variant="title">
                {activeTab === "soon" ? "Sắp hết hạn" : "Đã hết hạn"}
              </AppText>
              <AppText variant="caption">
                {activeTab === "soon"
                  ? "Ưu tiên chế biến để tránh lãng phí"
                  : "Kiểm tra và dọn bỏ để bảo vệ sức khỏe"}
              </AppText>
            </View>
          </View>
          <View
            style={{
              backgroundColor:
                activeTab === "soon"
                  ? isDark
                    ? "rgba(245, 158, 11, 0.25)"
                    : "#FEF3C7"
                  : isDark
                    ? "rgba(239, 68, 68, 0.25)"
                    : "#FEE2E2",
            }}
            className="h-10 w-10 items-center justify-center rounded-2xl shadow-sm">
            <Ionicons
              name={activeTab === "soon" ? "hourglass-outline" : "trash-outline"}
              size={20}
              color={
                activeTab === "soon"
                  ? isDark
                    ? "#FBBF24"
                    : "#D97706"
                  : isDark
                    ? "#F87171"
                    : "#DC2626"
              }
            />
          </View>
        </View>

        {/* 2 Tab Switcher: Sắp hết hạn vs Đã hết hạn */}
        <View
          style={{
            backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#F1F5F9",
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 18,
            padding: 4,
          }}
          className="flex-row items-center gap-1.5 my-2">
          {/* Tab 1: Sắp hết hạn */}
          <Pressable
            onPress={() => setActiveTab("soon")}
            style={{
              backgroundColor:
                activeTab === "soon"
                  ? isDark
                    ? "rgba(245, 158, 11, 0.25)"
                    : "#FEF3C7"
                  : "transparent",
              borderColor:
                activeTab === "soon"
                  ? isDark
                    ? "rgba(245, 158, 11, 0.45)"
                    : "rgba(217, 119, 6, 0.3)"
                  : "transparent",
              borderWidth: 1,
              borderRadius: 14,
            }}
            className="flex-1 flex-row items-center justify-center py-2.5 px-3 gap-2 active:opacity-80">
            <Ionicons
              name="hourglass-outline"
              size={17}
              color={
                activeTab === "soon"
                  ? isDark
                    ? "#FBBF24"
                    : "#D97706"
                  : palette.muted
              }
            />
            <AppText
              style={{
                fontSize: 13,
                fontWeight: activeTab === "soon" ? "800" : "600",
                color:
                  activeTab === "soon"
                    ? isDark
                      ? "#FBBF24"
                      : "#D97706"
                    : palette.muted,
              }}>
              Sắp hết hạn
            </AppText>
            <View
              style={{
                backgroundColor:
                  activeTab === "soon"
                    ? isDark
                      ? "rgba(245, 158, 11, 0.35)"
                      : "rgba(217, 119, 6, 0.18)"
                    : isDark
                      ? "rgba(255, 255, 255, 0.08)"
                      : "#E2E8F0",
                paddingHorizontal: 7,
                paddingVertical: 1.5,
                borderRadius: 9999,
              }}>
              <AppText
                style={{
                  fontSize: 11,
                  fontWeight: "800",
                  color:
                    activeTab === "soon"
                      ? isDark
                        ? "#FDE68A"
                        : "#92400E"
                      : palette.muted,
                }}>
                {soonItems.length}
              </AppText>
            </View>
          </Pressable>

          {/* Tab 2: Đã hết hạn */}
          <Pressable
            onPress={() => setActiveTab("expired")}
            style={{
              backgroundColor:
                activeTab === "expired"
                  ? isDark
                    ? "rgba(239, 68, 68, 0.25)"
                    : "#FEE2E2"
                  : "transparent",
              borderColor:
                activeTab === "expired"
                  ? isDark
                    ? "rgba(239, 68, 68, 0.45)"
                    : "rgba(220, 38, 38, 0.3)"
                  : "transparent",
              borderWidth: 1,
              borderRadius: 14,
            }}
            className="flex-1 flex-row items-center justify-center py-2.5 px-3 gap-2 active:opacity-80">
            <Ionicons
              name="trash-outline"
              size={17}
              color={
                activeTab === "expired"
                  ? isDark
                    ? "#F87171"
                    : "#DC2626"
                  : palette.muted
              }
            />
            <AppText
              style={{
                fontSize: 13,
                fontWeight: activeTab === "expired" ? "800" : "600",
                color:
                  activeTab === "expired"
                    ? isDark
                      ? "#F87171"
                      : "#DC2626"
                    : palette.muted,
              }}>
              Đã hết hạn
            </AppText>
            <View
              style={{
                backgroundColor:
                  activeTab === "expired"
                    ? isDark
                      ? "rgba(239, 68, 68, 0.35)"
                      : "rgba(220, 38, 38, 0.18)"
                    : isDark
                      ? "rgba(255, 255, 255, 0.08)"
                      : "#E2E8F0",
                paddingHorizontal: 7,
                paddingVertical: 1.5,
                borderRadius: 9999,
              }}>
              <AppText
                style={{
                  fontSize: 11,
                  fontWeight: "800",
                  color:
                    activeTab === "expired"
                      ? isDark
                        ? "#FECACA"
                        : "#991B1B"
                      : palette.muted,
                }}>
                {expiredItems.length}
              </AppText>
            </View>
          </Pressable>
        </View>

        {/* Nội dung Tab: Sắp hết hạn */}
        {activeTab === "soon" ? (
          <View className="flex-1 gap-2.5">
            {/* Chip nhanh chọn mốc ngày */}
            <View className="flex-row flex-wrap gap-2 py-0.5">
              {DAY_OPTIONS.map((opt) => (
                <Chip
                  key={opt.days}
                  label={opt.label}
                  selected={customText === null && selectedDays === opt.days}
                  onPress={() => handlePickPreset(opt.days)}
                />
              ))}
            </View>

            {/* Nhập số ngày tuỳ chọn */}
            <View className="flex-row items-end gap-3">
              <View className="flex-1">
                <TextField
                  label="Hoặc nhập số ngày"
                  value={customText ?? ""}
                  onChangeText={handleCustomChange}
                  placeholder={`Ví dụ: 14 (tối đa ${MAX_DAYS})`}
                  keyboardType="number-pad"
                  maxLength={3}
                />
              </View>
              <View className="h-12 justify-center">
                <AppText className="font-semibold text-muted">ngày tới</AppText>
              </View>
            </View>

            {isCustomInvalid && (
              <AppText variant="caption" className="px-1 font-bold text-dangerInk">
                Nhập số ngày từ 1 đến {MAX_DAYS}.
              </AppText>
            )}

            {/* Danh sách món sắp hết hạn */}
            {isLoading ? (
              <View className="items-center py-16">
                <ActivityIndicator size="large" color={brand} />
                <AppText variant="caption" className="mt-2">
                  Đang quét nguyên liệu sắp hết hạn...
                </AppText>
              </View>
            ) : soonItems.length === 0 ? (
              <Card className="items-center justify-center p-8 text-center shadow-sm">
                <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-successBg shadow-inner dark:bg-surface-dark">
                  <Ionicons
                    name="checkmark-done"
                    size={32}
                    color={palette.successInk}
                  />
                </View>
                <AppText variant="heading" className="text-center">
                  Tuyệt vời!
                </AppText>
                <AppText variant="caption" className="mt-1 text-center">
                  Không có nguyên liệu nào sắp hết hạn trong {selectedDays} ngày
                  tới.
                </AppText>
              </Card>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                className="gap-3 pb-12">
                {soonItems.map((item) => (
                  <Card key={item.id} className="p-4 shadow-sm mb-3">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3 flex-1 pr-2">
                        <PantryItemThumbnail
                          photoUri={item.photoUri}
                          location={item.location}
                          className="h-12 w-12 rounded-2xl"
                          fallbackIcon="alarm-outline"
                          fallbackIconColor={palette.warnInk}
                          fallbackBgClassName="bg-warnBg dark:bg-warnBg-dark"
                        />
                        <View className="flex-1">
                          <AppText variant="heading" numberOfLines={1}>
                            {item.ingredientName}
                          </AppText>
                          <AppText variant="caption" className="mt-0.5">
                            {Math.round(item.quantity)} {item.unit} · HSD:{" "}
                            {item.expiryDate
                              ? toDisplayDate(item.expiryDate)
                              : "N/A"}
                          </AppText>
                        </View>
                      </View>
                      <Badge
                        label={item.freshness.label}
                        tone={TONE_MAP[item.freshness.status]}
                      />
                    </View>

                    <View className="mt-3 flex-row gap-2 border-t border-line pt-3 dark:border-line-dark">
                      <Button
                        title="Dùng bớt"
                        variant="primary"
                        className="flex-1"
                        onPress={() => handleQuickConsume(item)}
                      />
                      <Button
                        title="Chi tiết"
                        variant="outline"
                        className="flex-1"
                        onPress={() => router.push(`/pantry/${item.id}` as Href)}
                      />
                    </View>
                  </Card>
                ))}
              </ScrollView>
            )}
          </View>
        ) : (
          /* Nội dung Tab: Đã hết hạn */
          <View className="flex-1 gap-3">
            {/* Hộp cảnh báo an toàn thực phẩm */}
            <View
              style={{
                backgroundColor: isDark
                  ? "rgba(239, 68, 68, 0.14)"
                  : "#FEF2F2",
                borderColor: isDark
                  ? "rgba(239, 68, 68, 0.35)"
                  : "rgba(220, 38, 38, 0.25)",
                borderWidth: 1.2,
              }}
              className="flex-row items-center gap-3 rounded-2xl p-3.5">
              <View
                style={{
                  backgroundColor: isDark
                    ? "rgba(239, 68, 68, 0.25)"
                    : "rgba(220, 38, 38, 0.15)",
                }}
                className="h-10 w-10 items-center justify-center rounded-xl">
                <Ionicons
                  name="warning"
                  size={20}
                  color={isDark ? "#F87171" : "#DC2626"}
                />
              </View>
              <View className="flex-1">
                <AppText
                  style={{
                    color: isDark ? "#FECACA" : "#991B1B",
                    fontWeight: "800",
                    fontSize: 13,
                  }}>
                  Cảnh báo an toàn vệ sinh
                </AppText>
                <AppText
                  style={{
                    color: isDark ? "rgba(254, 202, 202, 0.85)" : "#B91C1C",
                    fontSize: 11.5,
                    marginTop: 1,
                  }}>
                  Thực phẩm quá hạn có thể hư hỏng. Hãy dọn bỏ để giữ tủ luôn sạch sẽ!
                </AppText>
              </View>
            </View>

            {/* Nút hành động dọn sạch tất cả nếu có nhiều hơn 1 món hết hạn */}
            {expiredItems.length > 1 && (
              <View className="flex-row items-center justify-between px-1">
                <AppText variant="caption" className="font-bold text-muted">
                  Có {expiredItems.length} món cần bỏ
                </AppText>
                <Pressable
                  onPress={handleClearAllExpired}
                  style={{
                    backgroundColor: isDark
                      ? "rgba(239, 68, 68, 0.2)"
                      : "#FEE2E2",
                    borderColor: isDark
                      ? "rgba(239, 68, 68, 0.4)"
                      : "rgba(220, 38, 38, 0.3)",
                    borderWidth: 1,
                  }}
                  className="flex-row items-center gap-1.5 rounded-xl px-3 py-1.5 active:scale-95">
                  <Ionicons
                    name="trash"
                    size={14}
                    color={isDark ? "#F87171" : "#DC2626"}
                  />
                  <AppText
                    style={{
                      color: isDark ? "#F87171" : "#DC2626",
                      fontSize: 11.5,
                      fontWeight: "700",
                    }}>
                    Bỏ tất cả món hết hạn
                  </AppText>
                </Pressable>
              </View>
            )}

            {/* Danh sách món đã hết hạn */}
            {isLoading ? (
              <View className="items-center py-16">
                <ActivityIndicator size="large" color={brand} />
                <AppText variant="caption" className="mt-2">
                  Đang tải danh sách...
                </AppText>
              </View>
            ) : expiredItems.length === 0 ? (
              <Card className="items-center justify-center p-8 text-center shadow-sm">
                <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-successBg shadow-inner dark:bg-surface-dark">
                  <Ionicons
                    name="shield-checkmark"
                    size={32}
                    color={palette.successInk}
                  />
                </View>
                <AppText variant="heading" className="text-center">
                  Kho thực phẩm sạch sẽ!
                </AppText>
                <AppText variant="caption" className="mt-1 text-center">
                  Tuyệt vời! Không có thực phẩm nào bị quá hạn trong tủ của bạn.
                </AppText>
              </Card>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                className="gap-3 pb-12">
                {expiredItems.map((item) => (
                  <Card
                    key={item.id}
                    style={{
                      borderColor: isDark
                        ? "rgba(239, 68, 68, 0.3)"
                        : "rgba(220, 38, 38, 0.2)",
                      borderWidth: 1.2,
                    }}
                    className="p-4 shadow-sm mb-3">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3 flex-1 pr-2">
                        <PantryItemThumbnail
                          photoUri={item.photoUri}
                          location={item.location}
                          className="h-12 w-12 rounded-2xl"
                          fallbackIcon="trash-outline"
                          fallbackIconColor={isDark ? "#F87171" : "#DC2626"}
                          fallbackBgClassName="bg-red-50 dark:bg-red-950/40"
                        />
                        <View className="flex-1">
                          <AppText
                            variant="heading"
                            numberOfLines={1}
                            style={{
                              color: isDark ? "#FCA5A5" : "#991B1B",
                            }}>
                            {item.ingredientName}
                          </AppText>
                          <AppText variant="caption" className="mt-0.5">
                            {Math.round(item.quantity)} {item.unit} · HSD:{" "}
                            {item.expiryDate
                              ? toDisplayDate(item.expiryDate)
                              : "N/A"}
                          </AppText>
                        </View>
                      </View>
                      <Badge
                        label={item.freshness.label}
                        tone="danger"
                      />
                    </View>

                    <View className="mt-3 flex-row gap-2 border-t border-line pt-3 dark:border-line-dark">
                      <Button
                        title="Bỏ đi"
                        variant="outline"
                        className="flex-1 border-red-300 dark:border-red-800"
                        onPress={() =>
                          handleQuickRemove(item.id, item.ingredientName)
                        }
                      />
                      <Button
                        title="Chi tiết"
                        variant="outline"
                        className="flex-1"
                        onPress={() => router.push(`/pantry/${item.id}` as Href)}
                      />
                    </View>
                  </Card>
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </Screen>

      {/* Modal Dùng bớt nguyên liệu (hỗ trợ hoàn hảo Android, iOS & Web) */}
      <Modal
        visible={!!consumeTarget}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!isConsuming) setConsumeTarget(null);
        }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}>
          <Pressable
            style={{ flex: 1 }}
            onPress={() => {
              Keyboard.dismiss();
              if (!isConsuming) setConsumeTarget(null);
            }}
          />
          <Card
            style={{
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              paddingBottom: Platform.OS === "ios" ? 34 : 24,
            }}
            className="p-6 gap-4 shadow-2xl">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2.5">
                <View
                  style={{
                    backgroundColor: isDark
                      ? "rgba(16, 185, 129, 0.2)"
                      : colors.primarySoft,
                  }}
                  className="h-10 w-10 items-center justify-center rounded-2xl">
                  <Ionicons
                    name="restaurant-outline"
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View>
                  <AppText variant="heading">Dùng bớt nguyên liệu</AppText>
                  <AppText variant="caption">
                    {consumeTarget?.ingredientName}
                  </AppText>
                </View>
              </View>
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  if (!isConsuming) setConsumeTarget(null);
                }}
                className="h-8 w-8 items-center justify-center rounded-full bg-soft dark:bg-surface-dark">
                <Ionicons name="close" size={18} color={palette.ink} />
              </Pressable>
            </View>

            {/* Thông tin lượng hiện có */}
            <View
              style={{
                backgroundColor: isDark
                  ? "rgba(255, 255, 255, 0.05)"
                  : "#F8FAFC",
                borderColor: colors.border,
                borderWidth: 1,
              }}
              className="rounded-2xl p-3 flex-row items-center justify-between">
              <AppText variant="caption" className="font-medium">
                Lượng còn trong tủ:
              </AppText>
              <AppText
                className="font-bold text-base"
                style={{ color: colors.primary }}>
                {consumeTarget
                  ? Math.round(consumeTarget.quantity * 100) / 100
                  : 0}{" "}
                {consumeTarget?.unit}
              </AppText>
            </View>

            {/* Input số lượng */}
            <TextField
              label={`Số lượng muốn dùng (${consumeTarget?.unit ?? ""})`}
              value={consumeAmount}
              onChangeText={(text) => {
                setConsumeAmount(text);
                if (consumeError) setConsumeError(null);
              }}
              keyboardType="decimal-pad"
              placeholder={`Ví dụ: ${
                consumeTarget && consumeTarget.quantity >= 100 ? "100" : "1"
              }`}
              error={consumeError}
            />

            {/* Các phím chọn nhanh */}
            {consumeTarget && consumeTarget.quantity > 0 ? (
              <View className="flex-row items-center gap-2 flex-wrap">
                <Pressable
                  onPress={() => {
                    setConsumeAmount(
                      consumeTarget.quantity >= 1
                        ? "1"
                        : String(consumeTarget.quantity),
                    );
                    if (consumeError) setConsumeError(null);
                  }}
                  className="rounded-xl px-3 py-1.5 bg-soft dark:bg-surface-dark border border-line dark:border-line-dark active:scale-95">
                  <AppText variant="caption" className="font-semibold">
                    1 {consumeTarget.unit}
                  </AppText>
                </Pressable>

                {consumeTarget.quantity > 1 ? (
                  <Pressable
                    onPress={() => {
                      const half =
                        Math.round((consumeTarget.quantity / 2) * 100) / 100;
                      setConsumeAmount(String(half));
                      if (consumeError) setConsumeError(null);
                    }}
                    className="rounded-xl px-3 py-1.5 bg-soft dark:bg-surface-dark border border-line dark:border-line-dark active:scale-95">
                    <AppText variant="caption" className="font-semibold">
                      Dùng 50% ({Math.round((consumeTarget.quantity / 2) * 10) / 10})
                    </AppText>
                  </Pressable>
                ) : null}

                <Pressable
                  onPress={() => {
                    setConsumeAmount(String(consumeTarget.quantity));
                    if (consumeError) setConsumeError(null);
                  }}
                  className="rounded-xl px-3 py-1.5 bg-soft dark:bg-surface-dark border border-line dark:border-line-dark active:scale-95">
                  <AppText variant="caption" className="font-semibold">
                    Dùng hết ({consumeTarget.quantity})
                  </AppText>
                </Pressable>
              </View>
            ) : null}

            {/* Action buttons */}
            <View className="flex-row gap-3 pt-2">
              <Button
                title="Huỷ"
                variant="outline"
                className="flex-1"
                disabled={isConsuming}
                onPress={() => {
                  Keyboard.dismiss();
                  setConsumeTarget(null);
                }}
              />
              <Button
                title={isConsuming ? "Đang xử lý..." : "Xác nhận dùng"}
                variant="primary"
                className="flex-1"
                onPress={handleConfirmConsume}
                disabled={isConsuming}
              />
            </View>
          </Card>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
