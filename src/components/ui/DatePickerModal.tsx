import React, { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/core/theme/useAppTheme';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (dateStr: string) => void;
  currentValue?: string;
  minDate?: Date | null;
  title?: string;
}

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function formatDate(y: number, m: number, d: number) {
  return `${y}-${pad2(m + 1)}-${pad2(d)}`;
}

export function DatePickerModal({
  visible,
  onClose,
  onSelectDate,
  currentValue,
  minDate = new Date(),
  title = 'Chọn hạn sử dụng',
}: DatePickerModalProps) {
  const { brand, palette, isDark } = useAppTheme();
  const brandSoft = isDark ? palette.surface : palette.soft;

  // Mốc tối thiểu (ngày hôm nay lúc 00:00:00, nếu minDate là null thì không giới hạn)
  const normalizedMinDate = useMemo(() => {
    if (minDate === null) return null;
    const d = new Date(minDate);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [minDate]);

  // Tháng và năm đang xem
  const [viewDate, setViewDate] = useState(() => {
    if (currentValue) {
      const [y, m, d] = currentValue.split('-').map(Number);
      if (y && m && d) return new Date(y, m - 1, d);
    }
    return new Date();
  });

  const [selectedDateStr, setSelectedDateStr] = useState<string>(currentValue || '');

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const handlePrevMonth = () => {
    const prevMonthDate = new Date(viewYear, viewMonth - 1, 1);
    const lastDayOfPrevMonth = new Date(viewYear, viewMonth, 0);
    if (normalizedMinDate && lastDayOfPrevMonth.getTime() < normalizedMinDate.getTime()) {
      return;
    }
    setViewDate(prevMonthDate);
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

  // Tính các ô trong lưới lịch
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
    const totalDaysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: {
      key: string;
      dayNumber: number;
      dateStr: string;
      isDisabled: boolean;
      isToday: boolean;
    }[] = [];

    // Ô trống đầu tháng
    for (let i = 0; i < startDayIndex; i++) {
      cells.push({
        key: `empty-${i}`,
        dayNumber: 0,
        dateStr: '',
        isDisabled: true,
        isToday: false,
      });
    }

    const today = new Date();
    const todayStr = formatDate(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    // Ngày trong tháng
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const cellDate = new Date(viewYear, viewMonth, d, 23, 59, 59);
      const dateStr = formatDate(viewYear, viewMonth, d);
      const isDisabled = normalizedMinDate ? cellDate.getTime() < normalizedMinDate.getTime() : false;
      const isToday = dateStr === todayStr;

      cells.push({
        key: `day-${d}`,
        dayNumber: d,
        dateStr,
        isDisabled,
        isToday,
      });
    }

    return cells;
  }, [viewYear, viewMonth, normalizedMinDate]);

  const handleQuickAddDays = (days: number) => {
    const target = normalizedMinDate ? new Date(normalizedMinDate) : new Date();
    target.setDate(target.getDate() + days);
    const dateStr = formatDate(
      target.getFullYear(),
      target.getMonth(),
      target.getDate(),
    );
    setSelectedDateStr(dateStr);
    setViewDate(target);
  };

  const handleConfirm = () => {
    if (selectedDateStr) {
      onSelectDate(selectedDateStr);
    }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? palette.surface : '#FFFFFF',
              borderColor: palette.line,
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: palette.line }]}>
            <View style={styles.headerTitleWrap}>
              <View style={[styles.iconBadge, { backgroundColor: brandSoft }]}>
                <Ionicons name="calendar" size={18} color={brand} />
              </View>
              <Text style={[styles.headerTitle, { color: palette.ink }]}>{title}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={palette.muted} />
            </Pressable>
          </View>

          {/* Quick Presets */}
          <View style={styles.presetsRow}>
            {[
              { label: '+3 ngày', days: 3 },
              { label: '+1 tuần', days: 7 },
              { label: '+2 tuần', days: 14 },
              { label: '+1 tháng', days: 30 },
            ].map((preset) => (
              <Pressable
                key={preset.days}
                onPress={() => handleQuickAddDays(preset.days)}
                style={[
                  styles.presetChip,
                  {
                    backgroundColor: brandSoft,
                    borderColor: palette.line,
                  },
                ]}
              >
                <Text style={[styles.presetText, { color: brand }]}>{preset.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Month / Year Navigator */}
          <View style={styles.monthNav}>
            <Pressable
              onPress={handlePrevMonth}
              style={[styles.navArrow, { backgroundColor: palette.soft }]}
            >
              <Ionicons name="chevron-back" size={16} color={palette.ink} />
            </Pressable>

            <Text style={[styles.monthYearText, { color: palette.ink }]}>
              Tháng {viewMonth + 1}, {viewYear}
            </Text>

            <Pressable
              onPress={handleNextMonth}
              style={[styles.navArrow, { backgroundColor: palette.soft }]}
            >
              <Ionicons name="chevron-forward" size={16} color={palette.ink} />
            </Pressable>
          </View>

          {/* Weekday Labels */}
          <View style={[styles.weekdaysRow, { borderBottomColor: palette.line }]}>
            {WEEKDAYS.map((w) => (
              <Text key={w} style={[styles.weekdayLabel, { color: palette.muted }]}>
                {w}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.daysGrid}>
            {calendarCells.map((cell) => {
              if (cell.dayNumber === 0) {
                return <View key={cell.key} style={styles.dayCellPlaceholder} />;
              }

              const isSelected = selectedDateStr === cell.dateStr;

              return (
                <Pressable
                  key={cell.key}
                  disabled={cell.isDisabled}
                  onPress={() => setSelectedDateStr(cell.dateStr)}
                  style={[
                    styles.dayCell,
                    cell.isDisabled && styles.dayCellDisabled,
                    cell.isToday && !isSelected && {
                      borderColor: brand,
                      borderWidth: 1.5,
                      backgroundColor: brandSoft,
                    },
                    isSelected && {
                      backgroundColor: brand,
                      shadowColor: brand,
                      shadowOffset: { width: 0, height: 3 },
                      shadowOpacity: 0.35,
                      shadowRadius: 5,
                      elevation: 4,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      { color: palette.ink },
                      cell.isDisabled && { color: palette.muted, opacity: 0.4 },
                      cell.isToday && !isSelected && { color: brand, fontWeight: '700' },
                      isSelected && { color: '#FFFFFF', fontWeight: '800' },
                    ]}
                  >
                    {cell.dayNumber}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Footer: Selected Value & Buttons */}
          <View style={[styles.footer, { borderTopColor: palette.line }]}>
            <View>
              <Text style={[styles.footerLabel, { color: palette.muted }]}>Đã chọn:</Text>
              <Text style={[styles.footerSelectedDate, { color: brand }]}>
                {selectedDateStr || 'Chưa chọn'}
              </Text>
            </View>

            <View style={styles.footerButtons}>
              <Pressable
                onPress={onClose}
                style={[styles.btnOutline, { borderColor: palette.line }]}
              >
                <Text style={[styles.btnOutlineText, { color: palette.ink }]}>Huỷ</Text>
              </Pressable>

              <Pressable
                onPress={handleConfirm}
                disabled={!selectedDateStr}
                style={[
                  styles.btnPrimary,
                  { backgroundColor: brand },
                  !selectedDateStr && { opacity: 0.5 },
                ]}
              >
                <Text style={styles.btnPrimaryText}>Xác nhận</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  presetChip: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '700',
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingHorizontal: 4,
  },
  navArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthYearText: {
    fontSize: 15,
    fontWeight: '700',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  weekdayLabel: {
    width: 38,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dayCellPlaceholder: {
    width: 38,
    height: 38,
    marginVertical: 2,
  },
  dayCell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  dayCellDisabled: {
    opacity: 0.35,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  footerSelectedDate: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  btnOutline: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  btnOutlineText: {
    fontSize: 13,
    fontWeight: '600',
  },
  btnPrimary: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
