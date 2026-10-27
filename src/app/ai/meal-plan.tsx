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
  BREAKFAST: "sunny-outline",
  LUNCH: "restaurant-outline",
  DINNER: "moon-outline",
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
    <View className="flex-row items-center gap-2">
      <Pressable
        onPress={() => router.back()}
        hitSlop={8}
        accessibilityLabel="Quay lại">
        <Ionicons name="chevron-back" size={26} color={palette.ink} />
      </Pressable>
      <AppText variant="heading" className="flex-1">
        Tạo thực đơn bằng AI
      </AppText>
    </View>
  );

  if (saved) {
    return (
      <Screen>
        {header}
        <Card className="items-center gap-3 p-6">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-brandSoft dark:bg-successBg-dark">
            <Ionicons name="checkmark" size={40} color={brand} />
          </View>
          <AppText variant="heading">Đã lưu thực đơn</AppText>
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
      </Screen>
    );
  }

  return (
    <Screen>
      {header}

      <AppText variant="caption">
        AI chọn món từ kho công thức theo lựa chọn của bạn. Bạn xem lại và bỏ
        bớt món trước khi lưu.
      </AppText>

      <MealPlanOptionsCard
        cuisines={cuisines}
        value={options}
        onChange={(patch) => setOptions((o) => ({ ...o, ...patch }))}
      />

      <View className="flex-row items-start gap-2">
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

      {error ? <AppText variant="error">{error}</AppText> : null}

      {draft && (
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <AppText variant="heading">Bản nháp thực đơn</AppText>
            <Badge
              label={`${draft.entries.length} món · chưa lưu`}
              tone="warn"
            />
          </View>

          {draft.entries.length === 0 ? (
            <Card className="p-4">
              <AppText variant="caption">
                Chưa có món nào. Hãy thử tăng thời gian nấu hoặc chọn ẩm thực
                khác rồi tạo lại.
              </AppText>
            </Card>
          ) : (
            groups.map((day) => (
              <Card key={day.date} className="p-4">
                <AppText variant="heading" className="mb-1">
                  {day.title}
                </AppText>
                {day.items.map(({ index, entry }, i) => (
                  <View
                    key={`${entry.mealType}-${entry.recipeId}-${index}`}
                    className={cn(
                      "flex-row items-center gap-3 py-3",
                      i > 0 && "border-t border-line dark:border-line-dark",
                    )}>
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-soft dark:bg-soft-dark">
                      <Ionicons
                        name={MEAL_ICON[entry.mealType]}
                        size={20}
                        color={brand}
                      />
                    </View>
                    <View className="flex-1">
                      <AppText variant="caption">
                        {MEAL_LABEL[entry.mealType]}
                        {entry.servings ? ` · ${entry.servings} khẩu phần` : ""}
                      </AppText>
                      <AppText className="font-bold" numberOfLines={2}>
                        {entry.recipeTitle}
                      </AppText>
                    </View>
                    <Pressable
                      onPress={() => removeEntry(index)}
                      hitSlop={8}
                      accessibilityLabel={`Bỏ ${entry.recipeTitle}`}>
                      <Ionicons
                        name="close-circle-outline"
                        size={24}
                        color={palette.muted}
                      />
                    </Pressable>
                  </View>
                ))}
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
    </Screen>
  );
}
