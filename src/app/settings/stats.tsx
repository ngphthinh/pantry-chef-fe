import { ActivityIndicator, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {type Href } from "expo-router";
import {BackHeader} from "@/components/ui/BackHeader";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { brand } from "@/core/theme/colors";
import { useStats } from "@/features/stats/useStats";

const ROWS = [
    { key: "savedRecipeCount", label: "Món đã lưu", icon: "bookmark-outline" },
    { key: "collectionCount", label: "Bộ sưu tập", icon: "folder-outline" },
    { key: "cookedCount", label: "Món đã nấu", icon: "restaurant-outline" },
    { key: "wastedItemCount", label: "Nguyên liệu bị bỏ phí", icon: "trash-outline" },
] as const;

export default function StatsScreen() {
    const { stats, error, isLoading, reload } = useStats();

    return (
        <Screen>
            <BackHeader title="Thống kê của tôi" fallbackHref={"/more" as Href} />

            {isLoading && <ActivityIndicator color={brand.DEFAULT} />}

            {!isLoading && !stats && (
                <View className="items-center gap-3">
                    <AppText variant="caption">{error ?? "Chưa có dữ liệu."}</AppText>
                    <Pressable onPress={() => void reload()}>
                        <AppText className="font-bold text-brand">Thử lại</AppText>
                    </Pressable>
                </View>
            )}

            {stats &&
                ROWS.map((r) => (
                    <Card key={r.key} className="flex-row items-center gap-4 p-4">
                        <Ionicons name={r.icon} size={22} color={brand.DEFAULT} />
                        <AppText className="flex-1">{r.label}</AppText>
                        <AppText variant="heading">{stats[r.key]}</AppText>
                    </Card>
                ))}
        </Screen>
    );
}