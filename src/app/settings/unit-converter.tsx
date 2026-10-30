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

function UnitLabel({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  const { brand } = useAppTheme();
  return (
    <View className="flex-row items-center gap-2">
      <View className="h-8 w-8 items-center justify-center rounded-xl bg-brandSoft dark:bg-surface-dark">
        <Ionicons name={icon} size={16} color={brand} />
      </View>
      <AppText variant="heading" className="text-base">
        {label}
      </AppText>
    </View>
  );
}

export default function UnitConverterScreen() {
  const { brand, palette } = useAppTheme();
  const form = useUnitConverterForm();

  return (
    <PageScreen title="Quy đổi đơn vị">
      <View className="gap-5 pb-10 pt-4">
        {/* Giá trị */}
        <Card className="gap-3 bg-brandSoft/40 p-4 shadow-sm dark:bg-surface-dark">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-surface dark:bg-soft-dark">
              <Ionicons name="calculator" size={22} color={brand} />
            </View>
            <View className="flex-1">
              <AppText variant="heading" className="text-base">
                Giá trị cần quy đổi
              </AppText>
              <AppText variant="caption">Nhập số rồi chọn hai đơn vị</AppText>
            </View>
          </View>
          <TextField
            label="Giá trị"
            keyboardType="decimal-pad"
            value={form.values.value}
            onChangeText={form.setValue}
          />
        </Card>

        {/* Đơn vị */}
        <Card className="gap-4 p-4 shadow-sm">
          <View className="gap-3">
            <UnitLabel icon="arrow-up-circle" label="Từ đơn vị" />
            <ChipGroup
              horizontal
              options={UNIT_OPTIONS}
              value={form.values.from}
              onChange={form.setFrom}
            />
          </View>

          <View className="flex-row items-center gap-3">
            <View className="h-px flex-1 bg-line dark:bg-line-dark" />
            <Pressable
              onPress={form.swap}
              accessibilityRole="button"
              accessibilityLabel="Đổi chiều quy đổi"
              hitSlop={8}
              className="h-12 w-12 items-center justify-center rounded-full bg-brand shadow-md active:scale-90">
              <Ionicons name="swap-vertical" size={22} color="#FFFFFF" />
            </Pressable>
            <View className="h-px flex-1 bg-line dark:bg-line-dark" />
          </View>

          <View className="gap-3">
            <UnitLabel icon="arrow-down-circle" label="Sang đơn vị" />
            <ChipGroup
              horizontal
              options={form.toOptions}
              value={form.values.to}
              onChange={form.setTo}
            />
          </View>

          {form.error ? (
            <View className="flex-row items-center gap-2 rounded-2xl border border-dangerInk/40 bg-dangerBg/40 p-3 dark:border-dangerInk-dark/40 dark:bg-dangerBg-dark">
              <Ionicons
                name="alert-circle"
                size={18}
                color={palette.dangerInk}
              />
              <AppText variant="error" className="flex-1">
                {form.error}
              </AppText>
            </View>
          ) : null}

          <Button
            title="Quy đổi"
            loading={form.isConverting}
            onPress={() => void form.submit()}
          />
        </Card>

        {/* Kết quả */}
        {form.resultText ? (
          <Card className="items-center gap-2 bg-successBg/50 p-6 shadow-sm dark:bg-successBg-dark">
            <View className="flex-row items-center gap-1.5">
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={palette.successInk}
              />
              <AppText
                variant="label"
                className="text-xs font-bold uppercase tracking-wider text-successInk dark:text-successInk-dark">
                Kết quả quy đổi
              </AppText>
            </View>
            <AppText
              variant="title"
              className="text-center text-3xl font-extrabold"
              style={{ color: brand }}>
              {form.resultText}
            </AppText>
          </Card>
        ) : (
          <View className="items-center gap-2 px-6 py-5">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-soft dark:bg-soft-dark">
              <Ionicons
                name="calculator-outline"
                size={30}
                color={palette.muted}
              />
            </View>
            <AppText variant="caption" className="text-center">
              Nhập giá trị và chọn hai đơn vị để bắt đầu quy đổi.
            </AppText>
          </View>
        )}
      </View>
    </PageScreen>
  );
}
