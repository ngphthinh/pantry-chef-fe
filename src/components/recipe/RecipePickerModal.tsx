import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { customRecipeService, recipeService } from "@/core/di/container";
import { useAppTheme } from "@/core/theme/useAppTheme";
import type { RecipeSummaryResponse } from "@/types";

type TabMode = "suggestions" | "random" | "search" | "custom";

interface RecipePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectRecipe?: (recipe: RecipeSummaryResponse) => void;
  onSelectRecipes?: (recipes: RecipeSummaryResponse[]) => void;
  selectedRecipeId?: string;
  selectedRecipeIds?: string[];
  initialSelectedRecipes?: RecipeSummaryResponse[];
  multiSelect?: boolean;
}

export function RecipePickerModal({
  visible,
  onClose,
  onSelectRecipe,
  onSelectRecipes,
  selectedRecipeId,
  selectedRecipeIds,
  initialSelectedRecipes,
  multiSelect,
}: RecipePickerModalProps) {
  const { palette, brand, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const isMulti = Boolean(multiSelect || onSelectRecipes);
  const [selectedMap, setSelectedMap] = useState<Map<string, RecipeSummaryResponse>>(new Map());
  const [activeTab, setActiveTab] = useState<TabMode>("suggestions");
  const [recipes, setRecipes] = useState<RecipeSummaryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // nội dung đang gõ
  const [submittedQuery, setSubmittedQuery] = useState(""); // nội dung đã bấm Tìm
  const requestId = useRef(0);

  const loadRecipes = useCallback(async (mode: TabMode, queryText: string) => {
    const myId = ++requestId.current;
    setIsLoading(true);
    setError(null);
    try {
      let results: RecipeSummaryResponse[] = [];
      if (mode === "suggestions") {
        results = (await recipeService.suggestions({ size: 20 })).content || [];
      } else if (mode === "random") {
        results = await recipeService.random(8);
      } else if (mode === "custom") {
        results =
          (await customRecipeService.getRecipes({ size: 20 })).content || [];
      } else if (mode === "search") {
        results = queryText
          ? (await recipeService.byName({ q: queryText, size: 20 })).content ||
            []
          : (await recipeService.suggestions({ size: 20 })).content || [];
      }
      if (myId === requestId.current) setRecipes(results); // bỏ kết quả cũ về muộn
    } catch (err: unknown) {
      if (myId === requestId.current) {
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách công thức",
        );
      }
    } finally {
      if (myId === requestId.current) setIsLoading(false);
    }
  }, []);

  // Chỗ DUY NHẤT gọi API
  useEffect(() => {
    if (visible) loadRecipes(activeTab, submittedQuery);
  }, [visible, activeTab, submittedQuery, loadRecipes]);

  // Đồng bộ danh sách đang chọn khi modal hiển thị
  useEffect(() => {
    if (visible) {
      const map = new Map<string, RecipeSummaryResponse>();
      if (initialSelectedRecipes && initialSelectedRecipes.length > 0) {
        initialSelectedRecipes.forEach((r) => {
          const key = r.id || r.externalId;
          if (key) map.set(key, r);
        });
      } else if (selectedRecipeIds && selectedRecipeIds.length > 0) {
        selectedRecipeIds.forEach((id) => {
          map.set(id, { id, title: "", imageUrl: null } as RecipeSummaryResponse);
        });
      } else if (selectedRecipeId) {
        map.set(selectedRecipeId, { id: selectedRecipeId, title: "", imageUrl: null } as RecipeSummaryResponse);
      }
      setSelectedMap(map);
    }
  }, [visible, selectedRecipeId, selectedRecipeIds, initialSelectedRecipes]);

  const handleToggleRecipe = (item: RecipeSummaryResponse) => {
    const key = item.id || item.externalId;
    if (!key) return;

    if (!isMulti) {
      onSelectRecipe?.(item);
      onClose();
      return;
    }

    setSelectedMap((prev) => {
      const next = new Map(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.set(key, item);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    const list = Array.from(selectedMap.values()).filter(Boolean);
    onSelectRecipes?.(list);
    onClose();
  };

  const handleTabChange = (tab: TabMode) => setActiveTab(tab);

  const handleSearchSubmit = () => {
    setSubmittedQuery(searchQuery.trim());
    setActiveTab("search");
  };

  const getDifficultyLabel = (diff?: string | null) => {
    switch (diff) {
      case "EASY":
        return { label: "Dễ", tone: "success" as const };
      case "MEDIUM":
        return { label: "Vừa", tone: "warn" as const };
      case "HARD":
        return { label: "Khó", tone: "danger" as const };
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View className="flex-1 bg-canvas dark:bg-canvas-dark">
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-line px-5 py-4 dark:border-line-dark">
          <View className="flex-1 pr-2">
            <AppText variant="title" className="text-xl font-bold">
              {isMulti ? "Chọn các món cho bữa ăn" : "Chọn công thức"}
            </AppText>
            <AppText variant="caption" className="text-muted">
              {isMulti
                ? "Chạm để chọn nhiều món ăn cùng lúc"
                : "Kết nối trực tiếp với thực đơn bữa ăn"}
            </AppText>
          </View>
          <Pressable
            onPress={onClose}
            className="h-9 w-9 items-center justify-center rounded-full bg-soft active:opacity-70 dark:bg-surface-dark">
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
                  setSearchQuery("");
                  setSubmittedQuery("");
                  if (activeTab === "search") setActiveTab("suggestions");
                }}
                className="p-1">
                <Ionicons name="close-circle" size={18} color={palette.muted} />
              </Pressable>
            ) : null}
            <Pressable
              onPress={handleSearchSubmit}
              className="ml-1 rounded-xl bg-brand px-3 py-1.5 active:opacity-80">
              <AppText className="text-xs font-bold text-white">Tìm</AppText>
            </Pressable>
          </View>
        </View>

        {/* Category Tabs */}
        <View className="flex-row gap-2 px-5 py-2">
          <Pressable
            onPress={() => handleTabChange("suggestions")}
            className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${
              activeTab === "suggestions"
                ? "bg-brand"
                : "bg-soft dark:bg-surface-dark"
            }`}>
            <Ionicons
              name="sparkles"
              size={14}
              color={activeTab === "suggestions" ? "#fff" : palette.muted}
            />
            <AppText
              className={`text-xs font-semibold ${
                activeTab === "suggestions" ? "text-white" : "text-muted"
              }`}>
              Gợi ý từ tủ
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => handleTabChange("random")}
            className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${
              activeTab === "random"
                ? "bg-brand"
                : "bg-soft dark:bg-surface-dark"
            }`}>
            <Ionicons
              name="dice-outline"
              size={14}
              color={activeTab === "random" ? "#fff" : palette.muted}
            />
            <AppText
              className={`text-xs font-semibold ${
                activeTab === "random" ? "text-white" : "text-muted"
              }`}>
              Ngẫu nhiên
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => handleTabChange("custom")}
            className={`flex-row items-center gap-1.5 rounded-full px-3 py-1.5 ${
              activeTab === "custom"
                ? "bg-brand"
                : "bg-soft dark:bg-surface-dark"
            }`}>
            <Ionicons
              name="book-outline"
              size={14}
              color={activeTab === "custom" ? "#fff" : palette.muted}
            />
            <AppText
              className={`text-xs font-semibold ${
                activeTab === "custom" ? "text-white" : "text-muted"
              }`}>
              Tự tạo
            </AppText>
          </Pressable>
        </View>

        {/* Content List */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center p-8">
            <ActivityIndicator size="large" color={brand} />
            <AppText className="mt-3 text-sm text-muted">
              Đang tải danh sách món ăn...
            </AppText>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center p-8 text-center">
            <Ionicons name="alert-circle-outline" size={44} color="#EF4444" />
            <AppText className="mt-2 text-center text-sm font-semibold text-danger">
              {error}
            </AppText>
            <Pressable
              onPress={() => loadRecipes(activeTab, submittedQuery)}
              className="mt-4 rounded-xl bg-brand px-4 py-2">
              <AppText className="text-xs font-bold text-white">
                Thử lại
              </AppText>
            </Pressable>
          </View>
        ) : recipes.length === 0 ? (
          <View className="flex-1 items-center justify-center p-8">
            <Ionicons
              name="restaurant-outline"
              size={48}
              color={palette.muted}
            />
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
            keyExtractor={(item, idx) =>
              item.id || item.externalId || `recipe-${idx}`
            }
            contentContainerStyle={{
              padding: 16,
              gap: 12,
              paddingBottom: isMulti ? Math.max(insets.bottom + 85, 110) : 40,
            }}
            renderItem={({ item }) => {
              const key = item.id || item.externalId || "";
              const isSelected = isMulti
                ? selectedMap.has(key)
                : Boolean(selectedRecipeId && item.id === selectedRecipeId);
              const diffBadge = getDifficultyLabel(item.difficulty);

              return (
                <Pressable
                  onPress={() => handleToggleRecipe(item)}
                  className="active:opacity-85">
                  <Card
                    className={`flex-row items-center overflow-hidden p-3 transition-all ${
                      isSelected
                        ? "border-2 border-brand bg-brandSoft dark:bg-surface-dark"
                        : "border border-line dark:border-line-dark"
                    }`}>
                    {/* Checkbox selector in multi-select mode */}
                    {isMulti && (
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          borderWidth: 1.8,
                          borderColor: isSelected ? brand : palette.muted,
                          backgroundColor: isSelected ? brand : "transparent",
                          alignItems: "center",
                          justifyContent: "center",
                          marginRight: 10,
                        }}>
                        {isSelected && (
                          <Ionicons name="checkmark" size={15} color="#fff" />
                        )}
                      </View>
                    )}

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
                          <Ionicons
                            name="restaurant"
                            size={28}
                            color={palette.muted}
                          />
                        </View>
                      )}
                    </View>

                    {/* Info */}
                    <View className="ml-3 flex-1 justify-between py-0.5">
                      <View>
                        <View className="flex-row items-center justify-between gap-1">
                          <AppText
                            numberOfLines={1}
                            className="flex-1 text-base font-bold text-ink dark:text-ink-dark">
                            {item.title}
                          </AppText>
                          {isSelected && !isMulti && (
                            <View className="rounded-full bg-brand/15 px-2.5 py-0.5">
                              <AppText className="text-xs font-bold text-brand">
                                Đang chọn
                              </AppText>
                            </View>
                          )}
                        </View>

                        {/* Meta Tags */}
                        <View className="mt-1 flex-row flex-wrap items-center gap-2">
                          {item.readyInMinutes ? (
                            <View className="flex-row items-center gap-1">
                              <Ionicons
                                name="time-outline"
                                size={12}
                                color={palette.muted}
                              />
                              <AppText
                                variant="caption"
                                className="text-xs text-muted">
                                {item.readyInMinutes}p
                              </AppText>
                            </View>
                          ) : null}

                          {item.servings ? (
                            <View className="flex-row items-center gap-1">
                              <Ionicons
                                name="people-outline"
                                size={12}
                                color={palette.muted}
                              />
                              <AppText
                                variant="caption"
                                className="text-xs text-muted">
                                {item.servings} phần
                              </AppText>
                            </View>
                          ) : null}

                          {diffBadge ? (
                            <Badge
                              label={diffBadge.label}
                              tone={diffBadge.tone}
                            />
                          ) : null}

                          {item.custom ? (
                            <View className="rounded-full bg-soft px-2 py-0.5 dark:bg-canvas-dark">
                              <AppText className="text-xs font-semibold text-muted">
                                Tự tạo
                              </AppText>
                            </View>
                          ) : null}
                        </View>
                      </View>

                      {/* Match score from pantry if available */}
                      {item.matchScore !== null &&
                      item.matchScore !== undefined ? (
                        <View className="mt-1 flex-row items-center gap-1.5">
                          <Ionicons
                            name="checkmark-circle"
                            size={13}
                            color="#10B981"
                          />
                          <AppText className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            {Math.round(item.matchScore * 100)}% nguyên liệu có
                            sẵn
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

        {/* Multi-select bottom action bar */}
        {isMulti && (
          <View
            style={{
              paddingBottom: Math.max(insets.bottom, 16),
              paddingTop: 14,
              paddingHorizontal: 20,
              backgroundColor: isDark ? "#1A241E" : "#FFFFFF",
              borderTopColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E5E7EB",
              borderTopWidth: 1,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: isDark ? 0.35 : 0.08,
              shadowRadius: 10,
              elevation: 8,
            }}
            className="flex-row items-center justify-between">
            <View className="flex-1 pr-3">
              <View className="flex-row items-center gap-2">
                <AppText
                  style={{
                    fontSize: 16,
                    fontWeight: "800",
                    color: palette.ink,
                  }}>
                  Đã chọn {selectedMap.size} món
                </AppText>
                {selectedMap.size > 0 && (
                  <View
                    style={{
                      backgroundColor: isDark
                        ? "rgba(16, 185, 129, 0.2)"
                        : "rgba(46, 125, 79, 0.12)",
                      paddingHorizontal: 7,
                      paddingVertical: 1.5,
                      borderRadius: 8,
                    }}>
                    <AppText
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: brand,
                      }}>
                      Sẵn sàng
                    </AppText>
                  </View>
                )}
              </View>
              <AppText
                style={{
                  fontSize: 13,
                  color: palette.muted,
                  marginTop: 3,
                }}
                numberOfLines={1}>
                {selectedMap.size === 0
                  ? "Chạm vào các món để thêm vào bữa"
                  : "Bấm xác nhận để đưa vào thực đơn"}
              </AppText>
            </View>

            <Pressable
              onPress={handleConfirm}
              disabled={selectedMap.size === 0}
              style={{
                backgroundColor:
                  selectedMap.size > 0 ? brand : isDark ? "#2A372E" : "#E5E7EB",
                opacity: selectedMap.size > 0 ? 1 : 0.6,
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 16,
                flexDirection: "row",
                alignItems: "center",
                gap: 7,
                shadowColor: brand,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: selectedMap.size > 0 ? 0.3 : 0,
                shadowRadius: 6,
                elevation: selectedMap.size > 0 ? 3 : 0,
              }}
              className="active:scale-[0.97]">
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={selectedMap.size > 0 ? "#FFFFFF" : palette.muted}
              />
              <AppText
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: selectedMap.size > 0 ? "#FFFFFF" : palette.muted,
                }}>
                Xác nhận ({selectedMap.size})
              </AppText>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}
