import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, View } from "react-native";
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
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    mode: "light",
    label: "Sáng",
    description: "Nền sáng, dễ nhìn ban ngày",
    icon: "sunny",
  },
  {
    mode: "dark",
    label: "Tối",
    description: "Nền tối, dịu mắt ban đêm",
    icon: "moon",
  },
  {
    mode: "system",
    label: "Theo hệ thống",
    description: "Tự đổi theo cài đặt thiết bị",
    icon: "phone-portrait",
  },
];

const MEASUREMENT_OPTIONS: {
  value: MeasurementSystem;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    value: "METRIC",
    label: "Hệ mét",
    description: "kg, g, ml, l, °C",
    icon: "scale",
  },
  {
    value: "IMPERIAL",
    label: "Hệ Anh/Mỹ",
    description: "lb, oz, fl oz, °F",
    icon: "speedometer",
  },
];

function SectionTitle({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  const { brand } = useAppTheme();
  return (
    <View className="flex-row items-center gap-2 px-1">
      <View className="h-8 w-8 items-center justify-center rounded-xl bg-brandSoft dark:bg-surface-dark">
        <Ionicons name={icon} size={16} color={brand} />
      </View>
      <AppText variant="heading" className="text-base">
        {label}
      </AppText>
    </View>
  );
}

function OptionRow({
  icon,
  label,
  description,
  selected,
  disabled,
  bordered,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  selected: boolean;
  disabled: boolean;
  bordered: boolean;
  onPress: () => void;
}) {
  const { brand, palette } = useAppTheme();
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={cn(
        "flex-row items-center gap-3 p-4 active:bg-soft dark:active:bg-soft-dark",
        bordered && "border-t border-line dark:border-line-dark",
        selected && "bg-brandSoft/40 dark:bg-surface-dark",
      )}>
      <View
        className={cn(
          "h-11 w-11 items-center justify-center rounded-2xl",
          selected ? "bg-brand" : "bg-soft dark:bg-soft-dark",
        )}>
        <Ionicons
          name={icon}
          size={20}
          color={selected ? "#FFFFFF" : palette.muted}
        />
      </View>

      <View className="flex-1 gap-0.5">
        <AppText className={cn("font-semibold", selected && "text-brand")}>
          {label}
        </AppText>
        <AppText variant="caption">{description}</AppText>
      </View>

      {selected ? (
        <Ionicons name="checkmark-circle" size={24} color={brand} />
      ) : (
        <View className="h-6 w-6 rounded-full border-2 border-line dark:border-line-dark" />
      )}
    </Pressable>
  );
}

export default function PreferencesScreen() {
  const { mode, setMode, brand } = useAppTheme();
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
      <View className="gap-2.5">
        <SectionTitle icon="color-palette" label="Giao diện" />
        <Card className="overflow-hidden shadow-sm">
          {THEME_OPTIONS.map((option, index) => (
            <OptionRow
              key={option.mode}
              icon={option.icon}
              label={option.label}
              description={option.description}
              selected={mode === option.mode}
              disabled={saving}
              bordered={index > 0}
              onPress={() => void handleThemeChange(option.mode)}
            />
          ))}
        </Card>
      </View>

      <View className="gap-2.5">
        <SectionTitle icon="resize" label="Hệ đo lường" />
        <Card className="overflow-hidden shadow-sm">
          {MEASUREMENT_OPTIONS.map((option, index) => (
            <OptionRow
              key={option.value}
              icon={option.icon}
              label={option.label}
              description={option.description}
              selected={measurementSystem === option.value}
              disabled={saving}
              bordered={index > 0}
              onPress={() => void handleMeasurementChange(option.value)}
            />
          ))}
        </Card>
      </View>

      {saving && (
        <View className="flex-row items-center justify-center gap-2">
          <ActivityIndicator size="small" color={brand} />
          <AppText variant="caption">Đang lưu cài đặt...</AppText>
        </View>
      )}
    </Screen>
  );
}
