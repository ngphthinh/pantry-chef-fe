import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DatePickerField } from '@/components/ui/DatePickerField';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { RecipePickerModal } from '@/features/mealplan/components/RecipePickerModal';
import { useMealPlanEntryForm } from '@/features/mealplan/useMealPlanEntryForm';
import type { MealType, RecipeSummaryResponse } from '@/types';

const MEAL_TYPES: {
  type: MealType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
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

  const [pickerVisible, setPickerVisible] = useState(false);

  const {
    values,
    errors,
    submitError,
    isSaving,
    isLoadingRecipe,
    setField,
    selectRecipe,
    clearRecipe,
    submit,
  } = useMealPlanEntryForm(
    null,
    params.defaultDate,
    params.defaultMealType,
    params.recipeId,
    params.recipeTitle,
  );

  const handleSelectRecipe = async (recipe: RecipeSummaryResponse) => {
    await selectRecipe(recipe);
  };

  const handleSubmit = async () => {
    try {
      const result = await submit();
      if (result) {
        Alert.alert('Thành công', 'Đã thêm bữa ăn vào thực đơn!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch {
      Alert.alert(
        'Lỗi lưu bữa ăn',
        submitError || 'Không thể thêm bữa ăn. Vui lòng kiểm tra lại các trường thông tin.',
      );
    }
  };

  return (
    <View className="flex-1 bg-canvas dark:bg-canvas-dark">
      <Screen>
        {/* Header */}
        <View className="flex-row items-center gap-3 pb-3 border-b border-line dark:border-line-dark">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-soft dark:bg-surface-dark active:opacity-70"
          >
            <Ionicons name="arrow-back" size={20} color={palette.ink} />
          </Pressable>
          <View>
            <AppText variant="title">Thêm bữa ăn</AppText>
            <AppText variant="caption" className="text-muted">
              Lập kế hoạch dinh dưỡng cho gia đình
            </AppText>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, gap: 16, paddingTop: 16 }}
        >
          {/* Submit Error Banner */}
          {submitError ? (
            <View className="flex-row items-center gap-2 rounded-2xl bg-red-50 p-3.5 border border-red-200 dark:bg-red-950/30 dark:border-red-800">
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <AppText className="flex-1 text-xs font-semibold text-red-600 dark:text-red-400">
                {submitError}
              </AppText>
            </View>
          ) : null}

          {/* 1. Meal Type Selector (Ràng buộc nullable = false) */}
          <Card className="p-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
              <AppText variant="label" className="font-bold">
                Loại bữa ăn <AppText className="text-red-500">*</AppText>
              </AppText>
              {errors.mealType ? (
                <AppText className="text-xs text-red-500 font-medium">
                  {errors.mealType}
                </AppText>
              ) : null}
            </View>

            <View className="flex-row gap-2.5">
              {MEAL_TYPES.map((m) => {
                const isSelected = values.mealType === m.type;
                return (
                  <Pressable
                    key={m.type}
                    onPress={() => setField('mealType', m.type)}
                    className={`flex-1 items-center gap-1.5 rounded-2xl p-3.5 shadow-sm active:scale-95 transition-all ${
                      isSelected
                        ? 'border-2 border-brand bg-brandSoft dark:bg-surface-dark'
                        : 'border border-line bg-soft dark:border-line-dark dark:bg-soft-dark'
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

          {/* 2. Date Picker (Ràng buộc nullable = false) */}
          <Card className="p-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
              <AppText variant="label" className="font-bold">
                Ngày dùng bữa <AppText className="text-red-500">*</AppText>
              </AppText>
              {errors.date ? (
                <AppText className="text-xs text-red-500 font-medium">
                  {errors.date}
                </AppText>
              ) : null}
            </View>

            <DatePickerField
              value={values.date}
              onChange={(d) => setField('date', d)}
            />
          </Card>

          {/* 3. Recipe Selection (Liên kết Recipe của Tùng) */}
          <Card className="p-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center gap-1.5">
                <AppText variant="label" className="font-bold">
                  Công thức món ăn
                </AppText>
                <View className="rounded-full bg-soft px-2.5 py-0.5 dark:bg-soft-dark">
                  <AppText className="text-xs font-semibold text-muted">Tuỳ chọn</AppText>
                </View>
              </View>
              {values.recipeId || values.recipeTitle ? (
                <Pressable
                  onPress={clearRecipe}
                  className="flex-row items-center gap-1 active:opacity-70"
                >
                  <Ionicons name="trash-outline" size={14} color="#EF4444" />
                  <AppText className="text-xs text-red-500 font-semibold">
                    Bỏ chọn
                  </AppText>
                </Pressable>
              ) : null}
            </View>

            {isLoadingRecipe ? (
              <View className="items-center justify-center p-6 rounded-2xl bg-soft dark:bg-soft-dark">
                <ActivityIndicator size="small" color={brand} />
                <AppText className="mt-2 text-xs text-muted">
                  Đang đồng bộ công thức từ hệ thống...
                </AppText>
              </View>
            ) : values.recipeTitle ? (
              // Selected Recipe Preview Card
              <View className="rounded-2xl border border-line bg-soft/50 p-3.5 dark:border-line-dark dark:bg-surface-dark">
                <View className="flex-row items-center gap-3">
                  <View className="h-16 w-16 overflow-hidden rounded-xl bg-canvas dark:bg-canvas-dark">
                    {values.recipeImageUrl ? (
                      <Image
                        source={{ uri: values.recipeImageUrl }}
                        className="h-full w-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="h-full w-full items-center justify-center">
                        <Ionicons name="restaurant" size={24} color={brand} />
                      </View>
                    )}
                  </View>

                  <View className="flex-1 justify-center">
                    <AppText
                      numberOfLines={2}
                      className="text-base font-bold text-ink dark:text-ink-dark"
                    >
                      {values.recipeTitle}
                    </AppText>

                    <View className="mt-1 flex-row items-center gap-2">
                      {values.recipeId ? (
                        <View className="flex-row items-center gap-1">
                          <Ionicons name="checkmark-circle" size={13} color="#10B981" />
                          <AppText className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                            Đã liên kết Recipe
                          </AppText>
                        </View>
                      ) : (
                        <AppText className="text-xs text-muted">
                          Tên món tuỳ chỉnh
                        </AppText>
                      )}
                    </View>
                  </View>
                </View>

                {/* Change Recipe Button */}
                <Pressable
                  onPress={() => setPickerVisible(true)}
                  className="mt-3 flex-row items-center justify-center gap-1.5 rounded-xl border border-line bg-surface py-2 active:opacity-70 dark:border-line-dark dark:bg-surface-dark"
                >
                  <Ionicons name="swap-horizontal" size={16} color={brand} />
                  <AppText className="text-xs font-bold text-brand">
                    Đổi món khác từ kho công thức
                  </AppText>
                </Pressable>
              </View>
            ) : (
              // Empty State - Select or Type
              <View className="gap-3">
                <Pressable
                  onPress={() => setPickerVisible(true)}
                  className="flex-row items-center justify-between rounded-2xl border border-dashed border-brand/60 bg-brandSoft/40 p-4 active:opacity-80 dark:bg-surface-dark"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
                      <Ionicons name="search" size={20} color="#fff" />
                    </View>
                    <View>
                      <AppText className="text-sm font-bold text-ink dark:text-ink-dark">
                        Tìm và chọn từ kho công thức
                      </AppText>
                      <AppText variant="caption" className="text-muted">
                        Gợi ý từ tủ, tìm theo tên, món phổ biến
                      </AppText>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={brand} />
                </Pressable>

                <View className="flex-row items-center gap-2 px-1">
                  <View className="h-[1px] flex-1 bg-line dark:bg-line-dark" />
                  <AppText variant="caption" className="text-muted">
                    hoặc tự đặt tên món
                  </AppText>
                  <View className="h-[1px] flex-1 bg-line dark:bg-line-dark" />
                </View>

                <TextField
                  label="Tên món ăn (tuỳ chỉnh)"
                  value={values.recipeTitle}
                  onChangeText={(text) => setField('recipeTitle', text)}
                  placeholder="Ví dụ: Cơm rang dưa bò..."
                />
              </View>
            )}

            {errors.recipeId ? (
              <AppText className="mt-1 text-xs text-red-500">
                {errors.recipeId}
              </AppText>
            ) : null}
          </Card>

          {/* 4. Servings (Ràng buộc số nguyên > 0) */}
          <Card className="p-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
              <AppText variant="label" className="font-bold">
                Số khẩu phần (người ăn)
              </AppText>
              {errors.servings ? (
                <AppText className="text-xs text-red-500 font-medium">
                  {errors.servings}
                </AppText>
              ) : null}
            </View>

            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={() => {
                  const curr = parseInt(values.servings || '2', 10);
                  if (curr > 1) {
                    setField('servings', String(curr - 1));
                  }
                }}
                className="h-11 w-11 items-center justify-center rounded-xl border border-line bg-soft active:opacity-70 dark:border-line-dark dark:bg-surface-dark"
              >
                <Ionicons name="remove" size={18} color={palette.ink} />
              </Pressable>

              <View className="flex-1">
                <TextField
                  label="Số người"
                  value={values.servings}
                  onChangeText={(text) => setField('servings', text)}
                  keyboardType="numeric"
                  placeholder="Ví dụ: 2"
                  error={errors.servings}
                />
              </View>

              <Pressable
                onPress={() => {
                  const curr = parseInt(values.servings || '2', 10);
                  setField('servings', String(curr + 1));
                }}
                className="h-11 w-11 items-center justify-center rounded-xl border border-line bg-soft active:opacity-70 dark:border-line-dark dark:bg-surface-dark"
              >
                <Ionicons name="add" size={18} color={palette.ink} />
              </Pressable>
            </View>
          </Card>

          {/* 5. Submit Button */}
          <Button
            title={isSaving ? 'Đang lưu bữa ăn...' : 'Lưu vào thực đơn'}
            onPress={handleSubmit}
            variant="primary"
            disabled={isSaving}
            className="mt-2 py-3.5 shadow-md"
          />
        </ScrollView>

        {/* Recipe Picker Modal */}
        <RecipePickerModal
          visible={pickerVisible}
          onClose={() => setPickerVisible(false)}
          onSelectRecipe={handleSelectRecipe}
          selectedRecipeId={values.recipeId}
        />
      </Screen>
    </View>
  );
}
