import React from "react";
import { Platform, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTheme } from "@/theme";

const TAB_ITEMS: {
  name: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}[] = [
  { name: "pantry", title: "Tủ", icon: "briefcase-outline", activeIcon: "briefcase" },
  { name: "search", title: "Tìm món", icon: "search-outline", activeIcon: "search" },
  { name: "saved", title: "Đã lưu", icon: "bookmark-outline", activeIcon: "bookmark" },
  { name: "meal-plan", title: "Thực đơn", icon: "calendar-outline", activeIcon: "calendar" },
  { name: "more", title: "Thêm", icon: "ellipsis-horizontal-outline", activeIcon: "ellipsis-horizontal" },
];

export default function TabsLayout() {
  const { colors, shadows } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontWeight: "600",
          fontSize: 11,
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 62,
          paddingTop: 6,
          paddingBottom: Platform.OS === "ios" ? 28 : 8,
          ...shadows.sm,
        },
      }}>
      {TAB_ITEMS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons
                name={focused ? t.activeIcon : t.icon}
                size={size}
                color={String(color)}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
