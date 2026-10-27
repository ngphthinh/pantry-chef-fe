import { useState } from "react";
import { Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar, LocaleConfig } from "react-native-calendars";

import { useAppTheme } from "@/core/theme/useAppTheme";
import { AppText } from "./AppText";
import { Card } from "./Card";

LocaleConfig.locales.vi = {
  monthNames: [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ],
  monthNamesShort: [
    "Th1",
    "Th2",
    "Th3",
    "Th4",
    "Th5",
    "Th6",
    "Th7",
    "Th8",
    "Th9",
    "Th10",
    "Th11",
    "Th12",
  ],
  dayNames: [
    "Chủ nhật",
    "Thứ hai",
    "Thứ ba",
    "Thứ tư",
    "Thứ năm",
    "Thứ sáu",
    "Thứ bảy",
  ],
  dayNamesShort: ["CN", "T2", "T3", "T4", "T5", "T6", "T7"],
  today: "Hôm nay",
};
LocaleConfig.defaultLocale = "vi";

const WEEKDAYS = [
  "Chủ nhật",
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
];
const pad = (n: number) => String(n).padStart(2, "0");

/** "2026-10-27" → "Thứ ba, 27/10/2026" */
function formatLong(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const weekday = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return `${WEEKDAYS[weekday]}, ${pad(d)}/${pad(m)}/${y}`;
}

interface DatePickerFieldProps {
  /** YYYY-MM-DD */
  value: string;
  /** YYYY-MM-DD, không cho chọn ngày trước mốc này */
  minDate?: string;
  onChange: (dateKey: string) => void;
}

/** Ô hiển thị ngày; bấm vào thì mở lịch để chọn. */
export function DatePickerField({
  value,
  minDate,
  onChange,
}: DatePickerFieldProps) {
  const { palette, brand, isDark } = useAppTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Chọn ngày bắt đầu"
        className="h-12 flex-row items-center gap-3 rounded-full border border-line bg-surface px-4 active:opacity-80 dark:border-line-dark dark:bg-surface-dark">
        <Ionicons name="calendar-outline" size={20} color={brand} />
        <AppText className="flex-1 font-semibold">{formatLong(value)}</AppText>
        <Ionicons name="chevron-down" size={18} color={palette.muted} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 items-center justify-center bg-black/50 px-5"
          onPress={() => setOpen(false)}>
          {/* Pressable rỗng để bấm vào lịch không đóng modal */}
          <Pressable className="w-full max-w-[420px]" onPress={() => {}}>
            <Card className="overflow-hidden p-2">
              <Calendar
                key={isDark ? "dark" : "light"} // theme của lịch không tự cập nhật nên remount khi đổi sáng/tối
                current={value}
                minDate={minDate}
                firstDay={1}
                enableSwipeMonths
                markedDates={{
                  [value]: { selected: true, selectedColor: brand },
                }}
                onDayPress={(day) => {
                  onChange(day.dateString);
                  setOpen(false);
                }}
                theme={{
                  calendarBackground: palette.surface,
                  textSectionTitleColor: palette.muted,
                  dayTextColor: palette.ink,
                  textDisabledColor: palette.line,
                  monthTextColor: palette.ink,
                  arrowColor: brand,
                  todayTextColor: brand,
                  selectedDayBackgroundColor: brand,
                  selectedDayTextColor: "#fff",
                  textMonthFontWeight: "700",
                  textDayHeaderFontWeight: "600",
                }}
              />
            </Card>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
