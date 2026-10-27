import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { recipeService } from '@/core/di/container';
import { useAppTheme } from '@/core/theme/useAppTheme';
import type { RecipeSummaryResponse } from '@/types';

type TabMode = 'suggestions' | 'popular' | 'random' | 'search' | 'custom';

interface RecipePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectRecipe: (recipe: RecipeSummaryResponse) => void;
  selectedRecipeId?: string;
}

export function RecipePickerModal({
  visible,
  onClose,
  onSelectRecipe,
  selectedRecipeId,
}: RecipePickerModalProps) {
  const { palette, brand } = useAppTheme();
  const [activeTab, setActiveTab] = useState<TabMode>('suggestions');
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<RecipeSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecipes = useCallback(
    async (mode: TabMode, queryText?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        let results: RecipeSummaryResponse[] = [];
        if (mode === 'suggestions') {
          const res = await recipeService.suggestions({ size: 20 });
          results = res.content || [];
        } else if (mode === 'popular') {
          const res = await recipeService.getPopular({ size: 20 });
          results = res.content || [];
        } else if (mode === 'random') {
          results = await recipeService.getRandom(8);
        } else if (mode === 'custom') {
          const res = await recipeService.getCustomList({ size: 20 });
          results = res.content || [];
        } else if (mode === 'search') {
          const q = (queryText ?? searchQuery).trim();
          if (q) {
            const res = await recipeService.getByName({ q, size: 20 });
            results = res.content || [];
          } else {
            // Nếu chưa nhập tìm kiếm, mặc định lấy phổ biến
            const res = await recipeService.getPopular({ size: 20 });
            results = res.content || [];
          }
        }
        setRecipes(results);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Không thể tải danh sách công thức';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [searchQuery],
  );

  useEffect(() => {
    if (visible) {
      loadRecipes(activeTab);
    }
  }, [visible, activeTab, loadRecipes]);

  const handleTabChange = (tab: TabMode) => {
    setActiveTab(tab);
    loadRecipes(tab);
  };

  const handleSearchSubmit = () => {
    setActiveTab('search');
    loadRecipes('search', searchQuery);
  };

  const getDifficultyLabel = (diff?: string | null) => {
    switch (diff) {
      case 'EASY':
        return { label: 'Dễ', tone: 'success' as const };
      case 'MEDIUM':
        return { label: 'Vừa', tone: 'warn' as const };
      case 'HARD':
        return { label: 'Khó', tone: 'danger' as const };
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-canvas dark:bg-canvas-dark">
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-line px-5 py-4 dark:border-line-dark">
          <View>
            <AppText variant="title" className="text-xl font-bold">
              Chọn công thức
            </AppText>
            <AppText variant="caption" className="text-muted">
              Kết nối trực tiếp với thực đơn bữa ăn
            </AppText>
          </View>
          <Pressable
            onPress={onClose}
            className="h-9 w-9 items-center justify-center rounded-full bg-soft active:opacity-70 dark:bg-surface-dark"
          >
            <Ionicons name="close" size={20} color={palette.ink} />
          </Pressable>
        </View>

        {/* Search Bar */}
        <View className="px-5 pt-3 pb-2">
          <View className="flex-row items-center rounded-2xl border border-line bg-surface px-3.5 py-1.5 dark:border-line-dark dark:bg-surface-dark">
            <Ionicons name="search" size={20} color={palette.muted} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
              placeholder="Tìm món ăn (vd: Phở bò, Canh chua...)"
              placeholderTextColor={palette.muted}
              className="flex-1 px-2.5 py-2 text-sm text-ink dark:text-ink-dark"
            />
            {searchQuery ? (
              <Pressable
                onPress={() => {
                  setSearchQuery('');
                  if (activeTab === 'search') {
                    loadRecipes('popular');
                    setActiveTab('popular');
                  }
                }}
                className="p-1"
              >
                <Ionicons name="close-circle" size={18} color={palette.muted} />
              </Pressable>
            ) : null}
            <Pressable
              onPress={handleSearchSubmit}
              className="ml-1 rounded-xl bg-brand px-3 py-1.5 active:opacity-80"
            >
              <AppText className="text-xs font-bold text-white">Tìm</AppText>
            </Pressable>
          </View>
        </View>

        {/* Category Tabs */}
        <View className="flex-row gap-2 px-5 py-2">
          <Pressable
            onPress={() => handleTabChange('suggestions')}
            className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${
              activeTab === 'suggestions'
                ? 'bg-brand'
                : 'bg-soft dark:bg-surface-dark'
            }`}
          >
            <Ionicons
              name="sparkles"
              size={14}
              color={activeTab === 'suggestions' ? '#fff' : palette.muted}
            />
            <AppText
              className={`text-xs font-semibold ${
                activeTab === 'suggestions' ? 'text-white' : 'text-muted'
              }`}
            >
              Gợi ý từ tủ
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => handleTabChange('popular')}
            className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${
              activeTab === 'popular'
                ? 'bg-brand'
                : 'bg-soft dark:bg-surface-dark'
            }`}
          >
            <Ionicons
              name="flame"
              size={14}
              color={activeTab === 'popular' ? '#fff' : palette.muted}
            />
            <AppText
              className={`text-xs font-semibold ${
                activeTab === 'popular' ? 'text-white' : 'text-muted'
              }`}
            >
              Phổ biến
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => handleTabChange('random')}
            className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${
              activeTab === 'random'
                ? 'bg-brand'
                : 'bg-soft dark:bg-surface-dark'
            }`}
          >
            <Ionicons
              name="dice-outline"
              size={14}
              color={activeTab === 'random' ? '#fff' : palette.muted}
            />
            <AppText
              className={`text-xs font-semibold ${
                activeTab === 'random' ? 'text-white' : 'text-muted'
              }`}
            >
              Ngẫu nhiên
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => handleTabChange('custom')}
            className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${
              activeTab === 'custom'
                ? 'bg-brand'
                : 'bg-soft dark:bg-surface-dark'
            }`}
          >
            <Ionicons
              name="book-outline"
              size={14}
              color={activeTab === 'custom' ? '#fff' : palette.muted}
            />
            <AppText
              className={`text-xs font-semibold ${
                activeTab === 'custom' ? 'text-white' : 'text-muted'
              }`}
            >
              Tự tạo
            </AppText>
          </Pressable>
        </View>

        {/* Content List */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center p-8">
            <ActivityIndicator size="large" color={brand} />
            <AppText className="mt-3 text-sm text-muted">Đang tải danh sách món ăn...</AppText>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center p-8 text-center">
            <Ionicons name="alert-circle-outline" size={44} color="#EF4444" />
            <AppText className="mt-2 text-center text-sm font-semibold text-danger">
              {error}
            </AppText>
            <Pressable
              onPress={() => loadRecipes(activeTab)}
              className="mt-4 rounded-xl bg-brand px-4 py-2"
            >
              <AppText className="text-xs font-bold text-white">Thử lại</AppText>
            </Pressable>
          </View>
        ) : recipes.length === 0 ? (
          <View className="flex-1 items-center justify-center p-8">
            <Ionicons name="restaurant-outline" size={48} color={palette.muted} />
            <AppText className="mt-3 text-center text-base font-bold">
              Không tìm thấy công thức nào
            </AppText>
            <AppText variant="caption" className="mt-1 text-center text-muted">
              Hãy thử tìm kiếm với từ khoá khác hoặc chọn tab gợi ý khác.
            </AppText>
          </View>
        ) : (
          <FlatList
            data={recipes}
            keyExtractor={(item, idx) => item.id || item.externalId || `recipe-${idx}`}
            contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
            renderItem={({ item }) => {
              const isSelected = selectedRecipeId && item.id === selectedRecipeId;
              const diffBadge = getDifficultyLabel(item.difficulty);

              return (
                <Pressable
                  onPress={() => {
                    onSelectRecipe(item);
                    onClose();
                  }}
                  className="active:opacity-85"
                >
                  <Card
                    className={`flex-row overflow-hidden p-3 transition-all ${
                      isSelected
                        ? 'border-2 border-brand bg-brandSoft dark:bg-surface-dark'
                        : 'border border-line dark:border-line-dark'
                    }`}
                  >
                    {/* Thumbnail */}
                    <View className="h-20 w-20 overflow-hidden rounded-xl bg-soft dark:bg-canvas-dark">
                      {item.imageUrl ? (
                        <Image
                          source={{ uri: item.imageUrl }}
                          className="h-full w-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="h-full w-full items-center justify-center">
                          <Ionicons name="restaurant" size={28} color={palette.muted} />
                        </View>
                      )}
                    </View>

                    {/* Info */}
                    <View className="ml-3 flex-1 justify-between py-0.5">
                      <View>
                        <View className="flex-row items-center justify-between gap-1">
                          <AppText
                            numberOfLines={1}
                            className="flex-1 text-base font-bold text-ink dark:text-ink-dark"
                          >
                            {item.title}
                          </AppText>
                          {isSelected && (
                            <View className="rounded-full bg-brand/15 px-2.5 py-0.5">
                              <AppText className="text-xs font-bold text-brand">Đang chọn</AppText>
                            </View>
                          )}
                        </View>

                        {/* Meta Tags */}
                        <View className="mt-1 flex-row flex-wrap items-center gap-2">
                          {item.readyInMinutes ? (
                            <View className="flex-row items-center gap-1">
                              <Ionicons name="time-outline" size={12} color={palette.muted} />
                              <AppText variant="caption" className="text-xs text-muted">
                                {item.readyInMinutes}p
                              </AppText>
                            </View>
                          ) : null}

                          {item.servings ? (
                            <View className="flex-row items-center gap-1">
                              <Ionicons name="people-outline" size={12} color={palette.muted} />
                              <AppText variant="caption" className="text-xs text-muted">
                                {item.servings} phần
                              </AppText>
                            </View>
                          ) : null}

                          {diffBadge ? (
                            <Badge label={diffBadge.label} tone={diffBadge.tone} />
                          ) : null}

                          {item.custom ? (
                            <View className="rounded-full bg-soft px-2 py-0.5 dark:bg-canvas-dark">
                              <AppText className="text-xs font-semibold text-muted">Tự tạo</AppText>
                            </View>
                          ) : null}
                        </View>
                      </View>

                      {/* Match score from pantry if available */}
                      {item.matchScore !== null && item.matchScore !== undefined ? (
                        <View className="mt-1 flex-row items-center gap-1.5">
                          <Ionicons name="checkmark-circle" size={13} color="#10B981" />
                          <AppText className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {Math.round(item.matchScore * 100)}% nguyên liệu có sẵn
                          </AppText>
                        </View>
                      ) : null}
                    </View>
                  </Card>
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}
