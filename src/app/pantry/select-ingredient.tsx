import React, { useEffect, useState } from 'react';
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
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { privateHttp } from '@/core/di/container';
import { useAppTheme } from '@/core/theme/useAppTheme';
import type { CursorResponse, IngredientResponse } from '@/types';

export default function SelectIngredientScreen() {
  const router = useRouter();
  const { brand, palette } = useAppTheme();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<IngredientResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchIngredients = async () => {
      setIsLoading(true);
      try {
        const { data } = await privateHttp.get<CursorResponse<IngredientResponse>>(
          '/v1/ingredients/search',
          { params: { q: query.trim(), size: 30 } },
        );
        if (active) {
          setResults(data?.content ?? []);
        }
      } catch {
        if (active) {
          setResults([]);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchIngredients, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const handleSelect = (item: IngredientResponse) => {
    router.replace({
      pathname: '/pantry/new',
      params: {
        ingredientId: item.id,
        ingredientName: item.name,
        defaultUnit: item.defaultUnit || 'G',
      },
    });
  };

  const handleUseCustomName = () => {
    if (!query.trim()) return;
    router.replace({
      pathname: '/pantry/new',
      params: {
        ingredientId: 'custom',
        ingredientName: query.trim(),
        defaultUnit: 'G',
      },
    });
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
          <View>
            <AppText variant="title">Chọn nguyên liệu</AppText>
            <AppText variant="caption">Tìm từ danh mục chuẩn hóa của hệ thống</AppText>
          </View>
        </View>

        {/* Search Bar */}
        <Card className="p-3 shadow-sm">
          <View className="flex-row items-center gap-2">
            <Ionicons name="search" size={20} color={palette.muted} />
            <View className="flex-1">
              <TextField
                label="Tìm kiếm nguyên liệu"
                placeholder="Ví dụ: Thịt bò, Cà chua..."
                value={query}
                onChangeText={setQuery}
                autoFocus
              />
            </View>
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} className="p-1">
                <Ionicons name="close-circle" size={18} color={palette.muted} />
              </Pressable>
            )}
          </View>
        </Card>

        {/* Custom Name Quick Pick if searched */}
        {query.trim().length > 0 && (
          <Pressable onPress={handleUseCustomName} className="active:scale-[0.99]">
            <Card className="flex-row items-center justify-between border border-brand/30 bg-brandSoft/40 p-4 shadow-sm dark:bg-surface-dark">
              <View className="flex-row items-center gap-3">
                <Ionicons name="add-circle" size={22} color={brand} />
                <View>
                  <AppText className="font-bold text-brand">
                    Chọn tên: "{query.trim()}"
                  </AppText>
                  <AppText variant="caption">
                    Dùng tên này nếu không có trong danh mục
                  </AppText>
                </View>
              </View>
              <Ionicons name="arrow-forward" size={18} color={brand} />
            </Card>
          </Pressable>
        )}

        {/* Results List */}
        {isLoading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color={brand} />
            <AppText variant="caption" className="mt-2">Đang tìm kiếm...</AppText>
          </View>
        ) : results.length === 0 ? (
          <Card className="items-center justify-center p-8 text-center shadow-sm">
            <Ionicons name="search-outline" size={40} color={palette.muted} />
            <AppText variant="heading" className="mt-2 text-center">
              Không tìm thấy nguyên liệu
            </AppText>
            <AppText variant="caption" className="mt-1 text-center">
              Thử tìm kiếm với từ khoá khác hoặc nhấn vào nút thêm nhanh phía trên.
            </AppText>
          </Card>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} className="gap-2.5 pb-12">
            {results.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => handleSelect(item)}
                className="active:scale-[0.985]"
              >
                <Card className="flex-row items-center justify-between p-4 shadow-sm">
                  <View className="flex-row items-center gap-3.5">
                    <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brandSoft dark:bg-surface-dark">
                      <Ionicons name="nutrition-outline" size={20} color={brand} />
                    </View>
                    <View>
                      <AppText variant="heading" className="text-base font-semibold">
                        {item.name}
                      </AppText>
                      <AppText variant="caption" className="mt-0.5">
                        {item.category?.name || 'Nguyên liệu'} {item.defaultUnit ? `· Đơn vị: ${item.defaultUnit}` : ''}
                      </AppText>
                    </View>
                  </View>
                  <Badge label="Chọn" tone="success" />
                </Card>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </Screen>
    </View>
  );
}
