import { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";
import { Screen } from "@/components/ui/Screen";
import { getErrorMessage } from "@/core/http/apiError";
import { useAppTheme } from "@/core/theme/useAppTheme";
import {
  MealPlanOptionsCard,
  type MealPlanOptions,
} from "@/features/ai/components/MealPlanOptionsCard";
import {
  groupDraftByDay,
  MEAL_LABEL,
  todayKey,
  toWeekStart,
} from "@/features/ai/mealPlanFormat";
import { useAiMealPlan } from "@/features/ai/useAiMealPlan";
import { useCuisines } from "@/features/cuisine/useCuisines";
import type { MealType } from "@/types";

const MEAL_ICON: Record<MealType, keyof typeof Ionicons.glyphMap> = {
  BREAKFAST: "sunny",
  LUNCH: "restaurant",
  DINNER: "moon",
};

export default function AiMealPlanScreen() {
  const router = useRouter();
  const { palette, brand } = useAppTheme();
  const { draft, generate, removeEntry, save } = useAiMealPlan();
  const cuisines = useCuisines();
  const [options, setOptions] = useState<MealPlanOptions>(() => ({
    startDate: todayKey(),
    days: 5,
  }));

  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mealColor: Record<MealType, string> = {
    BREAKFAST: palette.warnInk,
    LUNCH: palette.successInk,
    DINNER: brand,
  };

  const groups = useMemo(() => (draft ? groupDraftByDay(draft) : []), [draft]);

  const onGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      await generate({
        weekStart: toWeekStart(options.startDate),
        days: options.days,
        maxMinutes: options.maxMinutes,
        cuisineId: options.cuisineId,
      });
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setGenerating(false);
    }
  };

  const onSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await save();
      setSaved(true);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const header = (
    <View className="flex-row items-center gap-3">
      <Pressable
        onPress={() => router.back()}
        hitSlop={8}
        accessibilityLabel="Quay lại"
        className="h-10 w-10 items-center justify-center rounded-full bg-soft active:scale-90 dark:bg-surface-dark">
        <Ionicons name="arrow-back" size={20} color={palette.ink} />
      </Pressable>
      <View className="flex-1">
        <AppText variant="title">Tạo thực đơn bằng AI</AppText>
        <AppText variant="caption">
          Chọn món từ kho công thức theo ý bạn
        </AppText>
      </View>
    </View>
  );

  if (saved) {
    return (
      <Screen>
        <View className="gap-5 pb-10">
          {header}
          <Card className="items-center gap-3 bg-successBg/50 p-8 shadow-sm dark:bg-successBg-dark">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-surface dark:bg-soft-dark">
              <Ionicons
                name="checkmark-circle"
                size={56}
                color={palette.successInk}
              />
            </View>
            <AppText variant="heading" className="text-xl">
              Đã lưu thực đơn
            </AppText>
            <AppText variant="caption" className="text-center">
              Thực đơn đã được thêm vào lịch của bạn. Bạn có thể chỉnh sửa từng
              bữa trong tab Thực đơn.
            </AppText>
          </Card>
          <Button
            title="Xem thực đơn"
            onPress={() => router.replace("/meal-plan" as Href)}
          />
          <Button
            title="Tạo thêm"
            variant="secondary"
            onPress={() => setSaved(false)}
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="gap-5 pb-10">
        {header}

        {/* Intro */}
        <Card className="flex-row items-center gap-3 bg-brandSoft/40 p-4 shadow-sm dark:bg-surface-dark">
          <View className="h-11 w-11 items-center justify-center rounded-2xl bg-surface dark:bg-soft-dark">
            <Ionicons name="sparkles" size={22} color={brand} />
          </View>
          <AppText variant="caption" className="flex-1">
            AI chọn món từ kho công thức theo lựa chọn của bạn. Bạn xem lại và
            bỏ bớt món trước khi lưu.
          </AppText>
        </Card>

        <MealPlanOptionsCard
          cuisines={cuisines}
          value={options}
          onChange={(patch) => setOptions((o) => ({ ...o, ...patch }))}
        />

        <View className="flex-row items-start gap-2 px-1">
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={palette.muted}
          />
          <AppText variant="caption" className="flex-1">
            Thực đơn chỉ gợi ý món ăn để tham khảo, không phải tư vấn y tế hay
            dinh dưỡng.
          </AppText>
        </View>

        <Button
          title={draft ? "Tạo lại thực đơn" : "Tạo thực đơn"}
          variant={draft ? "outline" : "primary"}
          loading={generating}
          disabled={saving}
          onPress={onGenerate}
        />

        {error ? (
          <View className="flex-row items-center gap-2 rounded-2xl border border-dangerInk/40 bg-dangerBg/40 p-3 dark:border-dangerInk-dark/40 dark:bg-dangerBg-dark">
            <Ionicons name="alert-circle" size={18} color={palette.dangerInk} />
            <AppText variant="error" className="flex-1">
              {error}
            </AppText>
          </View>
        ) : null}

        {draft && (
          <View className="gap-3">
            <View className="flex-row items-center justify-between px-1">
              <AppText
                variant="label"
                className="text-xs font-bold uppercase tracking-wider text-muted dark:text-muted-dark">
                Bản nháp thực đơn
              </AppText>
              <Badge
                label={`${draft.entries.length} món · chưa lưu`}
                tone="warn"
              />
            </View>

            {draft.entries.length === 0 ? (
              <Card className="items-center gap-2 p-6 shadow-sm">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-brandSoft dark:bg-soft-dark">
                  <Ionicons name="restaurant-outline" size={30} color={brand} />
                </View>
                <AppText variant="caption" className="text-center">
                  Chưa có món nào. Hãy thử tăng thời gian nấu hoặc chọn ẩm thực
                  khác rồi tạo lại.
                </AppText>
              </Card>
            ) : (
              groups.map((day) => (
                <Card key={day.date} className="overflow-hidden shadow-sm">
                  <View className="flex-row items-center gap-2 bg-brandSoft/50 px-4 py-3 dark:bg-surface-dark">
                    <Ionicons name="calendar" size={16} color={brand} />
                    <AppText variant="heading" className="text-base">
                      {day.title}
                    </AppText>
                  </View>

                  <View className="px-4">
                    {day.items.map(({ index, entry }, i) => {
                      const color = mealColor[entry.mealType];
                      return (
                        <View
                          key={`${entry.mealType}-${entry.recipeId}-${index}`}
                          className={cn(
                            "flex-row items-center gap-3 py-3",
                            i > 0 &&
                              "border-t border-line dark:border-line-dark",
                          )}>
                          <View
                            className="h-11 w-11 items-center justify-center rounded-2xl"
                            style={{ backgroundColor: `${color}22` }}>
                            <Ionicons
                              name={MEAL_ICON[entry.mealType]}
                              size={20}
                              color={color}
                            />
                          </View>
                          <View className="flex-1 gap-0.5">
                            <AppText
                              className="text-xs font-bold uppercase tracking-wider"
                              style={{ color }}>
                              {MEAL_LABEL[entry.mealType]}
                              {entry.servings
                                ? ` · ${entry.servings} khẩu phần`
                                : ""}
                            </AppText>
                            <AppText className="font-bold" numberOfLines={2}>
                              {entry.recipeTitle}
                            </AppText>
                          </View>
                          <Pressable
                            onPress={() => removeEntry(index)}
                            hitSlop={8}
                            accessibilityLabel={`Bỏ ${entry.recipeTitle}`}
                            className="h-8 w-8 items-center justify-center rounded-full bg-soft active:scale-90 dark:bg-soft-dark">
                            <Ionicons
                              name="close"
                              size={16}
                              color={palette.muted}
                            />
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                </Card>
              ))
            )}

            <Button
              title="Lưu thực đơn"
              loading={saving}
              disabled={generating || draft.entries.length === 0}
              onPress={onSave}
            />
          </View>
        )}
      </View>
    </Screen>
  );
}
