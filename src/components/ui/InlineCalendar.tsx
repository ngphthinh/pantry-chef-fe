import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/core/theme/useAppTheme';

interface InlineCalendarProps {
  selectedDate?: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
  minDate?: Date;
}

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function formatDate(y: number, m: number, d: number) {
  return `${y}-${pad2(m + 1)}-${pad2(d)}`;
}

export function InlineCalendar({
  selectedDate,
  onSelectDate,
  minDate = new Date(),
}: InlineCalendarProps) {
  const { brand, palette, isDark } = useAppTheme();
  const brandSoft = isDark ? palette.surface : palette.soft;

  const normalizedMinDate = useMemo(() => {
    const d = new Date(minDate);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [minDate]);

  const [viewDate, setViewDate] = useState(() => {
    if (selectedDate) {
      const [y, m, d] = selectedDate.split('-').map(Number);
      if (y && m && d) return new Date(y, m - 1, d);
    }
    return new Date();
  });

  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const handlePrevMonth = () => {
    const prevMonthDate = new Date(viewYear, viewMonth - 1, 1);
    const lastDayOfPrevMonth = new Date(viewYear, viewMonth, 0);
    if (lastDayOfPrevMonth.getTime() < normalizedMinDate.getTime()) {
      return;
    }
    setViewDate(prevMonthDate);
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewYear, viewMonth + 1, 1));
  };

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

    for (let i = 0; i < startDayIndex; i++) {
      cells.push({
        key: `empty-${i}`,
        dayNumber: 0,
        dateStr: '',
        isDisabled: true,
        isToday: false,
      });
    }

    const todayStr = formatDate(
      normalizedMinDate.getFullYear(),
      normalizedMinDate.getMonth(),
      normalizedMinDate.getDate(),
    );

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const cellDate = new Date(viewYear, viewMonth, d, 23, 59, 59);
      const dateStr = formatDate(viewYear, viewMonth, d);
      const isDisabled = cellDate.getTime() < normalizedMinDate.getTime();
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

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? palette.surface : palette.soft,
          borderColor: palette.line,
        },
      ]}
    >
      {/* Month Navigator */}
      <View style={styles.monthHeader}>
        <Pressable
          onPress={handlePrevMonth}
          style={[styles.arrowBtn, { backgroundColor: isDark ? palette.canvas : '#FFFFFF' }]}
        >
          <Ionicons name="chevron-back" size={16} color={palette.ink} />
        </Pressable>

        <Text style={[styles.monthTitle, { color: palette.ink }]}>
          Tháng {viewMonth + 1}, {viewYear}
        </Text>

        <Pressable
          onPress={handleNextMonth}
          style={[styles.arrowBtn, { backgroundColor: isDark ? palette.canvas : '#FFFFFF' }]}
        >
          <Ionicons name="chevron-forward" size={16} color={palette.ink} />
        </Pressable>
      </View>

      {/* Weekday headers */}
      <View style={[styles.weekdaysRow, { borderBottomColor: palette.line }]}>
        {WEEKDAYS.map((w) => (
          <Text key={w} style={[styles.weekdayText, { color: palette.muted }]}>
            {w}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.grid}>
        {calendarCells.map((cell) => {
          if (cell.dayNumber === 0) {
            return <View key={cell.key} style={styles.cellPlaceholder} />;
          }

          const isSelected = selectedDate === cell.dateStr;

          return (
            <Pressable
              key={cell.key}
              disabled={cell.isDisabled}
              onPress={() => onSelectDate(cell.dateStr)}
              style={[
                styles.dayCell,
                cell.isDisabled && styles.cellDisabled,
                cell.isToday && !isSelected && {
                  borderColor: brand,
                  borderWidth: 1.5,
                  backgroundColor: brandSoft,
                },
                isSelected && {
                  backgroundColor: brand,
                },
              ]}
            >
              <Text
                style={[
                  styles.dayNumber,
                  { color: palette.ink },
                  cell.isDisabled && { color: palette.muted, opacity: 0.35 },
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    marginTop: 8,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  arrowBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  weekdayText: {
    width: 34,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  cellPlaceholder: {
    width: 34,
    height: 34,
    marginVertical: 1,
  },
  dayCell: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 1,
  },
  cellDisabled: {
    opacity: 0.3,
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '600',
  },
});
