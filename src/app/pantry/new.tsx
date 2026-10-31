import React, { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DatePickerModal } from "@/components/ui/DatePickerModal";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { usePantryForm } from "@/features/pantry/usePantryForm";
import type { StorageLocation, Unit } from "@/types";

const UNITS: Unit[] = ["G", "KG", "ML", "L", "PCS", "TBSP", "TSP", "CUP"];
const LOCATIONS: {
  value: StorageLocation;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: "FRIDGE", label: "Tủ mát", icon: "leaf-outline" },
  { value: "FREEZER", label: "Tủ đông", icon: "snow-outline" },
  { value: "PANTRY_SHELF", label: "Kệ bếp", icon: "cube-outline" },
];

export default function NewPantryItemScreen() {
  const router = useRouter();
  const { brand, palette } = useAppTheme();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const params = useLocalSearchParams<{
    ingredientId?: string;
    ingredientName?: string;
    defaultUnit?: string;
  }>();

  const { values, errors, isSaving, setField, submit } = usePantryForm();

  // Nhận ingredientId & ingredientName từ màn hình chọn nguyên liệu hoặc quét barcode (của Việt)
  useEffect(() => {
    if (params.ingredientId) {
      setField("ingredientId", params.ingredientId);
    }
    if (params.ingredientName) {
      setField("ingredientName", params.ingredientName);
    }
    if (params.defaultUnit && UNITS.includes(params.defaultUnit as Unit)) {
      setField("unit", params.defaultUnit as Unit);
    }
  }, [
    params.ingredientId,
    params.ingredientName,
    params.defaultUnit,
    setField,
  ]);

  const handleSubmit = async () => {
    try {
      const saved = await submit();
      if (saved === null) return;
      Alert.alert("Thành công", "Đã thêm nguyên liệu vào tủ đồ!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert(
        "Lỗi",
        err instanceof Error
          ? err.message
          : "Không thể thêm món. Vui lòng kiểm tra lại thông tin.",
      );
    }
  };

  return (
    <View className="flex-1 bg-canvas dark:bg-canvas-dark">
      <Screen>
        {/* Header */}
        <View className="flex-row items-center gap-3 pb-2">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-soft dark:bg-surface-dark"
          >
            <Ionicons name="arrow-back" size={20} color={palette.ink} />
          </Pressable>
          <AppText variant="title">Thêm nguyên liệu</AppText>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          className="gap-4 pb-12"
        >
          {/* Ingredient Selector Card */}
          <Card className="p-4 shadow-sm">
            <AppText variant="label" className="mb-2">
              Nguyên liệu
            </AppText>

            {values.ingredientName ? (
              <View className="flex-row items-center justify-between rounded-2xl bg-brandSoft p-3 dark:bg-surface-dark">
                <View className="flex-row items-center gap-2.5">
                  <Ionicons name="checkmark-circle" size={20} color={brand} />
                  <AppText className="font-bold text-brand">
                    {values.ingredientName}
                  </AppText>
                </View>
                <Pressable
                  onPress={() =>
                    router.push("/pantry/select-ingredient" as Href)
                  }
                  className="rounded-lg bg-brand/10 px-2.5 py-1"
                >
                  <AppText variant="caption" className="font-bold text-brand">
                    Đổi
                  </AppText>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={() => router.push("/pantry/select-ingredient" as Href)}
                className="flex-row items-center justify-between rounded-2xl border border-dashed border-line p-3.5 active:bg-soft"
              >
                <View className="flex-row items-center gap-2">
                  <Ionicons
                    name="search-outline"
                    size={18}
                    color={palette.muted}
                  />
                  <AppText className="text-muted">
                    Chọn từ danh mục nguyên liệu...
                  </AppText>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={palette.muted}
                />
              </Pressable>
            )}

            {errors.ingredientId && (
              <AppText variant="caption" className="mt-1 text-danger">
                {errors.ingredientId}
              </AppText>
            )}
          </Card>

          {/* Quantity & Unit */}
          <Card className="p-4 shadow-sm">
            <TextField
              label="Số lượng"
              placeholder="Ví dụ: 500"
              keyboardType="numeric"
              value={values.quantity}
              onChangeText={(text) => setField("quantity", text)}
              error={errors.quantity}
            />

            <AppText variant="label" className="mb-2 mt-4">
              Đơn vị đo
            </AppText>
            <View className="flex-row flex-wrap gap-2">
              {UNITS.map((u) => {
                const isSelected = values.unit === u;
                return (
                  <Pressable
                    key={u}
                    onPress={() => setField("unit", u)}
                    className={`rounded-xl px-3.5 py-2 ${
                      isSelected ? "bg-brand" : "bg-soft dark:bg-soft-dark"
                    }`}
                  >
                    <AppText
                      className={`font-semibold ${
                        isSelected
                          ? "text-white"
                          : "text-ink dark:text-ink-dark"
                      }`}
                    >
                      {u}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          {/* Location 3D Selector */}
          <Card className="p-4 shadow-sm">
            <AppText variant="label" className="mb-2.5">
              Vị trí bảo quản
            </AppText>
            <View className="flex-row gap-2.5">
              {LOCATIONS.map((loc) => {
                const isSelected = values.location === loc.value;
                return (
                  <Pressable
                    key={loc.value}
                    onPress={() => setField("location", loc.value)}
                    className={`flex-1 items-center gap-1.5 rounded-2xl border-2 p-3 ${
                      isSelected
                        ? "border-brand bg-brandSoft dark:bg-surface-dark"
                        : "border-transparent bg-soft dark:bg-soft-dark"
                    }`}
                  >
                    <Ionicons
                      name={loc.icon}
                      size={22}
                      color={isSelected ? brand : palette.muted}
                    />
                    <AppText
                      className={`text-xs font-bold ${
                        isSelected ? "text-brand" : "text-muted"
                      }`}
                    >
                      {loc.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          {/* Expiry Date */}
          <Card className="p-4 shadow-sm">
            <AppText variant="label" className="mb-2">
              Hạn sử dụng
            </AppText>

            <Pressable
              onPress={() => setCalendarOpen(true)}
              className="flex-row items-center justify-between rounded-2xl border border-line bg-soft p-3.5 dark:border-line-dark dark:bg-soft-dark"
            >
              <View className="flex-row items-center gap-3">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-brandSoft dark:bg-surface-dark">
                  <Ionicons name="calendar-outline" size={18} color={brand} />
                </View>
                <View>
                  <AppText
                    className={
                      values.expiryDate
                        ? "font-bold text-ink dark:text-ink-dark"
                        : "text-muted"
                    }
                  >
                    {values.expiryDate || "Chạm để chọn từ lịch..."}
                  </AppText>
                  <AppText variant="caption">
                    Không cho phép chọn ngày trong quá khứ
                  </AppText>
                </View>
              </View>

              {values.expiryDate ? (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    setField("expiryDate", "");
                  }}
                  className="p-1"
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={palette.muted}
                  />
                </Pressable>
              ) : (
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={palette.muted}
                />
              )}
            </Pressable>

            {errors.expiryDate && (
              <AppText variant="caption" className="mt-1.5 text-danger">
                {errors.expiryDate}
              </AppText>
            )}

            {/* Quick Presets */}
            <View className="mt-3 flex-row flex-wrap gap-2">
              {[
                { label: "+3 ngày", days: 3 },
                { label: "+1 tuần", days: 7 },
                { label: "+2 tuần", days: 14 },
                { label: "+1 tháng", days: 30 },
              ].map((p) => (
                <Pressable
                  key={p.days}
                  onPress={() => {
                    const d = new Date();
                    d.setDate(d.getDate() + p.days);
                    const y = d.getFullYear();
                    const m = String(d.getMonth() + 1).padStart(2, "0");
                    const day = String(d.getDate()).padStart(2, "0");
                    setField("expiryDate", `${y}-${m}-${day}`);
                  }}
                  className="rounded-xl border border-line bg-brandSoft px-3 py-1.5 dark:bg-surface-dark"
                >
                  <AppText className="text-xs font-bold text-brand">
                    {p.label}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </Card>

          {/* Submit */}
          <Button
            title={isSaving ? "Đang lưu..." : "Thêm vào tủ nguyên liệu"}
            onPress={handleSubmit}
            variant="primary"
            disabled={isSaving}
            className="mt-2"
          />
        </ScrollView>

        {/* Date Picker Modal */}
        <DatePickerModal
          visible={calendarOpen}
          onClose={() => setCalendarOpen(false)}
          onSelectDate={(date) => setField("expiryDate", date)}
          currentValue={values.expiryDate}
          minDate={new Date()}
        />
      </Screen>
    </View>
  );
}
