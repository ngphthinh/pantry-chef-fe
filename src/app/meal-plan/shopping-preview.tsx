import React, { useEffect } from 'react';
import {
  ActivityIndicator,
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
import { Screen } from '@/components/ui/Screen';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { showAlert } from '@/components/ui/dialogs';
import { useMealPlan } from '@/features/mealplan/useMealPlan';
import { useShopping } from '@/features/shopping/useShopping';
import type { ShoppingItemResponse } from '@/types';

export default function MealPlanShoppingPreviewScreen() {
  const router = useRouter();
  const { brand, palette } = useAppTheme();
  const { currentPlan, shoppingPreview, isLoading, loadShoppingList } = useMealPlan();

  const { createFromMealPlan, isSaving: savingList } = useShopping();

  useEffect(() => {
    if (currentPlan?.id) {
      loadShoppingList().catch(() => {});
    }
  }, [currentPlan?.id, loadShoppingList]);

  const handleSaveToShoppingList = async () => {
    if (!currentPlan?.id) return;
    if (shoppingPreview.length === 0) {
      showAlert('Thông báo', 'Không có nguyên liệu nào để tạo danh sách mua');
      return;
    }

    const result = await createFromMealPlan(currentPlan.id);
    if (!result.ok) {
      showAlert('Chưa tạo được danh sách', result.message);
      return;
    }
    // Mở thẳng danh sách vừa tạo: vừa xác nhận đã lưu, vừa chạy được cả trên web (nơi Alert.alert không hiện).
    router.replace(`/shopping/${result.data.id}`);
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
              <AppText variant="title">Nguyên liệu cần mua</AppText>
              <AppText variant="caption">
                Tính toán tự động từ các bữa ăn trong tuần
              </AppText>
            </View>
          </View>
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brandSoft dark:bg-surface-dark">
            <Ionicons name="cart-outline" size={20} color={brand} />
          </View>
        </View>

        {/* 3D Summary Card */}
        <Card className="flex-row items-center justify-between bg-brandSoft/40 p-4 shadow-sm dark:bg-surface-dark">
          <View className="flex-row items-center gap-3">
            <Ionicons name="calculator-outline" size={24} color={brand} />
            <View>
              <AppText className="font-bold text-brand">
                {shoppingPreview.length} nguyên liệu cần thiết
              </AppText>
              <AppText variant="caption">
                Đã đối soát với các món trong tủ
              </AppText>
            </View>
          </View>
          <Badge label="Tự động" tone="success" />
        </Card>

        {/* List of Ingredients */}
        {isLoading && shoppingPreview.length === 0 ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color={brand} />
            <AppText variant="caption" className="mt-2">Đang tính toán nguyên liệu...</AppText>
          </View>
        ) : shoppingPreview.length === 0 ? (
          <Card className="items-center justify-center p-8 text-center shadow-sm">
            <Ionicons name="bag-check-outline" size={40} color={brand} />
            <AppText variant="heading" className="mt-2 text-center">Đủ nguyên liệu!</AppText>
            <AppText variant="caption" className="mt-1 text-center">
              Tủ lạnh của bạn đã có đủ nguyên liệu cho các bữa ăn tuần này, không cần mua thêm.
            </AppText>
          </Card>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} className="gap-3 pb-8">
            {shoppingPreview.map((item) => (
              <Card key={item.id} className="flex-row items-center justify-between p-4 shadow-sm">
                <View className="flex-row items-center gap-3.5">
                  <View className="h-10 w-10 items-center justify-center rounded-2xl bg-soft shadow-inner dark:bg-soft-dark">
                    <Ionicons name="basket-outline" size={20} color={brand} />
                  </View>
                  <View>
                    <AppText variant="heading" className="text-base font-semibold">
                      {item.name}
                    </AppText>
                    <AppText variant="caption" className="mt-0.5">
                      Cần: {item.quantity ? `${item.quantity} ${item.unit || ''}` : 'Vừa đủ'}
                    </AppText>
                  </View>
                </View>

                <Badge label="Cần mua" tone="warn" />
              </Card>
            ))}

            {/* Save as Shopping List CTA Button */}
            <Button
              title={
                savingList
                  ? 'Đang tạo danh sách mua...'
                  : 'Lưu thành danh sách mua sắm'
              }
              onPress={handleSaveToShoppingList}
              variant="primary"
              disabled={savingList || shoppingPreview.length === 0}
              className="mt-3"
            />
          </ScrollView>
        )}
      </Screen>
    </View>
  );
}
