import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Share,
  Vibration,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { useAdaptedRecipe } from "@/features/ai/useAdaptedRecipe";
import { useAppSelector } from "@/store/hooks";

const ALARM_PATTERN = [0, 500, 300, 500, 300, 500];

export default function AdaptedRecipeScreen() {
  const router = useRouter();
  const { palette, brand } = useAppTheme();
  const { recipeId } = useLocalSearchParams<{ recipeId?: string }>();
  const { view, isLoading, error, hasRecipeId, retry } =
    useAdaptedRecipe(recipeId);
  const rawRecipe = useAppSelector((s) => s.ai.adaptedRecipe);

  // Trạng thái tick chọn nguyên liệu đã chuẩn bị
  const [checkedIngredients, setCheckedIngredients] = useState<
    Record<string, boolean>
  >({});

  // Trạng thái hoàn thành từng bước nấu
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>(
    {},
  );

  // Bộ đếm giờ cho từng bước trực tiếp trong màn hình
  const [activeTimerStep, setActiveTimerStep] = useState<number | null>(null);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  const [timerRunning, setTimerRunning] = useState(false);

  // Quản lý đếm giờ
  useEffect(() => {
    if (!timerRunning || timerRemaining === null) return;
    if (timerRemaining <= 0) {
      setTimerRunning(false);
      Vibration.vibrate(ALARM_PATTERN);
      Alert.alert("⏰ Hết giờ!", `Bước ${activeTimerStep} đã hoàn thành thời gian hẹn giờ.`);
      return;
    }

    const timer = setInterval(() => {
      setTimerRemaining((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTimerStep, timerRemaining, timerRunning]);

  const toggleIngredient = (key: string) => {
    setCheckedIngredients((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleStep = (stepOrder: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepOrder]: !prev[stepOrder],
    }));
  };

  const startStepTimer = (stepOrder: number, seconds: number) => {
    setActiveTimerStep(stepOrder);
    setTimerRemaining(seconds);
    setTimerRunning(true);
  };

  const stopStepTimer = () => {
    setTimerRunning(false);
  };

  const formatCountdown = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Chia sẻ hoặc sao chép nhanh công thức
  const handleShare = async () => {
    if (!view) return;
    try {
      const ingredientList = view.ingredients.map((i) => `• ${i.text}`).join("\n");
      const stepList = view.steps
        .map((s) => `${s.order}. ${s.text}${s.timerLabel ? ` (${s.timerLabel})` : ""}`)
        .join("\n");

      const message = `🌿 CÔNG THỨC ĐIỀU CHỈNH: ${view.title}\n${view.metaLabel}\n\n🥗 NGUYÊN LIỆU ĐÃ ĐIỀU CHỈNH:\n${ingredientList}\n\n👨‍🍳 CÁCH LÀM:\n${stepList}\n\n(Tạo bởi Pantry Chef AI Assistant)`;

      await Share.share({ message, title: view.title });
    } catch {
      // ignore
    }
  };

  const preparedCount = useMemo(() => {
    if (!view) return 0;
    return view.ingredients.filter((i) => checkedIngredients[i.key]).length;
  }, [checkedIngredients, view]);

  const finishedStepsCount = useMemo(() => {
    if (!view) return 0;
    return view.steps.filter((s) => completedSteps[s.order]).length;
  }, [completedSteps, view]);

  return (
    <Screen>
      <View className="gap-5 pb-16">
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3 flex-1">
            <Pressable
              onPress={() => router.back()}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Quay lại"
              className="h-10 w-10 items-center justify-center rounded-full bg-soft active:scale-90 dark:bg-surface-dark">
              <Ionicons name="arrow-back" size={20} color={palette.ink} />
            </Pressable>
            <View className="flex-1">
              <AppText variant="title">Công thức điều chỉnh</AppText>
              <AppText variant="caption">
                AI tối ưu hóa theo nguyên liệu bạn kiêng / dị ứng
              </AppText>
            </View>
          </View>

          {view ? (
            <Pressable
              onPress={handleShare}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Chia sẻ công thức"
              className="h-10 w-10 items-center justify-center rounded-full bg-brandSoft active:scale-90 dark:bg-surface-dark">
              <Ionicons name="share-social-outline" size={20} color={brand} />
            </Pressable>
          ) : null}
        </View>

        {/* Loading state */}
        {isLoading ? (
          <Card className="items-center gap-4 p-8 shadow-sm">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-brandSoft dark:bg-soft-dark">
              <ActivityIndicator size="large" color={brand} />
            </View>
            <AppText variant="heading" className="text-center text-lg">
              Đang điều chỉnh công thức...
            </AppText>
            <AppText variant="caption" className="text-center leading-5 px-2">
              AI đang rà soát hồ sơ dị ứng và kiêng khem của bạn để lọc bỏ nguyên liệu không phù hợp, đồng thời tự động cân bằng lại gia vị và các bước nấu.
            </AppText>
          </Card>
        ) : null}

        {/* Missing recipeId */}
        {!isLoading && !hasRecipeId ? (
          <Card className="items-center gap-3 p-6 shadow-sm">
            <Ionicons name="alert-circle" size={36} color={palette.warnInk} />
            <AppText variant="heading" className="text-center">
              Thiếu thông tin công thức
            </AppText>
            <AppText variant="caption" className="text-center">
              Vui lòng mở chức năng này từ màn hình chi tiết của một công thức.
            </AppText>
            <Button
              title="Quay lại"
              variant="outline"
              onPress={() => router.back()}
            />
          </Card>
        ) : null}

        {/* Error state */}
        {!isLoading && error ? (
          <Card className="items-center gap-3 p-6 shadow-sm">
            <Ionicons name="alert-circle" size={36} color={palette.dangerInk} />
            <AppText
              variant="heading"
              className="text-center text-dangerInk dark:text-dangerInk-dark">
              Không thể điều chỉnh công thức
            </AppText>
            <AppText variant="caption" className="text-center">
              {error}
            </AppText>
            <Button title="Thử lại" variant="outline" onPress={retry} />
          </Card>
        ) : null}

        {/* Content */}
        {!isLoading && view ? (
          <>
            {/* Hero image */}
            {rawRecipe?.imageUrl ? (
              <Image
                source={{ uri: rawRecipe.imageUrl }}
                className="h-56 w-full rounded-3xl bg-soft dark:bg-soft-dark"
                resizeMode="cover"
              />
            ) : null}

            {/* Title & Tags */}
            <View className="gap-2">
              <AppText variant="title" className="text-2xl font-bold">
                {view.title}
              </AppText>
              {view.metaLabel ? (
                <AppText variant="caption" className="font-medium text-muted">
                  {view.metaLabel}
                </AppText>
              ) : null}
            </View>

            {/* AI Personalization Highlight Card */}
            <Card className="border border-brand/30 bg-brandSoft/50 p-4 shadow-sm dark:border-brand/40 dark:bg-surface-dark">
              <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brand">
                  <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                </View>
                <View className="flex-1">
                  <AppText variant="heading" className="text-base font-bold text-brand">
                    Đã cá nhân hóa bằng AI
                  </AppText>
                  <AppText variant="caption">
                    Đã loại trừ nguyên liệu dị ứng/kiêng và điều chỉnh cách nấu phù hợp.
                  </AppText>
                </View>
              </View>
            </Card>

            {/* Quick Metrics Bar */}
            <View className="flex-row gap-3">
              <Card className="flex-1 items-center gap-1 p-3">
                <Ionicons name="people-outline" size={18} color={brand} />
                <AppText className="text-xs font-bold">
                  {rawRecipe?.servings ? `${rawRecipe.servings} người` : "Tiêu chuẩn"}
                </AppText>
                <AppText variant="caption" className="text-[10px]">Khẩu phần</AppText>
              </Card>

              <Card className="flex-1 items-center gap-1 p-3">
                <Ionicons name="time-outline" size={18} color={brand} />
                <AppText className="text-xs font-bold">
                  {rawRecipe?.readyInMinutes ? `${rawRecipe.readyInMinutes} phút` : "30 phút"}
                </AppText>
                <AppText variant="caption" className="text-[10px]">Thời gian</AppText>
              </Card>

              <Card className="flex-1 items-center gap-1 p-3">
                <Ionicons name="speedometer-outline" size={18} color={brand} />
                <AppText className="text-xs font-bold">
                  {rawRecipe?.difficulty ? String(rawRecipe.difficulty) : "Vừa"}
                </AppText>
                <AppText variant="caption" className="text-[10px]">Độ khó</AppText>
              </Card>
            </View>

            {/* Ingredients with Checklist */}
            <View className="gap-2.5">
              <View className="flex-row items-center justify-between px-1">
                <View className="flex-row items-center gap-2">
                  <View className="h-8 w-8 items-center justify-center rounded-xl bg-brandSoft dark:bg-surface-dark">
                    <Ionicons name="basket" size={16} color={brand} />
                  </View>
                  <AppText variant="heading" className="text-base">
                    Nguyên liệu đã điều chỉnh
                  </AppText>
                </View>

                {view.ingredients.length > 0 ? (
                  <View className="rounded-full bg-soft px-2.5 py-1 dark:bg-soft-dark">
                    <AppText variant="caption" className="font-semibold text-brand">
                      Đã có: {preparedCount}/{view.ingredients.length}
                    </AppText>
                  </View>
                ) : null}
              </View>

              <Card className="overflow-hidden shadow-sm">
                {view.ingredients.length === 0 ? (
                  <AppText variant="caption" className="p-4">
                    Chưa có dữ liệu nguyên liệu.
                  </AppText>
                ) : (
                  view.ingredients.map((ing, index) => {
                    const isChecked = Boolean(checkedIngredients[ing.key]);
                    return (
                      <Pressable
                        key={ing.key}
                        onPress={() => toggleIngredient(ing.key)}
                        className={`flex-row items-center justify-between gap-3 px-4 py-3.5 active:bg-soft/50 dark:active:bg-soft-dark/50 ${
                          index > 0 ? "border-t border-line dark:border-line-dark" : ""
                        }`}>
                        <View className="flex-row items-center gap-3 flex-1">
                          <Ionicons
                            name={isChecked ? "checkbox" : "square-outline"}
                            size={20}
                            color={isChecked ? palette.successInk : palette.muted}
                          />
                          <AppText
                            className={`flex-1 font-medium ${
                              isChecked
                                ? "text-muted line-through dark:text-muted-dark"
                                : ""
                            }`}>
                            {ing.text}
                          </AppText>
                        </View>

                        {isChecked ? (
                          <View className="rounded-full bg-successBg px-2 py-0.5 dark:bg-successBg-dark">
                            <AppText className="text-[10px] font-bold text-successInk dark:text-successInk-dark">
                              Đã chuẩn bị
                            </AppText>
                          </View>
                        ) : null}
                      </Pressable>
                    );
                  })
                )}
              </Card>
            </View>

            {/* Steps with Interactive Timer & Progress */}
            <View className="gap-2.5">
              <View className="flex-row items-center justify-between px-1">
                <View className="flex-row items-center gap-2">
                  <View className="h-8 w-8 items-center justify-center rounded-xl bg-brandSoft dark:bg-surface-dark">
                    <Ionicons name="restaurant" size={16} color={brand} />
                  </View>
                  <AppText variant="heading" className="text-base">
                    Cách thực hiện
                  </AppText>
                </View>

                {view.steps.length > 0 ? (
                  <View className="rounded-full bg-soft px-2.5 py-1 dark:bg-soft-dark">
                    <AppText variant="caption" className="font-semibold text-brand">
                      Tiến độ: {finishedStepsCount}/{view.steps.length}
                    </AppText>
                  </View>
                ) : null}
              </View>

              {view.steps.length === 0 ? (
                <Card className="p-4 shadow-sm">
                  <AppText variant="caption">Chưa có dữ liệu các bước.</AppText>
                </Card>
              ) : (
                view.steps.map((step) => {
                  const isDone = Boolean(completedSteps[step.order]);
                  const isTimerActive = activeTimerStep === step.order;
                  const rawStep = rawRecipe?.steps?.find(
                    (s) => (s.stepOrder ?? 0) === step.order,
                  );
                  const timerSeconds = rawStep?.timerSeconds ?? (step.timerLabel ? 900 : null);

                  return (
                    <Card
                      key={step.key}
                      className={`gap-3 p-4 shadow-sm ${
                        isDone ? "opacity-70 border border-successInk/30" : ""
                      }`}>
                      <View className="flex-row items-center justify-between">
                        <Pressable
                          onPress={() => toggleStep(step.order)}
                          className="flex-row items-center gap-2">
                          <View
                            className={`h-7 w-7 items-center justify-center rounded-full ${
                              isDone ? "bg-successBg" : "bg-brand"
                            }`}>
                            {isDone ? (
                              <Ionicons name="checkmark" size={16} color={palette.successInk} />
                            ) : (
                              <AppText className="text-xs font-bold text-white">
                                {step.order}
                              </AppText>
                            )}
                          </View>
                          <AppText className="font-bold text-sm">
                            Bước {step.order}
                          </AppText>
                        </Pressable>

                        <View className="flex-row items-center gap-2">
                          {isDone ? (
                            <Badge label="Hoàn thành" tone="success" />
                          ) : step.timerLabel ? (
                            <Badge label={step.timerLabel} tone="warn" />
                          ) : null}
                        </View>
                      </View>

                      <AppText className={`leading-5 ${isDone ? "text-muted dark:text-muted-dark" : ""}`}>
                        {step.text}
                      </AppText>

                      {/* In-Step Timer Control */}
                      {timerSeconds && !isDone ? (
                        <View className="border-t border-line/60 pt-3 dark:border-line-dark/60">
                          {isTimerActive && timerRunning ? (
                            <View className="flex-row items-center justify-between rounded-xl border border-warnInk/30 bg-warnBg/60 px-3 py-2 dark:border-warnInk-dark/30 dark:bg-warnBg-dark/40">
                              <View className="flex-row items-center gap-2">
                                <Ionicons
                                  name="timer"
                                  size={18}
                                  color={palette.warnInk}
                                />
                                <AppText className="text-sm font-extrabold text-warnInk dark:text-warnInk-dark">
                                  {formatCountdown(timerRemaining ?? 0)}
                                </AppText>
                              </View>
                              <View className="flex-row items-center gap-2">
                                <Pressable
                                  onPress={stopStepTimer}
                                  hitSlop={6}
                                  accessibilityRole="button"
                                  accessibilityLabel="Tạm dừng hẹn giờ"
                                  className="flex-row items-center gap-1 rounded-full border border-warnInk/40 bg-white px-2.5 py-1 active:scale-95 dark:bg-surface-dark">
                                  <Ionicons
                                    name="pause"
                                    size={12}
                                    color={palette.warnInk}
                                  />
                                  <AppText className="text-xs font-bold text-warnInk dark:text-warnInk-dark">
                                    Tạm dừng
                                  </AppText>
                                </Pressable>
                                <Pressable
                                  onPress={() => {
                                    setTimerRunning(false);
                                    setActiveTimerStep(null);
                                    setTimerRemaining(null);
                                  }}
                                  hitSlop={6}
                                  accessibilityRole="button"
                                  accessibilityLabel="Hủy đếm giờ"
                                  className="h-6 w-6 items-center justify-center rounded-full bg-soft active:scale-90 dark:bg-soft-dark">
                                  <Ionicons
                                    name="close"
                                    size={13}
                                    color={palette.muted}
                                  />
                                </Pressable>
                              </View>
                            </View>
                          ) : isTimerActive &&
                            !timerRunning &&
                            timerRemaining !== null &&
                            timerRemaining > 0 ? (
                            <View className="flex-row items-center justify-between rounded-xl border border-line bg-soft/70 px-3 py-2 dark:border-line-dark dark:bg-soft-dark/50">
                              <View className="flex-row items-center gap-2">
                                <Ionicons
                                  name="pause-circle-outline"
                                  size={18}
                                  color={palette.muted}
                                />
                                <AppText className="text-sm font-extrabold text-muted">
                                  {formatCountdown(timerRemaining)} (Tạm dừng)
                                </AppText>
                              </View>
                              <View className="flex-row items-center gap-2">
                                <Pressable
                                  onPress={() => setTimerRunning(true)}
                                  hitSlop={6}
                                  className="flex-row items-center gap-1 rounded-full bg-brand px-2.5 py-1 active:scale-95">
                                  <Ionicons
                                    name="play"
                                    size={12}
                                    color="#FFFFFF"
                                  />
                                  <AppText className="text-xs font-bold text-white">
                                    Tiếp tục
                                  </AppText>
                                </Pressable>
                                <Pressable
                                  onPress={() => {
                                    setTimerRunning(false);
                                    setActiveTimerStep(null);
                                    setTimerRemaining(null);
                                  }}
                                  hitSlop={6}
                                  className="h-6 w-6 items-center justify-center rounded-full bg-surface active:scale-90 dark:bg-surface-dark">
                                  <Ionicons
                                    name="close"
                                    size={13}
                                    color={palette.muted}
                                  />
                                </Pressable>
                              </View>
                            </View>
                          ) : (
                            <Pressable
                              onPress={() =>
                                startStepTimer(step.order, timerSeconds)
                              }
                              className="flex-row items-center gap-1.5 self-start rounded-full border border-brand/30 bg-brandSoft/60 px-3 py-1.5 active:scale-95 dark:border-brand/40 dark:bg-surface-dark">
                              <Ionicons
                                name="timer-outline"
                                size={14}
                                color={brand}
                              />
                              <AppText className="text-xs font-semibold text-brand">
                                Bắt đầu hẹn giờ ({Math.round(timerSeconds / 60)}{" "}
                                phút)
                              </AppText>
                            </Pressable>
                          )}
                        </View>
                      ) : null}
                    </Card>
                  );
                })
              )}
            </View>

            {/* Bottom Actions */}
            <View className="mt-3 gap-3">
              {rawRecipe?.id ? (
                <Button
                  title="Thêm vào thực đơn tuần"
                  variant="primary"
                  onPress={() =>
                    router.push({
                      pathname: "/meal-plan/add-entry",
                      params: {
                        id: rawRecipe.id,
                        title: view.title,
                        servings: String(rawRecipe.servings ?? 1),
                      },
                    })
                  }
                />
              ) : null}

              <Button
                title="Quay lại công thức gốc"
                variant="outline"
                onPress={() => router.back()}
              />
            </View>
          </>
        ) : null}
      </View>
    </Screen>
  );
}
