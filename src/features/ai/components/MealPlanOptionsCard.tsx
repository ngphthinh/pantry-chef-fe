import type { ReactNode } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { cn } from "@/components/ui/cn";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { useAppTheme } from "@/core/theme/useAppTheme";
import type { CuisineResponse } from "@/types";
import { formatRange, todayKey } from "../mealPlanFormat";

export interface MealPlanOptions {
  /** YYYY-MM-DD */
  startDate: string;
  days: number;
  maxMinutes?: number;
  cuisineId?: string;
}

const MIN_DAYS = 1;
const MAX_DAYS = 7;
const TIME_OPTIONS: { label: string; value?: number }[] = [
  { label: "Không giới hạn" },
  { label: "30 phút", value: 30 },
  { label: "45 phút", value: 45 },
  { label: "1 giờ", value: 60 },
  { label: "1,5 giờ", value: 90 },
];

function Section({
  icon,
  title,
  right,
  first,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  right?: ReactNode;
  first?: boolean;
  children?: ReactNode;
}) {
  const { brand } = useAppTheme();
  return (
    <View
      className={cn(
        "gap-3 py-4",
        !first && "border-t border-line dark:border-line-dark",
      )}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-7 w-7 items-center justify-center rounded-full bg-brandSoft dark:bg-successBg-dark">
            <Ionicons name={icon} size={15} color={brand} />
          </View>
          <AppText className="font-bold">{title}</AppText>
        </View>
        {right}
      </View>
      {children}
    </View>
  );
}

/** Một hàng cuộn ngang, tràn sát mép card. */
function HScroll({ children }: { children: ReactNode }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="-mx-4"
      contentContainerClassName="gap-2 px-4">
      {children}
    </ScrollView>
  );
}

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  const { palette } = useAppTheme();
  const button = (name: "remove" | "add", disabled: boolean, next: number) => (
    <Pressable
      onPress={() => onChange(next)}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={name === "add" ? "Tăng số ngày" : "Giảm số ngày"}
      className={cn(
        "h-8 w-8 items-center justify-center rounded-full bg-surface dark:bg-surface-dark",
        disabled && "opacity-40",
      )}>
      <Ionicons name={name} size={18} color={palette.ink} />
    </Pressable>
  );

  return (
    <View className="flex-row items-center gap-2 rounded-full bg-soft p-1 dark:bg-soft-dark">
      {button("remove", value <= min, value - 1)}
      <AppText className="min-w-[64px] text-center font-bold">
        {value} ngày
      </AppText>
      {button("add", value >= max, value + 1)}
    </View>
  );
}

interface Props {
  cuisines: CuisineResponse[];
  value: MealPlanOptions;
  onChange: (patch: Partial<MealPlanOptions>) => void;
}

export function MealPlanOptionsCard({ cuisines, value, onChange }: Props) {
  return (
    <Card className="px-4">
      <Section first icon="calendar-outline" title="Ngày bắt đầu">
        <DatePickerField
          value={value.startDate}
          minDate={todayKey()}
          onChange={(startDate) => onChange({ startDate })}
        />
        <AppText variant="caption">
          {formatRange(value.startDate, value.days)}
        </AppText>
      </Section>

      <Section
        icon="albums-outline"
        title="Số ngày"
        right={
          <Stepper
            value={value.days}
            min={MIN_DAYS}
            max={MAX_DAYS}
            onChange={(days) => onChange({ days })}
          />
        }
      />

      <Section icon="timer-outline" title="Thời gian nấu tối đa">
        <HScroll>
          {TIME_OPTIONS.map((t) => (
            <Chip
              key={t.label}
              label={t.label}
              selected={value.maxMinutes === t.value}
              onPress={() => onChange({ maxMinutes: t.value })}
            />
          ))}
        </HScroll>
      </Section>

      {cuisines.length > 0 && (
        <Section icon="earth-outline" title="Ẩm thực">
          <HScroll>
            <Chip
              label="Tất cả"
              selected={!value.cuisineId}
              onPress={() => onChange({ cuisineId: undefined })}
            />
            {cuisines.map((c) => (
              <Chip
                key={c.id}
                label={c.name}
                selected={value.cuisineId === c.id}
                onPress={() => onChange({ cuisineId: c.id })}
              />
            ))}
          </HScroll>
        </Section>
      )}
    </Card>
  );
}
