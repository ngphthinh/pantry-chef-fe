import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { usePantry } from '@/features/pantry/usePantry';
import type { PantryItemCreateRequest, StorageLocation, Unit } from '@/types';

interface ScannedReviewItem {
  id: string;
  name: string;
  confidence: number;
  quantity: number;
  unit: Unit;
  location: StorageLocation;
  expiryDate?: string;
}

export default function PantryScanReviewScreen() {
  const router = useRouter();
  const { brand, palette } = useAppTheme();
  const { createBatch, isSaving } = usePantry();
  const params = useLocalSearchParams<{ items?: string }>();

  const [items, setItems] = useState<ScannedReviewItem[]>(() => {
    if (params.items) {
      try {
        return JSON.parse(params.items) as ScannedReviewItem[];
      } catch {
        return [];
      }
    }
    return [];
  });

  const updateItemQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSaveBatch = async () => {
    if (items.length === 0) {
      Alert.alert('Thông báo', 'Không có nguyên liệu nào để lưu');
      return;
    }

    try {
      const batchPayload: PantryItemCreateRequest[] = items.map((i) => ({
        ingredientId: i.id, // hoặc map theo id nguyên liệu
        quantity: i.quantity,
        unit: i.unit,
        location: i.location,
        expiryDate: i.expiryDate,
      }));

      await createBatch({ items: batchPayload });
      Alert.alert('Thành công', `Đã lưu ${items.length} món vào tủ!`, [
        { text: 'Về tủ đồ', onPress: () => router.push('/(tabs)/pantry') },
      ]);
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu danh sách nguyên liệu. Vui lòng thử lại.');
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
              <AppText variant="title">Kiểm tra quét AI</AppText>
              <AppText variant="caption">AI nhận diện {items.length} nguyên liệu</AppText>
            </View>
          </View>
          <Badge label="AI Smart" tone="success" />
        </View>

        {/* 3D Visual Info Banner */}
        <Card className="flex-row items-center gap-3 bg-brandSoft/50 p-4 shadow-sm dark:bg-surface-dark">
          <Ionicons name="sparkles" size={24} color={brand} />
          <AppText variant="caption" className="flex-1 font-medium text-brand">
            Bạn có thể chỉnh sửa số lượng hoặc loại bỏ các món nhận diện chưa chính xác trước khi lưu.
          </AppText>
        </Card>

        {/* List of Scanned Items */}
        <ScrollView showsVerticalScrollIndicator={false} className="gap-3 pb-8">
          {items.map((item) => (
            <Card key={item.id} className="p-4 shadow-sm">
              <View className="flex-row items-start justify-between">
                <View>
                  <AppText variant="heading">{item.name}</AppText>
                  <View className="mt-1 flex-row items-center gap-2">
                    <AppText variant="caption">Độ tin cậy:</AppText>
                    <Badge
                      label={`${Math.round(item.confidence * 100)}%`}
                      tone="success"
                    />
                  </View>
                </View>

                <Pressable
                  onPress={() => removeItem(item.id)}
                  className="h-8 w-8 items-center justify-center rounded-full bg-dangerBg dark:bg-dangerBg-dark"
                >
                  <Ionicons name="trash-outline" size={16} color={palette.dangerInk} />
                </Pressable>
              </View>

              {/* Quantity Stepper & Location */}
              <View className="mt-4 flex-row items-center justify-between border-t border-line pt-3 dark:border-line-dark">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="cube-outline" size={16} color={palette.muted} />
                  <AppText variant="caption">
                    {item.location === 'FREEZER' ? 'Tủ đông' : 'Tủ mát'}
                  </AppText>
                </View>

                {/* 3D Stepper */}
                <View className="flex-row items-center gap-2 rounded-2xl bg-soft p-1 dark:bg-soft-dark">
                  <Pressable
                    onPress={() => updateItemQty(item.id, -1)}
                    className="h-7 w-7 items-center justify-center rounded-xl bg-white shadow-xs dark:bg-surface-dark active:scale-95"
                  >
                    <Ionicons name="remove" size={16} color={palette.ink} />
                  </Pressable>
                  <AppText className="w-12 text-center font-bold">
                    {item.quantity} {item.unit}
                  </AppText>
                  <Pressable
                    onPress={() => updateItemQty(item.id, 1)}
                    className="h-7 w-7 items-center justify-center rounded-xl bg-white shadow-xs dark:bg-surface-dark active:scale-95"
                  >
                    <Ionicons name="add" size={16} color={palette.ink} />
                  </Pressable>
                </View>
              </View>
            </Card>
          ))}

          {items.length === 0 && (
            <Card className="items-center p-8">
              <AppText variant="caption">Không có món nào trong danh sách</AppText>
            </Card>
          )}

          {/* Submit Batch Button */}
          <Button
            title={isSaving ? 'Đang lưu vào tủ...' : `Lưu tất cả (${items.length} món)`}
            onPress={handleSaveBatch}
            variant="primary"
            disabled={isSaving || items.length === 0}
            className="mt-3"
          />
        </ScrollView>
      </Screen>
    </View>
  );
}
