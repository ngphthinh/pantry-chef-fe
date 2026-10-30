import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { useAppTheme } from "@/core/theme/useAppTheme";
import {
  ingredientPicker,
  toPantryNewParams,
  toPickedIngredient,
} from "@/features/ingredient/ingredientPicker";
import { useIngredientCategories } from "@/features/ingredient/useIngredientCategories";
import { useIngredientSearch } from "@/features/ingredient/useIngredientSearch";
import type { IngredientResponse } from "@/types";

const ADD_INGREDIENT_ROUTE = "/pantry/new-ingredient";

export default function SelectIngredientScreen() {
  const router = useRouter();
  const { brand, palette } = useAppTheme();
  const { pick } = useLocalSearchParams<{ pick?: string }>();
  const pickMode = pick === "1";

  const { categories } = useIngredientCategories();
  const [categoryId, setCategoryId] = useState("");
  const search = useIngredientSearch({
    categoryId: categoryId || undefined,
    pageSize: 30,
  });

  const keyword = search.keyword.trim();

  useEffect(
    () => () => {
      if (pickMode) ingredientPicker.cancel();
    },
    [pickMode],
  );

  const handleSelect = (item: IngredientResponse) => {
    const picked = toPickedIngredient(item);
    if (pickMode) {
      ingredientPicker.resolve(picked);
      router.back();
      return;
    }
    router.replace({
      pathname: "/pantry/new",
      params: toPantryNewParams(picked),
    });
  };

  const goBack = () =>
    router.canGoBack() ? router.back() : router.replace("/");

  const header = (
    <View className="gap-4">
      <View className="flex-row items-center gap-3">
        <Pressable
          onPress={goBack}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
          className="h-10 w-10 items-center justify-center rounded-full bg-soft dark:bg-surface-dark"
        >
          <Ionicons name="arrow-back" size={20} color={palette.ink} />
        </Pressable>
        <View className="flex-1">
          <AppText variant="title">Chọn nguyên liệu</AppText>
          <AppText variant="caption">
            Tìm từ danh mục chuẩn hóa của hệ thống
          </AppText>
        </View>
      </View>

      <TextField
        label="Tìm kiếm nguyên liệu"
        placeholder="Ví dụ: ca chua, thit bo..."
        value={search.keyword}
        onChangeText={search.setKeyword}
        autoFocus
        returnKeyType="search"
      />

      {categories.length > 0 && (
        <ChipGroup
          horizontal
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          value={categoryId}
          onChange={setCategoryId}
          onClear={() => setCategoryId("")}
        />
      )}

      {!pickMode && (
        <Pressable
          onPress={() => router.replace("/pantry/barcode" as Href)}
          accessibilityRole="button"
          className="flex-row items-center gap-2 self-start active:opacity-70"
        >
          <Ionicons name="barcode-outline" size={18} color={brand} />
          <AppText className="font-semibold text-brand">
            Quét mã vạch thay vì gõ tên
          </AppText>
        </Pressable>
      )}

      {search.isInitialLoading && (
        <View className="items-center py-8">
          <ActivityIndicator size="large" color={brand} />
          <AppText variant="caption" className="mt-2">
            Đang tìm kiếm...
          </AppText>
        </View>
      )}

      {search.error && (
        <Card className="items-center gap-3 p-5">
          <AppText variant="error" className="text-center">
            {search.error}
          </AppText>
          <Button
            title="Thử lại"
            variant="outline"
            onPress={() => void search.retry()}
          />
        </Card>
      )}
    </View>
  );

  const handleAddIngredient = () => {
    router.push({
      pathname: ADD_INGREDIENT_ROUTE,
      params: {
        ...(keyword ? { name: keyword } : {}),
        ...(pickMode ? { pick: "1" } : {}),
      },
    } as Href);
  };

  const empty = search.isEmpty ? (
    <View className="gap-3">
      <EmptyState
        icon="search-outline"
        title="Không tìm thấy nguyên liệu"
        message={
          keyword
            ? `Chưa có “${keyword}” trong danh mục. Bạn có muốn thêm nguyên liệu này không?`
            : "Chưa có nguyên liệu nào khớp. Bạn có muốn thêm nguyên liệu mới không?"
        }
      />
      <Button title="Thêm nguyên liệu mới" onPress={handleAddIngredient} />
    </View>
  ) : undefined;

  return (
    <Screen scroll={false}>
      <FlatList
        data={search.items}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        ListFooterComponent={
          search.isLoadingMore ? (
            <View className="items-center p-4">
              <ActivityIndicator color={brand} />
            </View>
          ) : undefined
        }
        onEndReached={() => void search.loadMore()}
        onEndReachedThreshold={0.4}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32, gap: 16 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => handleSelect(item)}
            className="active:scale-[0.985]"
          >
            <Card className="flex-row items-center justify-between gap-3 p-4 shadow-sm">
              <View className="flex-1 flex-row items-center gap-3.5">
                <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brandSoft dark:bg-successBg-dark">
                  <Ionicons name="nutrition-outline" size={20} color={brand} />
                </View>
                <View className="flex-1">
                  <AppText
                    variant="heading"
                    className="text-base font-semibold"
                    numberOfLines={1}
                  >
                    {item.name}
                  </AppText>
                  <AppText
                    variant="caption"
                    className="mt-0.5"
                    numberOfLines={1}
                  >
                    {item.category?.name ?? "Nguyên liệu"}
                    {item.defaultUnit ? ` · Đơn vị: ${item.defaultUnit}` : ""}
                  </AppText>
                </View>
              </View>
              <Badge label="Chọn" tone="success" />
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}
