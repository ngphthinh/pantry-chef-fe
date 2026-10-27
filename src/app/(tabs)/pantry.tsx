import { useState } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Screen } from "@/components/ui/Screen";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { PANTRY_ITEMS, type Freshness } from "@/features/pantry/mock";

const TONE = {
  fresh: "success",
  soon: "warn",
  expired: "danger",
} as const satisfies Record<Freshness, string>;
const FILTERS = ["Tất cả", "Rau củ", "Thịt", "Hải sản"];
const ACTIONS: {
  title: string;
  route: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { title: "Quét mã vạch", route: "/pantry/barcode", icon: "barcode-outline" },
  { title: "Quét ảnh bằng AI", route: "/pantry/scan", icon: "camera-outline" },
  { title: "Thêm thủ công", route: "/pantry/new", icon: "create-outline" },
  {
    icon: "swap-horizontal-outline",
    title: "Nguyên liệu thay thế",
    route: "ai/substitutions",
  },
];

export default function PantryHub() {
  const router = useRouter();
  const { brand, palette } = useAppTheme();
  const [filter, setFilter] = useState("Tất cả");
  const [fabOpen, setFabOpen] = useState(false);
  const items = PANTRY_ITEMS.filter(
    (i) => filter === "Tất cả" || i.group === filter,
  );
  const groups = [...new Set(items.map((i) => i.group))];

  return (
    <View className="flex-1">
      <Screen>
        <AppText variant="title">Tủ nguyên liệu</AppText>
        <View className="flex-row flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Chip
              key={f}
              label={f}
              selected={f === filter}
              onPress={() => setFilter(f)}
            />
          ))}
        </View>

        <Pressable
          onPress={() => router.push("/pantry/expiring" as Href)}
          className="flex-row items-center gap-3 rounded-3xl bg-warnBg p-4 dark:bg-warnBg-dark">
          <Ionicons name="warning-outline" size={24} color={palette.warnInk} />
          <View className="flex-1">
            <AppText className="font-bold text-warnInk dark:text-warnInk-dark">
              3 nguyên liệu sắp hết hạn
            </AppText>
            <AppText
              variant="caption"
              className="text-warnInk dark:text-warnInk-dark">
              pantry/expiring
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={palette.warnInk} />
        </Pressable>

        {groups.map((g) => (
          <View key={g} className="gap-2">
            <AppText variant="label">{g}</AppText>
            {items
              .filter((i) => i.group === g)
              .map((i) => (
                <Pressable
                  key={i.id}
                  onPress={() => router.push(`/pantry/${i.id}` as Href)}>
                  <Card className="flex-row items-center justify-between p-4">
                    <View>
                      <AppText variant="heading">{i.name}</AppText>
                      <AppText variant="caption">
                        {i.qty} · {i.place}
                      </AppText>
                    </View>
                    <Badge label={i.label} tone={TONE[i.freshness]} />
                  </Card>
                </Pressable>
              ))}
          </View>
        ))}
      </Screen>

      <View
        className="absolute bottom-5 right-5 items-end gap-3"
        pointerEvents="box-none">
        {fabOpen &&
          ACTIONS.map((a) => (
            <Pressable
              key={a.route}
              onPress={() => {
                setFabOpen(false);
                router.push(a.route as Href);
              }}
              className="flex-row items-center gap-3">
              <Card className="flex-row items-center justify-between px-4 py-2 gap-1">
                <AppText className="font-bold">{a.title}</AppText>
                <Ionicons name={a.icon} size={22} color={brand ?? "#000000"} />
              </Card>
            </Pressable>
          ))}
        <Pressable
          onPress={() => setFabOpen((o) => !o)}
          className="h-14 w-14 items-center justify-center rounded-full bg-brand">
          <Ionicons name={fabOpen ? "close" : "add"} size={28} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}
