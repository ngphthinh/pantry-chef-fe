import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { Screen } from "@/components/ui/Screen";
import { TactileButton } from "@/components/ui/TactileButton";
import { RecipePickerModal } from "@/components/recipe/RecipePickerModal";
import { recipeService } from "@/core/di/container";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { formatLocalDate, getMondayOfWeek } from "@/features/mealplan/mealPlanSlice";
import { useMealPlan } from "@/features/mealplan/useMealPlan";
import { palette } from "@/theme";
import type {
  MealPlanEntryCreateRequest,
  MealType,
  RecipeSummaryResponse,
} from "@/types";

const MEAL_TYPES: {
  type: MealType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
  {
    type: "BREAKFAST",
    label: "Bữa sáng",
    icon: "sunny-outline",
    color: palette.amber[500],
  },
  {
    type: "LUNCH",
    label: "Bữa trưa",
    icon: "partly-sunny-outline",
    color: palette.emerald[500],
  },
  {
    type: "DINNER",
    label: "Bữa tối",
    icon: "moon-outline",
    color: palette.info[600],
  },
];

interface SelectedDish {
  recipeId?: string | null;
  externalId?: string | null;
  recipeTitle: string;
  recipeImageUrl?: string | null;
  servings: number;
}

export default function AddMealPlanEntryScreen() {
  const router = useRouter();
  const { brand, palette, colors, isDark } = useAppTheme();
  const params = useLocalSearchParams<{
    defaultDate?: string;
    defaultMealType?: MealType;
    recipeId?: string;
    recipeTitle?: string;
  }>();

  const { addEntries, loadWeek } = useMealPlan();

  const todayStr = useMemo(() => formatLocalDate(new Date()), []);

  // Ngày dùng bữa: Ràng buộc không cho chọn ngày trong quá khứ
  const initialDate = (() => {
    if (params.defaultDate && params.defaultDate >= todayStr) {
      return params.defaultDate;
    }
    return todayStr;
  })();

  const [date, setDate] = useState<string>(initialDate);
  const [mealType, setMealType] = useState<MealType>(
    params.defaultMealType ?? "DINNER",
  );
  const [servings, setServings] = useState<number>(2);

  useEffect(() => {
    if (date) {
      const [y, m, d] = date.split("-").map(Number);
      const targetWeekStart = getMondayOfWeek(new Date(y, m - 1, d, 12, 0, 0));
      void loadWeek(targetWeekStart);
    }
  }, [date, loadWeek]);

  // Danh sách các món ăn trong bữa ăn (Hỗ trợ chọn nhiều món)
  const [selectedDishes, setSelectedDishes] = useState<SelectedDish[]>(() => {
    if (params.recipeId && params.recipeTitle) {
      return [
        {
          recipeId: params.recipeId,
          recipeTitle: params.recipeTitle,
          recipeImageUrl: null,
          servings: 2,
        },
      ];
    }
    return [];
  });

  const [pickerVisible, setPickerVisible] = useState(false);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Xử lý khi người dùng chọn nhiều món từ RecipePickerModal
  const handleSelectRecipes = async (recipes: RecipeSummaryResponse[]) => {
    setIsLoadingRecipe(true);
    setSubmitError(null);
    try {
      const resolved: SelectedDish[] = await Promise.all(
        recipes.map(async (recipe) => {
          let finalRecipeId = recipe.id ?? undefined;
          let finalTitle = recipe.title;
          let finalImage = recipe.imageUrl;
          let itemServings = recipe.servings || servings || 2;

          // Giữ lại số khẩu phần đã chỉnh trước đó (nếu đã có trong danh sách)
          const existing = selectedDishes.find(
            (d) =>
              (d.recipeId && recipe.id && d.recipeId === recipe.id) ||
              (d.externalId &&
                recipe.externalId &&
                d.externalId === recipe.externalId),
          );
          if (existing) {
            itemServings = existing.servings;
          }

          // Với món Spoonacular chưa lưu nội bộ (custom = false, chưa có recipeId):
          // Gọi GET /v1/recipes/{externalId} để backend lưu vào DB và trả về UUID
          if (!recipe.custom && recipe.externalId && !finalRecipeId) {
            try {
              const detail = await recipeService.getDetail(recipe.externalId);
              finalRecipeId = detail.id;
              finalTitle = detail.title || finalTitle;
              finalImage = detail.imageUrl || finalImage;
              if (detail.servings && !existing) {
                itemServings = detail.servings;
              }
            } catch (e) {
              console.warn(
                "Không thể lấy chi tiết công thức external:",
                recipe.externalId,
                e,
              );
            }
          }

          return {
            recipeId: finalRecipeId || recipe.id || recipe.externalId,
            externalId: recipe.externalId,
            recipeTitle: finalTitle,
            recipeImageUrl: finalImage,
            servings: itemServings,
          };
        }),
      );

      setSelectedDishes(resolved);
    } catch (err: unknown) {
      setSubmitError(
        err instanceof Error ? err.message : "Lỗi khi xử lý công thức",
      );
    } finally {
      setIsLoadingRecipe(false);
    }
  };

  const handleRemoveDish = (index: number) => {
    setSelectedDishes((prev) => prev.filter((_, i) => i !== index));
  };

  const changeDishServings = (index: number, delta: number) => {
    setSelectedDishes((prev) =>
      prev.map((dish, i) =>
        i === index
          ? { ...dish, servings: Math.max(1, dish.servings + delta) }
          : dish,
      ),
    );
  };

  const changeGlobalServings = (delta: number) => {
    const nextVal = Math.max(1, servings + delta);
    setServings(nextVal);
    // Đồng bộ khẩu phần cho tất cả các món đang có
    setSelectedDishes((prev) =>
      prev.map((d) => ({ ...d, servings: nextVal })),
    );
  };

  const handleSubmit = async () => {
    if (selectedDishes.length === 0) {
      Alert.alert(
        "Chưa chọn món ăn",
        "Vui lòng chọn ít nhất một công thức món ăn từ kho công thức.",
      );
      return;
    }

    if (date < todayStr) {
      Alert.alert(
        "Ngày không hợp lệ",
        "Không thể thêm bữa ăn cho ngày trong quá khứ.",
      );
      return;
    }

    setIsSaving(true);
    setSubmitError(null);
    try {
      const entries: MealPlanEntryCreateRequest[] = selectedDishes.map(
        (dish) => ({
          date: date.trim(),
          mealType,
          recipeId:
            dish.recipeId && dish.recipeId.trim()
              ? dish.recipeId.trim()
              : undefined,
          servings: dish.servings,
        }),
      );

      await addEntries(entries);

      const mealLabel =
        MEAL_TYPES.find((m) => m.type === mealType)?.label || "bữa ăn";

      Alert.alert(
        "Thành công",
        `Đã thêm ${entries.length} món vào ${mealLabel.toLowerCase()} ngày ${date}!`,
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi lưu bữa ăn";
      setSubmitError(msg);
      Alert.alert("Lỗi lưu bữa ăn", msg);
    } finally {
      setIsSaving(false);
    }
  };

  const initialSelectedRecipes = useMemo<RecipeSummaryResponse[]>(() => {
    return selectedDishes.map(
      (d) =>
        ({
          id: d.recipeId,
          externalId: d.externalId,
          title: d.recipeTitle,
          imageUrl: d.recipeImageUrl ?? null,
        }) as RecipeSummaryResponse,
    );
  }, [selectedDishes]);

  return (
    <View className="flex-1 bg-canvas dark:bg-canvas-dark">
      <Screen>
        {/* Header */}
        <View className="flex-row items-center gap-3 pb-3 border-b border-line dark:border-line-dark">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-soft dark:bg-surface-dark active:opacity-70">
            <Ionicons name="arrow-back" size={20} color={palette.ink} />
          </Pressable>
          <View>
            <AppText variant="title">Thêm bữa ăn</AppText>
            <AppText variant="caption" className="text-muted">
              Lập kế hoạch nhiều món cho bữa ăn gia đình
            </AppText>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 40,
            gap: 16,
            paddingTop: 16,
          }}>
          {/* Submit Error Banner */}
          {submitError ? (
            <View className="flex-row items-center gap-2 rounded-2xl bg-red-50 p-3.5 border border-red-200 dark:bg-red-950/30 dark:border-red-800">
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <AppText className="flex-1 text-xs font-semibold text-red-600 dark:text-red-400">
                {submitError}
              </AppText>
            </View>
          ) : null}

          {/* 1. Meal Type Selector */}
          <Card className="p-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
              <AppText variant="label" className="font-bold">
                Loại bữa ăn <AppText className="text-red-500">*</AppText>
              </AppText>
            </View>

            <View className="flex-row gap-2.5">
              {MEAL_TYPES.map((m) => {
                const isSelected = mealType === m.type;
                return (
                  <Pressable
                    key={m.type}
                    onPress={() => setMealType(m.type)}
                    className={`flex-1 items-center gap-1.5 overflow-hidden rounded-2xl border-2 p-3.5 active:opacity-80 ${
                      isSelected
                        ? "border-brand bg-brandSoft dark:bg-surface-dark"
                        : "border-line bg-soft dark:border-line-dark dark:bg-soft-dark"
                    }`}>
                    <Ionicons
                      name={m.icon}
                      size={24}
                      color={isSelected ? m.color : palette.muted}
                    />
                    <AppText
                      className={`text-xs font-bold ${
                        isSelected ? "text-brand" : "text-muted"
                      }`}>
                      {m.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </Card>

          {/* 2. Date Picker (Ràng buộc minDate không cho chọn ngày trong quá khứ) */}
          <Card className="p-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
              <AppText variant="label" className="font-bold">
                Ngày dùng bữa <AppText className="text-red-500">*</AppText>
              </AppText>
            </View>

            <DatePickerField
              value={date}
              minDate={todayStr}
              onChange={(d) => setDate(d)}
            />
          </Card>

          {/* 3. Global Servings Stepper */}
          <Card className="p-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-2">
              <AppText variant="label" className="font-bold">
                Số khẩu phần mặc định (người ăn)
              </AppText>
              <AppText variant="caption" className="text-muted">
                Áp dụng cho các món
              </AppText>
            </View>

            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={() => changeGlobalServings(-1)}
                className="h-11 w-11 items-center justify-center rounded-xl border border-line bg-soft active:opacity-70 dark:border-line-dark dark:bg-surface-dark">
                <Ionicons name="remove" size={18} color={palette.ink} />
              </Pressable>

              <TextInput
                value={String(servings)}
                onChangeText={(text) => {
                  const num = parseInt(text.replace(/[^0-9]/g, ""), 10);
                  if (!Number.isNaN(num) && num > 0) {
                    setServings(num);
                    setSelectedDishes((prev) =>
                      prev.map((d) => ({ ...d, servings: num })),
                    );
                  }
                }}
                keyboardType="numeric"
                placeholder="Ví dụ: 2"
                placeholderTextColor={palette.muted}
                className="h-11 flex-1 rounded-xl border border-line bg-soft px-3 py-0 text-center text-sm font-bold text-ink dark:border-line-dark dark:bg-surface-dark dark:text-white"
              />

              <Pressable
                onPress={() => changeGlobalServings(1)}
                className="h-11 w-11 items-center justify-center rounded-xl border border-line bg-soft active:opacity-70 dark:border-line-dark dark:bg-surface-dark">
                <Ionicons name="add" size={18} color={palette.ink} />
              </Pressable>
            </View>
          </Card>

          {/* 4. Selected Dishes Section (Hỗ trợ chọn nhiều món) */}
          <Card className="p-4 shadow-sm">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <AppText variant="label" className="font-bold">
                  Các món trong bữa ăn <AppText className="text-red-500">*</AppText>
                </AppText>
                {selectedDishes.length > 0 && (
                  <View className="rounded-full bg-brand/15 px-2.5 py-0.5">
                    <AppText className="text-xs font-bold text-brand">
                      {selectedDishes.length} món
                    </AppText>
                  </View>
                )}
              </View>

              {selectedDishes.length > 0 && (
                <Pressable
                  onPress={() => setPickerVisible(true)}
                  className="flex-row items-center gap-1 active:opacity-70">
                  <Ionicons name="add-circle" size={16} color={brand} />
                  <AppText className="text-xs font-bold text-brand">
                    Thêm món
                  </AppText>
                </Pressable>
              )}
            </View>

            {isLoadingRecipe ? (
              <View className="items-center justify-center p-6 rounded-2xl bg-soft dark:bg-soft-dark">
                <ActivityIndicator size="small" color={brand} />
                <AppText className="mt-2 text-xs text-muted">
                  Đang đồng bộ thông tin các món đã chọn...
                </AppText>
              </View>
            ) : selectedDishes.length > 0 ? (
              <View className="gap-3">
                {selectedDishes.map((dish, idx) => (
                  <View
                    key={dish.recipeId || dish.externalId || `dish-${idx}`}
                    style={{
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.04)"
                        : "#F9FAF9",
                      borderColor: isDark
                        ? "rgba(255,255,255,0.1)"
                        : "rgba(0,0,0,0.08)",
                      borderWidth: 1.2,
                    }}
                    className="rounded-2xl p-3 gap-2.5">
                    <View className="flex-row items-center gap-3">
                      {/* Dish Thumbnail */}
                      <View className="h-14 w-14 overflow-hidden rounded-xl bg-canvas dark:bg-canvas-dark">
                        {dish.recipeImageUrl ? (
                          <Image
                            source={{ uri: dish.recipeImageUrl }}
                            className="h-full w-full"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="h-full w-full items-center justify-center">
                            <Ionicons
                              name="restaurant"
                              size={22}
                              color={brand}
                            />
                          </View>
                        )}
                      </View>

                      {/* Dish Title & Recipe Link */}
                      <View className="flex-1 justify-center">
                        <AppText
                          numberOfLines={1}
                          className="text-sm font-bold text-ink dark:text-ink-dark">
                          {dish.recipeTitle}
                        </AppText>
                        <View className="mt-1 flex-row items-center gap-1">
                          <Ionicons
                            name="checkmark-circle"
                            size={13}
                            color="#10B981"
                          />
                          <AppText className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                            Đã liên kết Recipe
                          </AppText>
                        </View>
                      </View>

                      {/* Delete button */}
                      <Pressable
                        onPress={() => handleRemoveDish(idx)}
                        hitSlop={8}
                        className="h-8 w-8 items-center justify-center rounded-full bg-red-50 active:opacity-70 dark:bg-red-950/30">
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color="#EF4444"
                        />
                      </Pressable>
                    </View>

                    {/* Per-dish Servings adjustment */}
                    <View className="flex-row items-center justify-between border-t border-line/60 pt-2 dark:border-line-dark/60">
                      <AppText
                        variant="caption"
                        className="text-muted font-medium">
                        Khẩu phần món này:
                      </AppText>
                      <View className="flex-row items-center gap-2">
                        <Pressable
                          onPress={() => changeDishServings(idx, -1)}
                          className="h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface active:opacity-70 dark:border-line-dark dark:bg-surface-dark">
                          <Ionicons
                            name="remove"
                            size={14}
                            color={palette.ink}
                          />
                        </Pressable>
                        <AppText className="w-8 text-center text-xs font-bold text-ink dark:text-ink-dark">
                          {dish.servings}
                        </AppText>
                        <Pressable
                          onPress={() => changeDishServings(idx, 1)}
                          className="h-7 w-7 items-center justify-center rounded-lg border border-line bg-surface active:opacity-70 dark:border-line-dark dark:bg-surface-dark">
                          <Ionicons name="add" size={14} color={palette.ink} />
                        </Pressable>
                      </View>
                    </View>
                  </View>
                ))}

                {/* Button to add more dishes */}
                <Pressable
                  onPress={() => setPickerVisible(true)}
                  className="mt-1 flex-row items-center justify-center gap-1.5 rounded-xl border border-line bg-surface py-2.5 active:opacity-70 dark:border-line-dark dark:bg-surface-dark">
                  <Ionicons name="add-circle-outline" size={17} color={brand} />
                  <AppText className="text-xs font-bold text-brand">
                    Chọn thêm món khác từ kho công thức
                  </AppText>
                </Pressable>
              </View>
            ) : (
              // Empty State - Select recipe required
              <Pressable
                onPress={() => setPickerVisible(true)}
                className="flex-row items-center justify-between rounded-2xl border border-dashed border-brand/60 bg-brandSoft/40 p-4 active:opacity-80 dark:bg-surface-dark">
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-xl bg-brand">
                    <Ionicons name="restaurant" size={20} color="#fff" />
                  </View>
                  <View className="flex-1 pr-2">
                    <AppText className="text-sm font-bold text-ink dark:text-ink-dark">
                      Chọn các món từ kho công thức
                    </AppText>
                    <AppText variant="caption" className="text-muted">
                      Hỗ trợ chọn nhiều món cùng lúc cho bữa ăn này
                    </AppText>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={brand} />
              </Pressable>
            )}
          </Card>

          {/* 5. Submit Button */}
          <TactileButton
            title={
              isSaving
                ? `Đang lưu ${selectedDishes.length} món vào thực đơn...`
                : selectedDishes.length > 1
                  ? `Lưu ${selectedDishes.length} món vào thực đơn`
                  : selectedDishes.length === 1
                    ? "Lưu 1 món vào thực đơn"
                    : "Chọn món ăn để tiếp tục"
            }
            onPress={handleSubmit}
            disabled={isSaving || selectedDishes.length === 0}
          />
        </ScrollView>

        {/* Recipe Picker Modal (Hỗ trợ multi-select) */}
        <RecipePickerModal
          visible={pickerVisible}
          onClose={() => setPickerVisible(false)}
          multiSelect
          initialSelectedRecipes={initialSelectedRecipes}
          onSelectRecipes={handleSelectRecipes}
        />
      </Screen>
    </View>
  );
}
