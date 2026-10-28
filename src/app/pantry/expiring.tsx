import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Screen } from '@/components/ui/Screen';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { usePantry } from '@/features/pantry/usePantry';

const DAY_OPTIONS = [
  { label: '1 ngày tới', days: 1 },
  { label: '3 ngày tới', days: 3 },
  { label: '7 ngày tới', days: 7 },
];

const TONE_MAP = {
  fresh: 'success',
  soon: 'warn',
  expired: 'danger',
} as const;

export default function PantryExpiringScreen() {
  const router = useRouter();
  const { brand, palette } = useAppTheme();
  const { expiringItems, isLoading, loadExpiring, consume, remove } = usePantry();

  const [selectedDays, setSelectedDays] = useState(3);

  useEffect(() => {
    loadExpiring(selectedDays).catch(() => {});
  }, [selectedDays, loadExpiring]);

  const handleQuickConsume = (item: (typeof expiringItems)[number]) => {
    Alert.prompt
      ? Alert.prompt(
          'Dùng bớt nguyên liệu',
          `Nhập số lượng bạn muốn dùng (hiện có: ${item.quantity} ${item.unit}):`,
          [
            { text: 'Huỷ', style: 'cancel' },
            {
              text: 'Dùng',
              onPress: async (val) => {
                const qty = parseFloat(val || '1');
                if (isNaN(qty) || qty <= 0) return;
                try {
                  await consume(item.id, qty);
                  await loadExpiring(selectedDays);
                  Alert.alert('Thành công', `Đã dùng ${qty} ${item.unit}`);
                } catch {
                  Alert.alert('Lỗi', 'Không thể dùng bớt');
                }
              },
            },
          ],
          'plain-text',
          '1',
        )
      : Alert.alert('Dùng hết món này?', `Bạn có muốn đánh dấu dùng hết ${item.ingredientName}?`, [
          { text: 'Huỷ', style: 'cancel' },
          {
            text: 'Dùng hết',
            onPress: async () => {
              try {
                await consume(item.id, item.quantity);
                await loadExpiring(selectedDays);
              } catch {
                Alert.alert('Lỗi', 'Không thể thao tác');
              }
            },
          },
        ]);
  };

  const handleQuickRemove = (id: string) => {
    Alert.alert('Xoá khỏi tủ', 'Bạn có chắc chắn muốn bỏ nguyên liệu đã hết hạn này?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Bỏ đi',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove(id);
            await loadExpiring(selectedDays);
          } catch {
            Alert.alert('Lỗi', 'Không thể xoá');
          }
        },
      },
    ]);
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
              <AppText variant="title">Sắp hết hạn</AppText>
              <AppText variant="caption">Ưu tiên chế biến để tránh lãng phí</AppText>
            </View>
          </View>
          <View className="h-9 w-9 items-center justify-center rounded-2xl bg-warnBg shadow-sm dark:bg-warnBg-dark">
            <Ionicons name="hourglass-outline" size={20} color={palette.warnInk} />
          </View>
        </View>

        {/* Days Filter Chips */}
        <View className="flex-row gap-2 py-1">
          {DAY_OPTIONS.map((opt) => (
            <Chip
              key={opt.days}
              label={opt.label}
              selected={selectedDays === opt.days}
              onPress={() => setSelectedDays(opt.days)}
            />
          ))}
        </View>

        {/* 3D Content List */}
        {isLoading && expiringItems.length === 0 ? (
          <View className="items-center py-16">
            <ActivityIndicator size="large" color={brand} />
            <AppText variant="caption" className="mt-2">Đang quét nguyên liệu sắp hết hạn...</AppText>
          </View>
        ) : expiringItems.length === 0 ? (
          <Card className="items-center justify-center p-8 text-center shadow-sm">
            <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-successBg shadow-inner dark:bg-surface-dark">
              <Ionicons name="checkmark-done" size={32} color={palette.successInk} />
            </View>
            <AppText variant="heading" className="text-center">Tuyệt vời!</AppText>
            <AppText variant="caption" className="mt-1 text-center">
              Không có nguyên liệu nào sắp hết hạn trong {selectedDays} ngày tới.
            </AppText>
          </Card>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} className="gap-3 pb-12">
            {expiringItems.map((item) => (
              <Card key={item.id} className="p-4 shadow-sm">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View className="h-11 w-11 items-center justify-center rounded-2xl bg-warnBg shadow-inner dark:bg-warnBg-dark">
                      <Ionicons name="alarm-outline" size={22} color={palette.warnInk} />
                    </View>
                    <View>
                      <AppText variant="heading">{item.ingredientName}</AppText>
                      <AppText variant="caption">
                        {Math.round(item.quantity)} {item.unit} · HSD: {item.expiryDate || 'N/A'}
                      </AppText>
                    </View>
                  </View>
                  <Badge
                    label={item.freshness.label}
                    tone={TONE_MAP[item.freshness.status]}
                  />
                </View>

                {/* Quick Action Buttons */}
                <View className="mt-3 flex-row gap-2 border-t border-line pt-3 dark:border-line-dark">
                  <Button
                    title="Dùng bớt"
                    variant="primary"
                    className="flex-1"
                    onPress={() => handleQuickConsume(item)}
                  />
                  <Button
                    title="Bỏ đi"
                    variant="outline"
                    className="flex-1"
                    onPress={() => handleQuickRemove(item.id)}
                  />
                </View>
              </Card>
            ))}
          </ScrollView>
        )}
      </Screen>
    </View>
  );
}
