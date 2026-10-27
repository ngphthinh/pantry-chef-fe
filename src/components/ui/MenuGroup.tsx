import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { AppText } from "./AppText";
import { Card } from "./Card";
import { cn } from "./cn";

export interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  route: string;
  tone?: "default" | "danger";
  onPress?: (input?: any) => void;
}

interface MenuGroupProps {
  title?: string;
  items: MenuItem[];
  onNavigate: (route: string) => void;
}

export function MenuGroup({ title, items, onNavigate }: MenuGroupProps) {
  const { palette, brand } = useAppTheme();
  return (
    <View className="gap-2">
      {title ? <AppText variant="label">{title}</AppText> : null}
      <Card className="overflow-hidden">
        {items.map((item, i) => {
          const danger = item.tone === "danger";
          return (
            <Pressable
              key={item.route + item.title}
              onPress={item.onPress ?? (() => onNavigate(item.route))}
              className={cn(
                "flex-row items-center gap-3 px-4 py-3 active:opacity-70",
                i > 0 && "border-t border-line dark:border-line-dark",
              )}>
              <Ionicons
                name={item.icon}
                size={22}
                color={danger ? palette.dangerInk : brand}
              />
              <View className="flex-1">
                <AppText
                  className={cn(
                    "font-bold",
                    danger && "text-dangerInk dark:text-dangerInk-dark",
                  )}>
                  {item.title}
                </AppText>
                <AppText variant="caption">{item.route}</AppText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={palette.muted}
              />
            </Pressable>
          );
        })}
      </Card>
    </View>
  );
}
