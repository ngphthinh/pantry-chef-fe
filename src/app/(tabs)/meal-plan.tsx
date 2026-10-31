import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DatePickerModal } from "@/components/ui/DatePickerModal";
import { InlineCalendar } from "@/components/ui/InlineCalendar";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { useAppTheme } from "@/core/theme/useAppTheme";
import {
  formatLocalDate,
  getMondayOfWeek,
} from "@/features/mealplan/mealPlanSlice";
import { useMealPlan } from "@/features/mealplan/useMealPlan";
import type { MealPlanEntryResponse, MealType } from "@/types";
import { toDisplayDate, toIsoDate } from "@/core/format/datetime";

const MEAL_ICONS: Record<
  MealType,
  { icon: keyof typeof Ionicons.glyphMap; label: string; color: string }
> = {
  BREAKFAST: { icon: "sunny-outline", label: "Bữa sáng", color: "#F59E0B" },
  LUNCH: { icon: "partly-sunny-outline", label: "Bữa trưa", color: "#10B981" },
  DINNER: { icon: "moon-outline", label: "Bữa tối", color: "#6366F1" },
};

export default function MealPlanHubScreen() {
  const router = useRouter();
  const { brand, palette } = useAppTheme();
  const {
    currentPlan,
    selectedWeekStart,
    daysOfWeek,
    isLoading,
    isSaving,
    loadWeek,
    goToPrevWeek,
    goToNextWeek,
    goToCurrentWeek,
    goToSpecificWeek,
    toggleCooked,
    removeEntry,
    copyToWeek,
  } = useMealPlan();

  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [copyModalVisible, setCopyModalVisible] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [mainWeekPickerOpen, setMainWeekPickerOpen] = useState(false);
  // State/logic luôn là ISO (yyyy-MM-dd); chỉ toDisplayDate ở tầng render
  const [targetWeekStart, setTargetWeekStart] = useState("");
  const [selectedDayFromCalendar, setSelectedDayFromCalendar] =
    useState<string>("");
  // Text đang gõ ở ô nhập tay (dd-MM-yyyy); null = hiển thị theo targetWeekStart
  const [manualText, setManualText] = useState<string | null>(null);

  // Thứ Hai của tuần hiện tại trong thực tế
  const currentMonday = useMemo(() => getMondayOfWeek(new Date()), []);

  // Danh sách các tuần kế tiếp để chọn nhanh (+1 tuần, +2 tuần, +3 tuần, +4 tuần)
  const quickNextWeeks = useMemo(() => {
    // Luôn chọn mốc từ tuần hiện tại hoặc tuần đang xem nếu ở tương lai
    const baseMondayStr =
      selectedWeekStart < currentMonday ? currentMonday : selectedWeekStart;
    const [y, m, d] = baseMondayStr.split("-").map(Number);

    return [1, 2, 3, 4].map((offset) => {
      const start = new Date(y, m - 1, d + offset * 7, 12, 0, 0);
      const end = new Date(y, m - 1, d + offset * 7 + 6, 12, 0, 0);
      const startStr = formatLocalDate(start);
      const label = offset === 1 ? "Tuần sau" : `Sau ${offset} tuần`;
      const dateRange = `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`;
      return {
        offset,
        label,
        dateRange,
        weekStart: startStr,
      };
    });
  }, [selectedWeekStart, currentMonday]);

  useEffect(() => {
    loadWeek(selectedWeekStart).catch(() => {});
  }, [loadWeek, selectedWeekStart]);

  // Tìm ngày hôm nay để chọn mặc định
  useEffect(() => {
    const todayIndex = daysOfWeek.findIndex((d) => d.isToday);
    if (todayIndex !== -1) {
      setActiveDayIndex(todayIndex);
    }
  }, [daysOfWeek]);

  const activeDay = daysOfWeek[activeDayIndex] || daysOfWeek[0];

  const isTargetPast = Boolean(
    targetWeekStart && targetWeekStart < currentMonday,
  );
  const isTargetSame = Boolean(
    targetWeekStart && targetWeekStart === selectedWeekStart,
  );
  const isTargetInvalid = isTargetPast || isTargetSame || !targetWeekStart;

  const handleOpenCopyModal = () => {
    if (quickNextWeeks.length > 0) {
      setTargetWeekStart(quickNextWeeks[0].weekStart);
      setSelectedDayFromCalendar(quickNextWeeks[0].weekStart);
    }
    setManualText(null);
    setCopyModalVisible(true);
  };

  const handleOpenCalendarFromCopyModal = () => {
    setCopyModalVisible(false);
    setTimeout(() => {
      setCalendarOpen(true);
    }, 200);
  };

  const handleSelectDateFromCalendar = (dateStr: string) => {
    setSelectedDayFromCalendar(dateStr);
    const [y, m, d] = dateStr.split("-").map(Number);
    setTargetWeekStart(getMondayOfWeek(new Date(y, m - 1, d, 12, 0, 0)));
    setManualText(null);
    setCalendarOpen(false);
    setTimeout(() => {
      setCopyModalVisible(true);
    }, 200);
  };

  const handleCloseCalendar = () => {
    setCalendarOpen(false);
    setTimeout(() => {
      setCopyModalVisible(true);
    }, 200);
  };

  // Nhập tay dd-MM-yyyy -> targetWeekStart luôn là ISO (Thứ Hai) hoặc rỗng nếu chưa hợp lệ
  const handleManualDateChange = (text: string) => {
    setManualText(text);
    const t = text.trim();
    if (/^\d{2}-\d{2}-\d{4}$/.test(t)) {
      const iso = toIsoDate(t);
      const [y, m, d] = iso.split("-").map(Number);
      setSelectedDayFromCalendar(iso);
      setTargetWeekStart(getMondayOfWeek(new Date(y, m - 1, d, 12, 0, 0)));
    } else {
      setTargetWeekStart("");
    }
  };

  const handleCopyWeek = async () => {
    if (!targetWeekStart.trim()) {
      Alert.alert("Lỗi", "Vui lòng chọn tuần đích");
      return;
    }
    if (targetWeekStart < currentMonday) {
      Alert.alert(
        "Không thể sao chép",
        "Không cho phép sao chép sang tuần trong quá khứ. Vui lòng chỉ chọn các tuần kế tiếp.",
      );
      return;
    }
    if (targetWeekStart === selectedWeekStart) {
      Alert.alert(
        "Không thể sao chép",
        "Tuần đích phải khác với tuần hiện tại đang sao chép.",
      );
      return;
    }
    try {
      await copyToWeek(targetWeekStart);
      setCopyModalVisible(false);
      Alert.alert(
        "Thành công",
        `Đã sao chép thực đơn sang tuần ${toDisplayDate(targetWeekStart)}`,
      );
    } catch {
      Alert.alert("Lỗi", "Không thể sao chép thực đơn");
    }
  };

  const handleSelectMainWeek = (dateStr: string) => {
    goToSpecificWeek(dateStr);
    setMainWeekPickerOpen(false);
  };

  const handleToggleCooked = async (entry: MealPlanEntryResponse) => {
    try {
      await toggleCooked(entry.id, entry.cooked);
    } catch {
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái đã nấu");
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
              Alert.alert("Lỗi", "Không thể xoá");
            }
          },
        },
      ],
    );
  };

  return (
    <View className="flex-1 bg-canvas dark:bg-canvas-dark">
      <Screen>
        {/* Header Title & Week Navigation */}
        <View className="mb-2">
          <View className="flex-row items-center justify-between">
            <View>
              <AppText variant="title">Kế hoạch bữa ăn</AppText>
              <AppText variant="caption">
                Tuần từ: {toDisplayDate(selectedWeekStart)}
              </AppText>
            </View>

            {/* Copy Week Button */}
            <Pressable
              onPress={handleOpenCopyModal}
              className="flex-row items-center gap-1.5 rounded-full border border-line bg-brandSoft px-3 py-1.5 shadow-xs active:scale-95 dark:bg-surface-dark">
              <Ionicons name="copy-outline" size={15} color={brand} />
              <AppText className="text-xs font-bold text-brand">
                Sao chép tuần
              </AppText>
            </Pressable>
          </View>
        </View>

        {/* 3D Action Shortcuts Strip */}
        <View className="flex-row gap-2 py-1">
          <Pressable
            onPress={() => router.push("/meal-plan/add-entry" as Href)}
            className="flex-1 flex-row items-center justify-center gap-1 rounded-2xl bg-brandSoft p-2.5 shadow-xs active:scale-95 dark:bg-surface-dark">
            <Ionicons name="add-circle" size={16} color={brand} />
            <AppText className="text-xs font-bold text-brand">Thêm bữa</AppText>
          </Pressable>

          <Pressable
            onPress={() => {
              if (currentPlan?.id) {
                router.push(`/meal-plan/${currentPlan.id}` as Href);
              } else {
                Alert.alert(
                  "Chưa có thực đơn",
                  "Tuần này chưa có kế hoạch bữa ăn nào. Hãy nhấn 'Thêm bữa' để tạo trước nhé!",
                );
              }
            }}
            className="flex-1 flex-row items-center justify-center gap-1 rounded-2xl bg-brandSoft p-2.5 shadow-xs active:scale-95 dark:bg-surface-dark">
            <Ionicons name="document-text-outline" size={16} color={brand} />
            <AppText className="text-xs font-bold text-brand">Chi tiết</AppText>
          </Pressable>

          <Pressable
            onPress={() => router.push("/meal-plan/shopping-preview" as Href)}
            className="flex-1 flex-row items-center justify-center gap-1 rounded-2xl bg-brandSoft p-2.5 shadow-xs active:scale-95 dark:bg-surface-dark">
            <Ionicons name="cart-outline" size={16} color={brand} />
            <AppText className="text-xs font-bold text-brand">Mua sắm</AppText>
          </Pressable>

          <Pressable
            onPress={() => router.push("/ai/meal-plan" as Href)}
            className="flex-1 flex-row items-center justify-center gap-1 rounded-2xl bg-brandSoft p-2.5 shadow-xs active:scale-95 dark:bg-surface-dark">
            <Ionicons name="sparkles" size={16} color={brand} />
            <AppText className="text-xs font-bold text-brand">AI gợi ý</AppText>
          </Pressable>
        </View>

        {/* Week Navigator Card with Calendar Modal Picker */}
        <Card className="flex-row items-center justify-between p-2.5 shadow-sm">
          <Pressable
            onPress={goToPrevWeek}
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-xl bg-soft active:scale-90 dark:bg-soft-dark">
            <Ionicons name="chevron-back" size={18} color={palette.ink} />
          </Pressable>

          {/* Chạm vào giữa để mở Modal Lịch chọn tuần */}
          <Pressable
            onPress={() => setMainWeekPickerOpen(true)}
            className="flex-1 items-center px-2 py-1 active:opacity-75">
            <View className="flex-row items-center gap-1.5">
              <Ionicons name="calendar" size={16} color={brand} />
              <AppText className="text-sm font-bold text-ink dark:text-ink-dark">
                Tuần: {toDisplayDate(selectedWeekStart)}
              </AppText>
            </View>
            <AppText variant="caption" className="font-semibold text-brand">
              Chạm để chọn tuần từ lịch
            </AppText>
          </Pressable>

          {/* Quick jump to current week if different */}
          {selectedWeekStart !== currentMonday && (
            <Pressable
              onPress={goToCurrentWeek}
              className="mr-1 rounded-lg bg-brandSoft px-2 py-1 active:scale-95 dark:bg-surface-dark">
              <AppText className="text-[11px] font-bold text-brand">
                Hôm nay
              </AppText>
            </Pressable>
          )}

          <Pressable
            onPress={goToNextWeek}
            hitSlop={8}
            className="h-9 w-9 items-center justify-center rounded-xl bg-soft active:scale-90 dark:bg-soft-dark">
            <Ionicons name="chevron-forward" size={18} color={palette.ink} />
          </Pressable>
        </Card>

        {/* 7-Day Interactive 3D Strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-4 px-4 py-1"
          contentContainerStyle={{ gap: 8 }}>
          {daysOfWeek.map((day, idx) => {
            const isSelected = activeDayIndex === idx;
            return (
              <Pressable
                key={day.date}
                onPress={() => setActiveDayIndex(idx)}
                className={`w-16 items-center rounded-2xl py-3 shadow-xs active:scale-95 ${
                  isSelected
                    ? "border-2 border-brand bg-brandSoft dark:bg-surface-dark"
                    : "bg-soft dark:bg-soft-dark"
                }`}>
                <AppText
                  className={`text-xs ${isSelected ? "font-bold text-brand" : "text-muted"}`}>
                  {day.dayName}
                </AppText>
                <AppText
                  className={`mt-1 text-base font-extrabold ${
                    isSelected ? "text-brand" : "text-ink dark:text-ink-dark"
                  }`}>
                  {day.formattedDate}
                </AppText>
                {day.isToday && (
                  <View className="mt-1 h-1.5 w-1.5 rounded-full bg-brand" />
                )}
                {day.entries.length > 0 && !day.isToday && (
                  <View className="mt-1 h-1 w-1 rounded-full bg-muted" />
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Meals For Selected Day */}
        <View className="gap-3 pb-16">
          <View className="flex-row items-center justify-between px-1">
            <AppText variant="label" className="text-base font-bold">
              {activeDay?.dayName} (
              {activeDay ? toDisplayDate(activeDay.date) : ""})
            </AppText>
            <AppText variant="caption">
              {activeDay?.entries.length || 0} bữa đã lên lịch
            </AppText>
          </View>

          {(["BREAKFAST", "LUNCH", "DINNER"] as MealType[]).map((type) => {
            const entry = activeDay?.entries.find((e) => e.mealType === type);
            const meta = MEAL_ICONS[type];

            return (
              <Card key={type} className="p-4 shadow-sm">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View
                      className="h-10 w-10 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: `${meta.color}20` }}>
                      <Ionicons name={meta.icon} size={20} color={meta.color} />
                    </View>
                    <View>
                      <AppText
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{ color: meta.color }}>
                        {meta.label}
                      </AppText>
                      <AppText variant="heading" className="text-base">
                        {entry?.recipeTitle || "Chưa lên thực đơn"}
                      </AppText>
                    </View>
                  </View>

                  {entry ? (
                    <View className="flex-row items-center gap-2">
                      {/* Toggle Cooked Button */}
                      <Pressable
                        onPress={() => handleToggleCooked(entry)}
                        className={`flex-row items-center gap-1 rounded-full px-2.5 py-1 ${
                          entry.cooked
                            ? "bg-successBg dark:bg-successBg-dark"
                            : "bg-soft dark:bg-soft-dark"
                        }`}>
                        <Ionicons
                          name={
                            entry.cooked
                              ? "checkmark-circle"
                              : "ellipse-outline"
                          }
                          size={16}
                          color={
                            entry.cooked ? palette.successInk : palette.muted
                          }
                        />
                        <AppText
                          variant="caption"
                          className={
                            entry.cooked
                              ? "font-bold text-success"
                              : "text-muted"
                          }>
                          {entry.cooked ? "Đã nấu" : "Chưa nấu"}
                        </AppText>
                      </Pressable>

                      {/* Delete Entry */}
                      <Pressable
                        onPress={() => handleDeleteEntry(entry)}
                        className="h-7 w-7 items-center justify-center rounded-full bg-soft active:scale-90">
                        <Ionicons
                          name="trash-outline"
                          size={14}
                          color={palette.muted}
                        />
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable
                      onPress={() =>
                        router.push(
                          `/meal-plan/add-entry?defaultDate=${activeDay.date}&defaultMealType=${type}` as Href,
                        )
                      }
                      className="rounded-xl border border-brand/30 bg-brandSoft/50 px-3 py-1.5 active:bg-brandSoft">
                      <AppText
                        variant="caption"
                        className="font-bold text-brand">
                        + Thêm món
                      </AppText>
                    </Pressable>
                  )}
                </View>

                {entry && entry.servings && (
                  <View className="mt-2.5 flex-row items-center gap-2 border-t border-line pt-2 dark:border-line-dark">
                    <Ionicons
                      name="people-outline"
                      size={14}
                      color={palette.muted}
                    />
                    <AppText variant="caption">
                      {entry.servings} khẩu phần ăn
                    </AppText>
                  </View>
                )}
              </Card>
            );
          })}
        </View>
      </Screen>

      {/* Modal Copy Week */}
      <Modal visible={copyModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <Card className="m-3 gap-3.5 p-5 shadow-2xl">
            {/* Header */}
            <View className="flex-row items-center justify-between border-b border-line pb-3 dark:border-line-dark">
              <View className="flex-row items-center gap-2.5">
                <View className="h-9 w-9 items-center justify-center rounded-xl bg-brandSoft dark:bg-surface-dark">
                  <Ionicons name="copy" size={18} color={brand} />
                </View>
                <View>
                  <AppText variant="heading">Sao chép thực đơn tuần</AppText>
                  <AppText variant="caption">
                    Tuần nguồn: Thứ 2 ({toDisplayDate(selectedWeekStart)})
                  </AppText>
                </View>
              </View>
              <Pressable
                onPress={() => setCopyModalVisible(false)}
                className="p-1">
                <Ionicons name="close" size={22} color={palette.muted} />
              </Pressable>
            </View>

            {/* Quick Presets */}
            <View>
              <AppText variant="label" className="mb-2">
                1. Chọn nhanh tuần kế tiếp
              </AppText>
              <View className="flex-row flex-wrap gap-2">
                {quickNextWeeks.map((item) => {
                  const isSelected = targetWeekStart === item.weekStart;
                  return (
                    <Pressable
                      key={item.weekStart}
                      onPress={() => {
                        setTargetWeekStart(item.weekStart);
                        setSelectedDayFromCalendar(item.weekStart);
                        setManualText(null);
                      }}
                      className={`rounded-2xl border px-3.5 py-2 ${
                        isSelected
                          ? "border-brand bg-brandSoft dark:bg-surface-dark"
                          : "border-line bg-soft dark:border-line-dark dark:bg-soft-dark"
                      }`}>
                      <AppText
                        className={`text-xs font-bold ${
                          isSelected
                            ? "text-brand"
                            : "text-ink dark:text-ink-dark"
                        }`}>
                        {item.label}
                      </AppText>
                      <AppText variant="caption">{item.dateRange}</AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Chuyển thành Modal Lịch chuyên biệt */}
            <View>
              <AppText variant="label" className="mb-2">
                2. Chọn ngày từ lịch
              </AppText>
              <Pressable
                onPress={handleOpenCalendarFromCopyModal}
                className="flex-row items-center justify-between rounded-2xl border border-line bg-soft p-3.5 active:bg-line dark:border-line-dark dark:bg-soft-dark">
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-brandSoft dark:bg-surface-dark">
                    <Ionicons name="calendar" size={20} color={brand} />
                  </View>
                  <View>
                    <AppText className="font-bold text-ink dark:text-ink-dark">
                      {targetWeekStart
                        ? `Thứ Hai, ${toDisplayDate(targetWeekStart)}`
                        : "Chạm để mở lịch chọn ngày..."}
                    </AppText>
                    <AppText
                      variant="caption"
                      style={{ flexWrap: "wrap", flexShrink: 1 }}>
                      {selectedDayFromCalendar
                        ? `Đã chọn: ${toDisplayDate(selectedDayFromCalendar)} • `
                        : ""}
                      Chạm để mở lịch
                    </AppText>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={palette.muted}
                />
              </Pressable>
            </View>

            {/* Nhập tay nếu muốn */}
            <View>
              <TextField
                label="3. Hoặc tự nhập ngày dd-MM-yyyy"
                value={
                  manualText ??
                  (targetWeekStart ? toDisplayDate(targetWeekStart) : "")
                }
                onChangeText={handleManualDateChange}
                placeholder="Ví dụ: 28-10-2026"
              />
            </View>

            {/* Validation Status Feedback */}
            {isTargetPast && (
              <View className="flex-row items-center gap-2 rounded-2xl bg-dangerBg p-3 dark:bg-dangerBg-dark">
                <Ionicons
                  name="alert-circle"
                  size={18}
                  color={palette.dangerInk}
                />
                <AppText
                  variant="caption"
                  className="flex-1 font-bold text-dangerInk">
                  Không thể sao chép sang tuần trong quá khứ. Vui lòng chọn tuần
                  kế tiếp!
                </AppText>
              </View>
            )}

            {isTargetSame && (
              <View className="flex-row items-center gap-2 rounded-2xl bg-warnBg p-3 dark:bg-warnBg-dark">
                <Ionicons name="warning" size={18} color={palette.warnInk} />
                <AppText
                  variant="caption"
                  className="flex-1 font-bold text-warnInk">
                  Tuần đích trùng với tuần nguồn đang chọn.
                </AppText>
              </View>
            )}

            {!isTargetInvalid && (
              <View className="flex-row items-center gap-2 rounded-2xl bg-successBg p-2.5 dark:bg-successBg-dark">
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={palette.successInk}
                />
                <View className="flex-1">
                  <AppText
                    variant="caption"
                    className="font-bold text-successInk">
                    Sẵn sàng sao chép sang tuần: Thứ Hai,{" "}
                    {toDisplayDate(targetWeekStart)}
                  </AppText>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row gap-3 border-t border-line pt-3 dark:border-line-dark">
              <Button
                title="Huỷ"
                variant="outline"
                className="flex-1"
                onPress={() => setCopyModalVisible(false)}
              />
              <Button
                title={isSaving ? "Đang chép..." : "Xác nhận chép"}
                variant="primary"
                className="flex-1"
                onPress={handleCopyWeek}
                disabled={isTargetInvalid || isSaving}
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Date Picker Modal - Modal popup lịch chuyên biệt cho Sao chép tuần */}
      <DatePickerModal
        visible={calendarOpen}
        onClose={handleCloseCalendar}
        onSelectDate={handleSelectDateFromCalendar}
        currentValue={selectedDayFromCalendar || targetWeekStart}
        minDate={new Date()}
        title="Chọn ngày trong tuần đích"
      />

      {/* Date Picker Modal - Chọn tuần xem trên màn hình Kế hoạch bữa ăn */}
      <DatePickerModal
        visible={mainWeekPickerOpen}
        onClose={() => setMainWeekPickerOpen(false)}
        onSelectDate={handleSelectMainWeek}
        currentValue={selectedWeekStart}
        minDate={null}
        title="Chọn tuần trong thực đơn"
      />
    </View>
  );
}
   