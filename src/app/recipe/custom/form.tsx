import { ActivityIndicator, Image, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { PageScreen } from "@/components/ui/PageScreen";
import { TextArea } from "@/components/ui/TextArea";
import { TextField } from "@/components/ui/TextField";
import { showAlert } from "@/components/ui/dialogs";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { DIFFICULTY_OPTIONS } from "@/features/customRecipe/recipeDifficulty";
import { useCustomRecipeForm } from "@/features/customRecipe/useCustomRecipeForm";
import { UNIT_OPTIONS } from "@/features/unit/unitOptions";

/** Tạo mới; thêm `?id=<uuid>` để sửa công thức có sẵn. */
export default function CustomRecipeFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { palette, brand } = useAppTheme();
  const form = useCustomRecipeForm(id);

  const handlePickImage = async () => {
    const message = await form.pickImage();
    if (message) showAlert("Không chọn được ảnh", message);
  };

  const handleSubmit = async () => {
    const result = await form.submit();
    if (!result.ok) {
      showAlert("Chưa lưu được", result.message);
      return;
    }
    if (result.data.imageFailed) {
      showAlert("Đã lưu công thức", "Nhưng chưa tải được ảnh. Hãy mở lại phần sửa để chọn ảnh một lần nữa.");
    }
    // Thay màn form bằng chi tiết để nút quay lại không trở về form cũ.
    router.replace(`/recipe/custom/${result.data.id}`);
  };

  if (form.isEdit && form.isLoading) {
    return (
      <PageScreen title="Sửa công thức">
        <ActivityIndicator color={brand} className="py-10" />
      </PageScreen>
    );
  }

  if (form.isEdit && form.loadError) {
    return (
      <PageScreen title="Sửa công thức">
        <Card className="items-center gap-3 p-4">
          <AppText variant="error" className="text-center">
            {form.loadError}
          </AppText>
          <Button title="Thử lại" variant="outline" onPress={() => void form.reload()} className="self-stretch" />
        </Card>
      </PageScreen>
    );
  }

  return (
    <PageScreen title={form.isEdit ? "Sửa công thức" : "Tạo công thức"}>
      <Pressable onPress={() => void handlePickImage()} accessibilityRole="button" accessibilityLabel="Chọn ảnh món">
        {form.imageUri ? (
          <Image source={{ uri: form.imageUri }} className="h-48 w-full rounded-3xl" resizeMode="cover" />
        ) : (
          <View className="h-36 items-center justify-center gap-2 rounded-3xl border border-dashed border-line bg-soft dark:border-line-dark dark:bg-soft-dark">
            <Ionicons name="image-outline" size={30} color={brand} />
            <AppText variant="caption">Thêm ảnh món ăn</AppText>
          </View>
        )}
      </Pressable>
      {form.imageUri ? (
        <AppText variant="link" className="self-center text-sm" onPress={() => void handlePickImage()}>
          Đổi ảnh
        </AppText>
      ) : null}

      <TextField
        label="Tên món"
        placeholder="Ví dụ: Thịt kho tàu"
        autoCapitalize="sentences"
        value={form.values.title}
        onChangeText={(t) => form.setField("title", t)}
        error={form.errors.title}
      />

      <View className="flex-row gap-3">
        <View className="flex-1">
          <TextField
            label="Khẩu phần"
            keyboardType="number-pad"
            value={form.values.servings}
            onChangeText={(t) => form.setField("servings", t)}
            error={form.errors.servings}
          />
        </View>
        <View className="flex-1">
          <TextField
            label="Thời gian (phút)"
            keyboardType="number-pad"
            value={form.values.readyInMinutes}
            onChangeText={(t) => form.setField("readyInMinutes", t)}
            error={form.errors.readyInMinutes}
          />
        </View>
      </View>

      <View className="gap-2">
        <AppText variant="caption" className="font-semibold">
          Độ khó (tuỳ chọn)
        </AppText>
        <ChipGroup
          options={DIFFICULTY_OPTIONS}
          value={form.values.difficulty}
          onChange={(d) => form.setField("difficulty", d)}
          onClear={() => form.setField("difficulty", "")}
        />
      </View>

      {form.cuisineOptions.length > 0 ? (
        <View className="gap-2">
          <AppText variant="caption" className="font-semibold">
            Ẩm thực (tuỳ chọn)
          </AppText>
          <ChipGroup
            options={form.cuisineOptions}
            value={form.values.cuisineId}
            onChange={(c) => form.setField("cuisineId", c)}
            onClear={() => form.setField("cuisineId", "")}
          />
        </View>
      ) : null}

      <View className="gap-3">
        <AppText variant="label">Nguyên liệu</AppText>
        {form.values.ingredients.map((row) => (
          <Card key={row.key} className="gap-3 p-4">
            <View className="flex-row items-end gap-3">
              <View className="flex-1">
                <TextField
                  label="Tên nguyên liệu"
                  autoCapitalize="sentences"
                  value={row.name}
                  onChangeText={(t) => form.updateIngredient(row.key, { name: t })}
                />
              </View>
              <Pressable
                onPress={() => form.removeIngredient(row.key)}
                hitSlop={8}
                className="h-12 justify-center"
                accessibilityRole="button"
                accessibilityLabel="Xoá nguyên liệu"
              >
                <Ionicons name="trash-outline" size={20} color={palette.dangerInk} />
              </Pressable>
            </View>
            <TextField
              label="Số lượng (bỏ trống = vừa đủ)"
              keyboardType="decimal-pad"
              value={row.amount}
              onChangeText={(t) => form.updateIngredient(row.key, { amount: t })}
            />
            <ChipGroup
              horizontal
              options={UNIT_OPTIONS}
              value={row.unit}
              onChange={(unit) => form.updateIngredient(row.key, { unit })}
              onClear={() => form.updateIngredient(row.key, { unit: "" })}
            />
          </Card>
        ))}
        {form.errors.ingredients ? <AppText variant="error">{form.errors.ingredients}</AppText> : null}
        <Button title="Thêm nguyên liệu" variant="outline" onPress={form.addIngredient} />
      </View>

      <View className="gap-3">
        <AppText variant="label">Các bước làm</AppText>
        {form.values.steps.map((row, index) => (
          <Card key={row.key} className="gap-3 p-4">
            <View className="flex-row items-center justify-between">
              <AppText className="font-bold">Bước {index + 1}</AppText>
              <Pressable
                onPress={() => form.removeStep(row.key)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Xoá bước ${index + 1}`}
              >
                <Ionicons name="trash-outline" size={20} color={palette.dangerInk} />
              </Pressable>
            </View>
            <TextArea
              label="Nội dung"
              autoCapitalize="sentences"
              value={row.text}
              onChangeText={(t) => form.updateStep(row.key, { text: t })}
            />
            <TextField
              label="Hẹn giờ (phút, tuỳ chọn)"
              keyboardType="decimal-pad"
              value={row.timerMinutes}
              onChangeText={(t) => form.updateStep(row.key, { timerMinutes: t })}
            />
          </Card>
        ))}
        {form.errors.steps ? <AppText variant="error">{form.errors.steps}</AppText> : null}
        <Button title="Thêm bước" variant="outline" onPress={form.addStep} />
      </View>

      <Button
        title={form.isEdit ? "Lưu thay đổi" : "Tạo công thức"}
        loading={form.isSubmitting}
        onPress={() => void handleSubmit()}
      />
    </PageScreen>
  );
}
