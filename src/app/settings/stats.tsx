import { ActivityIndicator, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { type Href } from "expo-router";

import { BackHeader } from "@/components/ui/BackHeader";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { useStats } from "@/features/stats/useStats";

type Tone = "brand" | "successInk" | "warnInk" | "dangerInk";

const ROWS: {
  key:
    | "savedRecipeCount"
    | "collectionCount"
    | "cookedCount"
    | "wastedItemCount";
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: Tone;
}[] = [
  {
    key: "savedRecipeCount",
    label: "Món đã lưu",
    icon: "bookmark",
    tone: "brand",
  },
  {
    key: "collectionCount",
    label: "Bộ sưu tập",
    icon: "folder",
    tone: "warnInk",
  },
  {
    key: "cookedCount",
    label: "Món đã nấu",
    icon: "restaurant",
    tone: "successInk",
  },
  {
    key: "wastedItemCount",
    label: "Nguyên liệu bị bỏ phí",
    icon: "trash",
    tone: "dangerInk",
  },
];

export default function StatsScreen() {
  const { stats, error, isLoading, reload } = useStats();
  const { brand, palette } = useAppTheme();

  const colorOf = (tone: Tone) => (tone === "brand" ? brand : palette[tone]);

  return (
    <Screen>
      <BackHeader title="Thống kê của tôi" fallbackHref={"/more" as Href} />

      {isLoading && (
        <View className="items-center py-16">
          <ActivityIndicator size="large" color={brand} />
          <AppText variant="caption" className="mt-3">
            Đang tải thống kê...
          </AppText>
        </View>
      )}

      {!isLoading && !stats && (
        <Card className="items-center gap-3 p-6 shadow-sm">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-dangerBg dark:bg-dangerBg-dark">
            <Ionicons name="stats-chart" size={26} color={palette.dangerInk} />
          </View>
          <AppText variant="caption" className="text-center">
            {error ?? "Chưa có dữ liệu."}
          </AppText>
          <Pressable
            onPress={() => void reload()}
            className="rounded-full bg-brandSoft px-5 py-2 active:scale-95 dark:bg-surface-dark">
            <AppText className="font-bold text-brand">Thử lại</AppText>
          </Pressable>
        </Card>
      )}

      {stats && (
        <View className="gap-4 pb-10">
          {/* Lưới 2x2 */}
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {ROWS.map((r) => {
              const color = colorOf(r.tone);
              return (
                <Card key={r.key} className="w-[48.5%] gap-3 p-4 shadow-sm">
                  <View
                    className="h-11 w-11 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${color}22` }}>
                    <Ionicons name={r.icon} size={22} color={color} />
                  </View>
                  <View>
                    <AppText
                      className="text-3xl font-extrabold"
                      style={{ color }}>
                      {stats[r.key]}
                    </AppText>
                    <AppText variant="caption" numberOfLines={2}>
                      {r.label}
                    </AppText>
                  </View>
                </Card>
              );
            })}
          </View>
        </View>
      )}
    </Screen>
  );
}
