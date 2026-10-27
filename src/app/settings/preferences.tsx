import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { cn } from "@/components/ui/cn";
import { useAppTheme, type ThemeMode } from "@/core/theme/useAppTheme";
import { useUser } from "@/features/auth/useUser";
import type { MeasurementSystem, UserUpdateRequest } from "@/types";

const THEME_OPTIONS: {
  mode: ThemeMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { mode: "light", label: "Sáng", icon: "sunny-outline" },
  { mode: "dark", label: "Tối", icon: "moon-outline" },
  { mode: "system", label: "Theo hệ thống", icon: "phone-portrait-outline" },
];

const MEASUREMENT_OPTIONS: {
  value: MeasurementSystem;
  label: string;
  description: string;
}[] = [
  {
    value: "METRIC",
    label: "Hệ mét",
    description: "kg, g, ml, l, °C",
  },
  {
    value: "IMPERIAL",
    label: "Hệ Anh/Mỹ",
    description: "lb, oz, fl oz, °F",
  },
];

export default function PreferencesScreen() {
  const { mode, setMode, brand, palette } = useAppTheme();
  const { user, updateProfile } = useUser();

  const [saving, setSaving] = useState(false);
  const [measurementSystem, setMeasurementSystem] = useState<MeasurementSystem>(
    user?.measurementSystem ?? "METRIC",
  );

  const handleThemeChange = async (selectedMode: ThemeMode) => {
    const previousMode = mode;

    // Cập nhật giao diện ngay lập tức.
    setMode(selectedMode);
    setSaving(true);

    try {
      await updateProfile({
        themeMode: selectedMode.toUpperCase() as UserUpdateRequest["themeMode"],
      });
    } catch (error) {
      // Khôi phục giao diện nếu API thất bại.
      setMode(previousMode);
      Alert.alert(
        "Lỗi",
        error instanceof Error
          ? error.message
          : "Không thể cập nhật giao diện.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleMeasurementChange = async (selected: MeasurementSystem) => {
    const previous = measurementSystem;

    setMeasurementSystem(selected);
    setSaving(true);

    try {
      await updateProfile({ measurementSystem: selected });
    } catch (error) {
      setMeasurementSystem(previous);
      Alert.alert(
        "Lỗi",
        error instanceof Error
          ? error.message
          : "Không thể cập nhật hệ đo lường.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen className="gap-5 pt-2">
      <View className="gap-2">
        <AppText variant="label">Giao diện</AppText>

        <Card className="overflow-hidden">
          {THEME_OPTIONS.map((option, index) => (
            <Pressable
              key={option.mode}
              disabled={saving}
              onPress={() => void handleThemeChange(option.mode)}
              className={cn(
                "flex-row items-center gap-3 px-4 py-4",
                index > 0 && "border-t border-line dark:border-line-dark",
              )}>
              <Ionicons name={option.icon} size={22} color={brand} />
              <AppText className="flex-1 font-semibold">{option.label}</AppText>

              {mode === option.mode && (
                <Ionicons name="checkmark-circle" size={22} color={brand} />
              )}
            </Pressable>
          ))}
        </Card>
      </View>

      <View className="gap-2">
        <AppText variant="label">Hệ đo lường</AppText>

        <Card className="overflow-hidden">
          {MEASUREMENT_OPTIONS.map((option, index) => (
            <Pressable
              key={option.value}
              disabled={saving}
              onPress={() => void handleMeasurementChange(option.value)}
              className={cn(
                "flex-row items-center gap-3 px-4 py-4",
                index > 0 && "border-t border-line dark:border-line-dark",
              )}>
              <View className="flex-1 gap-1">
                <AppText className="font-semibold">{option.label}</AppText>
                <AppText variant="caption" style={{ color: palette.muted }}>
                  {option.description}
                </AppText>
              </View>

              {measurementSystem === option.value && (
                <Ionicons name="checkmark-circle" size={22} color={brand} />
              )}
            </Pressable>
          ))}
        </Card>
      </View>

      {saving && (
        <AppText variant="caption" style={{ color: palette.muted }}>
          Đang lưu cài đặt...
        </AppText>
      )}
    </Screen>
  );
}
