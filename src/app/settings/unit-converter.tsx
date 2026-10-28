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
  const { brand } = useAppTheme();
  const form = useUnitConverterForm();

  return (
    <PageScreen title="Quy đổi đơn vị">
      <Card className="gap-4 p-4">
        <TextField
          label="Giá trị"
          keyboardType="decimal-pad"
          value={form.values.value}
          onChangeText={form.setValue}
        />

        <View className="gap-2">
          <AppText variant="label">Từ</AppText>
          <ChipGroup options={UNIT_OPTIONS} value={form.values.from} onChange={form.setFrom} />
        </View>

        <Pressable
          onPress={form.swap}
          accessibilityRole="button"
          accessibilityLabel="Đổi chiều quy đổi"
          className="h-10 w-10 items-center justify-center self-center rounded-full bg-soft active:opacity-70 dark:bg-soft-dark"
        >
          <Ionicons name="swap-vertical" size={22} color={brand} />
        </Pressable>

        <View className="gap-2">
          <AppText variant="label">Sang</AppText>
          <ChipGroup options={form.toOptions} value={form.values.to} onChange={form.setTo} />
        </View>

        {form.error ? <AppText variant="error">{form.error}</AppText> : null}

        <Button title="Quy đổi" loading={form.isConverting} onPress={() => void form.submit()} />
      </Card>

      {form.resultText ? (
        <Card className="items-center gap-1 p-5">
          <AppText variant="caption">Kết quả</AppText>
          <AppText variant="heading" className="text-center text-brand">
            {form.resultText}
          </AppText>
        </Card>
      ) : null}
    </PageScreen>
  );
}
