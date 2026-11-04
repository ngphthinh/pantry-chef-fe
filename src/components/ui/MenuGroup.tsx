import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/theme";
import { AppText } from "./AppText";
import { Card } from "./Card";

export interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  route: string;
  tone?: "default" | "danger";
  badge?: string;
  onPress?: (input?: any) => void;
}

interface MenuGroupProps {
  title?: string;
  items: MenuItem[];
  onNavigate: (route: string) => void;
}

function getIconTheme(icon: keyof typeof Ionicons.glyphMap, danger: boolean, isDark: boolean) {
  if (danger) {
    return {
      bg: isDark ? "rgba(239, 68, 68, 0.22)" : "#FEE2E2",
      color: isDark ? "#F87171" : "#DC2626",
    };
  }

  const iconName = String(icon);

  if (iconName.includes("cart") || iconName.includes("basket") || iconName.includes("warning")) {
    return {
      bg: isDark ? "rgba(245, 158, 11, 0.2)" : "#FEF3C7",
      color: isDark ? "#FBBF24" : "#D97706",
    };
  }

  if (iconName.includes("sparkles") || iconName.includes("calendar")) {
    return {
      bg: isDark ? "rgba(168, 85, 247, 0.2)" : "#F3E8FF",
      color: isDark ? "#C084FC" : "#9333EA",
    };
  }

  if (iconName.includes("compass") || iconName.includes("folder") || iconName.includes("stats") || iconName.includes("swap")) {
    return {
      bg: isDark ? "rgba(14, 165, 233, 0.2)" : "#E0F2FE",
      color: isDark ? "#38BDF8" : "#0284C7",
    };
  }

  if (iconName.includes("contrast") || iconName.includes("notifications") || iconName.includes("pricetag")) {
    return {
      bg: isDark ? "rgba(20, 184, 166, 0.2)" : "#CCFBF1",
      color: isDark ? "#2DD4BF" : "#0D9488",
    };
  }

  if (iconName.includes("lock") || iconName.includes("information") || iconName.includes("chatbubble") || iconName.includes("people") || iconName.includes("create")) {
    return {
      bg: isDark ? "rgba(99, 102, 241, 0.2)" : "#E0E7FF",
      color: isDark ? "#818CF8" : "#4F46E5",
    };
  }

  // Mặc định: Emerald thương hiệu
  return {
    bg: isDark ? "rgba(16, 185, 129, 0.2)" : "#DCFCE7",
    color: isDark ? "#34D399" : "#16A34A",
  };
}

export function MenuGroup({ title, items, onNavigate }: MenuGroupProps) {
  const { colors, isDark } = useTheme();

  return (
    <View style={styles.groupContainer}>
      {title ? (
        <AppText
          style={[
            styles.titleText,
            { color: isDark ? "#95A39B" : "#4B5563" },
          ]}>
          {title}
        </AppText>
      ) : null}
      <Card className="overflow-hidden p-0">
        {items.map((item, i) => {
          const danger = item.tone === "danger";
          const iconTheme = getIconTheme(item.icon, danger, isDark);

          return (
            <Pressable
              key={item.route + item.title}
              onPress={item.onPress ?? (() => onNavigate(item.route))}
              className="flex-row items-center px-4 py-3.5"
              style={({ pressed }) => [
                styles.itemRow,
                {
                  backgroundColor: pressed
                    ? isDark
                      ? "rgba(255, 255, 255, 0.06)"
                      : "rgba(0, 0, 0, 0.03)"
                    : "transparent",
                  borderTopColor: colors.divider,
                  borderTopWidth: i > 0 ? 1 : 0,
                },
              ]}>
              {/* Bento Rounded Square Icon Badge */}
              <View
                style={[
                  styles.iconBadge,
                  {
                    backgroundColor: iconTheme.bg,
                  },
                ]}>
                <Ionicons name={item.icon} size={20} color={iconTheme.color} />
              </View>

              {/* Title & Subtitle */}
              <View className="flex-1 justify-center pr-2" style={styles.textContainer}>
                <AppText
                  style={[
                    styles.itemTitle,
                    {
                      color: danger
                        ? isDark
                          ? "#F87171"
                          : "#DC2626"
                        : colors.textPrimary,
                    },
                  ]}
                  numberOfLines={1}>
                  {item.title}
                </AppText>
                {item.subtitle ? (
                  <AppText
                    style={[styles.itemSubtitle, { color: colors.textSecondary }]}
                    numberOfLines={1}>
                    {item.subtitle}
                  </AppText>
                ) : null}
              </View>

              {/* Optional Tag Badge */}
              {item.badge ? (
                <View
                  style={[
                    styles.tagBadge,
                    {
                      backgroundColor: colors.primarySoft,
                      borderColor: colors.primary,
                    },
                  ]}>
                  <AppText style={[styles.tagBadgeText, { color: colors.primary }]}>
                    {item.badge}
                  </AppText>
                </View>
              ) : null}

              {/* Chevron icon always aligned right */}
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textDisabled}
              />
            </Pressable>
          );
        })}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  groupContainer: {
    gap: 8,
    marginVertical: 4,
  },
  titleText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    paddingHorizontal: 4,
    marginBottom: 2,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    flexShrink: 0,
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  itemSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  tagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 6,
  },
  tagBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
