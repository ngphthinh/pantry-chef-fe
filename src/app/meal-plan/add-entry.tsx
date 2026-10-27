import React from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { useMealPlanEntryForm } from '@/features/mealplan/useMealPlanEntryForm';
import type { MealType } from '@/types';

const MEAL_TYPES: { type: MealType; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
  { type: 'BREAKFAST', label: 'Bữa sáng', icon: 'sunny-outline', color: '#F59E0B' },
  { type: 'LUNCH', label: 'Bữa trưa', icon: 'partly-sunny-outline', color: '#10B981' },
  { type: 'DINNER', label: 'Bữa tối', icon: 'moon-outline', color: '#6366F1' },
];

export default function AddMealPlanEntryScreen() {
  const router = useRouter();
  const { brand, palette } = useAppTheme();
  const params = useLocalSearchParams<{
    defaultDate?: string;
    defaultMealType?: MealType;
    recipeId?: string;
    recipeTitle?: string;
  }>();

  const { values, errors, isSaving, setField, submit } = useMealPlanEntryForm(
    null,
    params.defaultDate,
    params.defaultMealType,
  );

  const handleSubmit = async () => {
    try {
      await submit();
      Alert.alert('Thành công', 'Đã thêm bữa ăn vào thực đơn!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Lỗi', 'Không thể thêm bữa ăn. Vui lòng kiểm tra lại.');
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
          <AppText variant="title">Thêm bữa ăn</AppText>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="gap-4 pb-12">
          {/* Meal Type 3D Selector */}
          <Card className="p-4 shadow-sm">
            <AppText variant="label" className="mb-2.5">
              Loại bữa ăn
            </AppText>
            <View className="flex-row gap-2.5">
              {MEAL_TYPES.map((m) => {
                const isSelected = values.mealType === m.type;
                return (
                  <Pressable
                    key={m.type}
                    onPress={() => setField('mealType', m.type)}
                    className={`flex-1 items-center gap-1.5 rounded-2xl p-3.5 shadow-sm active:scale-95 ${
                      isSelected
                        ? 'border-2 border-brand bg-brandSoft dark:bg-surface-dark'
                        : 'bg-soft dark:bg-soft-dark'
                    }`}
                  >
                    <Ionicons
                      name={m.icon}
                      size={24}
                      color={isSelected ? m.color : palette.muted}
                    />
                    <AppText
                      className={`text-xs font-bold ${
                        isSelected ? 'text-brand' : 'text-muted'
                      }`}
                    >
                      {m.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          {/* Date Picker */}
          <Card className="p-4 shadow-sm">
            <TextField
              label="Ngày (YYYY-MM-DD)"
              value={values.date}
              onChangeText={(text) => setField('date', text)}
              error={errors.date}
              placeholder="Ví dụ: 2026-10-27"
            />
          </Card>

          {/* Recipe / Dish Name */}
          <Card className="p-4 shadow-sm">
            <TextField
              label="Tên món ăn"
              value={values.recipeTitle}
              onChangeText={(text) => setField('recipeTitle', text)}
              placeholder="Ví dụ: Canh chua cá bớp"
            />
          </Card>

          {/* Servings */}
          <Card className="p-4 shadow-sm">
            <TextField
              label="Số khẩu phần (người ăn)"
              value={values.servings}
              onChangeText={(text) => setField('servings', text)}
              keyboardType="numeric"
              error={errors.servings}
              placeholder="Ví dụ: 2"
            />
          </Card>

          {/* Submit */}
          <Button
            title={isSaving ? 'Đang lưu bữa ăn...' : 'Lưu vào thực đơn'}
            onPress={handleSubmit}
            variant="primary"
            disabled={isSaving}
            className="mt-2"
          />
        </ScrollView>
      </Screen>
    </View>
  );
}
