import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { useMealPlan } from '@/features/mealplan/useMealPlan';
import type { AiMealPlanResponse, MealType } from '@/types';

const TIME_OPTIONS = [15, 30, 45, 60];
const DAY_OPTIONS = [3, 5, 7];

const MEAL_TYPE_NAMES: Record<MealType, string> = {
  BREAKFAST: 'Bữa sáng',
  LUNCH: 'Bữa trưa',
  DINNER: 'Bữa tối',
};

export default function AiMealPlanScreen() {
  const router = useRouter();
  const { brand, palette } = useAppTheme();
  const {
    aiDraft,
    isGeneratingAi,
    isSaving,
    generateAiDraft,
    saveAiDraftAsPlan,
  } = useMealPlan();

  const [days, setDays] = useState(7);
  const [maxMinutes, setMaxMinutes] = useState(45);
  const [draft, setDraft] = useState<AiMealPlanResponse | null>(aiDraft);

  const handleGenerate = async () => {
    try {
      const result = await generateAiDraft({
        weekStart: new Date().toISOString(),
        days,
        maxMinutes,
      });
      setDraft(result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tạo thực đơn AI từ backend';
      Alert.alert('Lỗi API', msg);
    }
  };

  const handleSaveToPlan = async () => {
    try {
      await saveAiDraftAsPlan();
      Alert.alert(
        'Đã lưu thực đơn!',
        'Kế hoạch bữa ăn đã được lưu vào backend thành công.',
        [{ text: 'Xem thực đơn', onPress: () => router.push('/(tabs)/meal-plan') }],
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu thực đơn vào backend';
      Alert.alert('Lỗi', msg);
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
              <AppText variant="title">AI Soạn Thực Đơn</AppText>
              <AppText variant="caption">Tối ưu nguyên liệu tủ đồ & dinh dưỡng</AppText>
            </View>
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brandSoft dark:bg-surface-dark">
            <Ionicons name="sparkles" size={22} color={brand} />
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="gap-4 pb-12">
          {/* AI Configuration 3D Card */}
          <Card className="p-4 shadow-sm">
            <AppText variant="heading" className="text-base font-bold">
              Tuỳ chỉnh gợi ý AI
            </AppText>

            {/* Days option */}
            <AppText variant="label" className="mb-2 mt-3">
              Số ngày lên lịch
            </AppText>
            <View className="flex-row gap-2">
              {DAY_OPTIONS.map((d) => (
                <Chip
                  key={d}
                  label={`${d} ngày`}
                  selected={days === d}
                  onPress={() => setDays(d)}
                />
              ))}
            </View>

            {/* Max minutes option */}
            <AppText variant="label" className="mb-2 mt-4">
              Thời gian nấu tối đa mỗi bữa
            </AppText>
            <View className="flex-row gap-2">
              {TIME_OPTIONS.map((m) => (
                <Chip
                  key={m}
                  label={`≤ ${m} phút`}
                  selected={maxMinutes === m}
                  onPress={() => setMaxMinutes(m)}
                />
              ))}
            </View>

            {/* Generate Button */}
            <Button
              title={
                isGeneratingAi
                  ? 'AI đang phân tích tủ đồ...'
                  : 'Tạo bản nháp thực đơn AI'
              }
              onPress={handleGenerate}
              variant="primary"
              disabled={isGeneratingAi}
              className="mt-4"
            />
          </Card>

          {/* AI Draft Result Section */}
          {draft && (
            <View className="gap-3">
              <View className="flex-row items-center justify-between px-1">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="checkmark-done-circle" size={20} color={brand} />
                  <AppText variant="label" className="text-base font-bold">
                    Bản nháp gợi ý ({draft.entries.length} bữa ăn)
                  </AppText>
                </View>
                <Badge label="Bản nháp" tone="warn" />
              </View>

              {draft.entries.map((entry, index) => {
                const dateStr = entry.date.split('T')[0];
                return (
                  <Card key={`${entry.recipeId}-${index}`} className="p-4 shadow-sm">
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 pr-2">
                        <View className="flex-row items-center gap-2">
                          <Badge
                            label={MEAL_TYPE_NAMES[entry.mealType] || entry.mealType}
                            tone={entry.mealType === 'LUNCH' ? 'success' : 'warn'}
                          />
                          <AppText variant="caption">{dateStr}</AppText>
                        </View>
                        <AppText variant="heading" className="mt-2 text-base">
                          {entry.recipeTitle}
                        </AppText>
                      </View>
                      <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brandSoft/50 dark:bg-surface-dark">
                        <Ionicons name="restaurant-outline" size={20} color={brand} />
                      </View>
                    </View>

                    {entry.servings && (
                      <View className="mt-2.5 flex-row items-center gap-1.5 border-t border-line pt-2 dark:border-line-dark">
                        <Ionicons name="people-outline" size={14} color={palette.muted} />
                        <AppText variant="caption">{entry.servings} phần ăn</AppText>
                      </View>
                    )}
                  </Card>
                );
              })}

              {/* Save Draft CTA */}
              <Button
                title={
                  isSaving
                    ? 'Đang lưu vào kế hoạch...'
                    : 'Lưu vào thực đơn tuần'
                }
                onPress={handleSaveToPlan}
                variant="primary"
                disabled={isSaving}
                className="mt-2"
              />
            </View>
          )}
        </ScrollView>
      </Screen>
    </View>
  );
}
