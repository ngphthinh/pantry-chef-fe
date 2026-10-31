import { useCallback } from "react";
import { Platform, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, type Href } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { PageScreen } from "@/components/ui/PageScreen";
import { TextField } from "@/components/ui/TextField";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { barcodePicker } from "@/features/ingredient/barcodePicker";
import {
  ingredientPicker,
  toPantryNewParams,
  toPickedIngredient,
} from "@/features/ingredient/ingredientPicker";
import { useIngredientCategories } from "@/features/ingredient/useIngredientCategories";
import { useIngredientForm } from "@/features/ingredient/useIngredientForm";
import type { IngredientResponse, Unit } from "@/types";

const UNITS: Unit[] = ["G", "KG", "ML", "L", "PCS", "TBSP", "TSP", "CUP"];

export default function NewIngredientScreen() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const { name: initialName, pick } = useLocalSearchParams<{
    name?: string;
    pick?: string;
  }>();
  const pickMode = pick === "1";

  const { categories } = useIngredientCategories();

  const handleCreated = useCallback(
    (ingredient: IngredientResponse) => {
      const picked = toPickedIngredient(ingredient);
      if (pickMode) {
        ingredientPicker.resolve(picked);
        router.dismiss(2); // bỏ cả màn này và màn chọn nguyên liệu
        return;
      }
      router.dismissTo({
        pathname: "/pantry/new",
        params: toPantryNewParams(picked),
      });
    },
    [pickMode, router],
  );

  const form = useIngredientForm({ initialName, onCreated: handleCreated });

  return (
    <PageScreen title="Thêm nguyên liệu mới">
      <AppText variant="caption">
        Nguyên liệu bạn thêm chỉ hiện trong tài khoản của bạn. Chọn đúng danh
        mục để lọc và gợi ý món chính xác hơn.
      </AppText>

      <TextField
        label="Tên nguyên liệu"
        placeholder="Ví dụ: Cà rốt tím"
        autoCapitalize="sentences"
        value={form.name}
        onChangeText={form.setName}
        maxLength={255}
        error={form.errors.name}
        returnKeyType="next"
      />

      <View className="gap-2">
        <AppText variant="label">Danh mục</AppText>
        {categories.length > 0 ? (
          <ChipGroup
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            value={form.categoryId}
            onChange={form.setCategoryId}
            onClear={() => form.setCategoryId("")}
          />
        ) : (
          <AppText variant="caption">Đang tải danh mục...</AppText>
        )}
        {form.errors.category ? (
          <AppText variant="error">{form.errors.category}</AppText>
        ) : null}
      </View>

      <View className="gap-2">
        <AppText variant="label">Đơn vị mặc định (không bắt buộc)</AppText>
        <ChipGroup
          options={UNITS.map((u) => ({ value: u, label: u }))}
          value={form.unit}
          onChange={(value) => form.setUnit(value as Unit)}
          onClear={() => form.setUnit("")}
        />
      </View>

      <View className="gap-2">
        <View className="flex-row items-center justify-between">
          <AppText variant="label">Mã vạch (không bắt buộc)</AppText>
          {Platform.OS !== "web" && (
            <Pressable
              onPress={() => {
                barcodePicker.request((code) => form.setBarcode(code));
                router.push({
                  pathname: "/pantry/barcode",
                  params: { pick: "1" },
                } as Href);
              }}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Quét mã vạch"
              className="h-9 w-9 items-center justify-center rounded-full bg-successBg active:opacity-70 dark:bg-successBg-dark"
            >
              <Ionicons
                name="barcode-outline"
                size={20}
                color={palette.successInk}
              />
            </Pressable>
          )}
        </View>
        <TextField
          placeholder="8–14 chữ số"
          keyboardType="number-pad"
          maxLength={14}
          value={form.barcode}
          onChangeText={form.setBarcode}
          error={form.errors.barcode}
          onSubmitEditing={() => void form.submit()}
          returnKeyType="done"
        />
      </View>

      {form.formError ? (
        <AppText variant="error">{form.formError}</AppText>
      ) : null}

      <Button
        title="Thêm nguyên liệu"
        loading={form.isSubmitting}
        onPress={() => void form.submit()}
      />
    </PageScreen>
  );
}
