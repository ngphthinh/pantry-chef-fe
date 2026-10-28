import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ChipGroup } from "@/components/ui/ChipGroup";
import { PageScreen } from "@/components/ui/PageScreen";
import { TextField } from "@/components/ui/TextField";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { UNIT_OPTIONS } from "@/features/unit/unitOptions";
import { useUnitConverterForm } from "@/features/unit/useUnitConverterForm";

export default function UnitConverterScreen() {
  const { brand, palette } = useAppTheme();
  const form = useUnitConverterForm();

  return (
    <PageScreen title="Quy đổi đơn vị">
      <View className="flex-1 gap-5 pt-4">
        {/* Input */}
        <Card className="gap-4 p-4">
          <View className="gap-2">
            <AppText variant="label">Giá trị cần quy đổi</AppText>
            <TextField
              label="Giá trị"
              keyboardType="decimal-pad"
              value={form.values.value}
              onChangeText={form.setValue}
            />
          </View>

          {/* Source unit */}
          <View className="gap-3">
            <View className="flex-row items-center gap-2">
              <Ionicons
                name="arrow-up-circle-outline"
                size={20}
                color={brand}
              />
              <AppText className="font-semibold">Từ đơn vị</AppText>
            </View>

            <ChipGroup
              horizontal
              options={UNIT_OPTIONS}
              value={form.values.from}
              onChange={form.setFrom}
            />
          </View>

          {/* Swap */}
          <View className="flex-row items-center gap-3">
            <View className="h-px flex-1 bg-border dark:bg-border-dark" />

            <Pressable
              onPress={form.swap}
              accessibilityRole="button"
              accessibilityLabel="Đổi chiều quy đổi"
              hitSlop={8}
              className="h-11 w-11 items-center justify-center rounded-full bg-soft active:opacity-70 dark:bg-soft-dark">
              <Ionicons name="swap-vertical" size={22} color={brand} />
            </Pressable>

            <View className="h-px flex-1 bg-border dark:bg-border-dark" />
          </View>

          {/* Target unit */}
          <View className="gap-3">
            <View className="flex-row items-center gap-2">
              <Ionicons
                name="arrow-down-circle-outline"
                size={20}
                color={brand}
              />
              <AppText className="font-semibold">Sang đơn vị</AppText>
            </View>

            <ChipGroup
              horizontal
              options={form.toOptions}
              value={form.values.to}
              onChange={form.setTo}
            />
          </View>

          {form.error ? <AppText variant="error">{form.error}</AppText> : null}

          <Button
            title="Quy đổi"
            loading={form.isConverting}
            onPress={() => void form.submit()}
          />
        </Card>

        {/* Result */}
        {form.resultText ? (
          <Card className="gap-3 p-4">
            <View className="flex-row items-center gap-2">
              <Ionicons name="checkmark-circle" size={22} color={brand} />
              <AppText variant="label">Kết quả quy đổi</AppText>
            </View>

            <AppText
              variant="heading"
              className="text-center"
              style={{ color: brand }}>
              {form.resultText}
            </AppText>
          </Card>
        ) : (
          <View className="items-center gap-2 px-6 py-5">
            <Ionicons
              name="calculator-outline"
              size={32}
              color={palette.muted}
            />
            <AppText variant="caption" className="text-center">
              Nhập giá trị và chọn hai đơn vị để bắt đầu quy đổi.
            </AppText>
          </View>
        )}
      </View>
    </PageScreen>
  );
}
