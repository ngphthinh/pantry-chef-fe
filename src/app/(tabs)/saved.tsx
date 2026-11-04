// SavedHub
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { SAVED_TABS } from "@/features/saved/mock";
import { SavedRecipeList } from "@/components/saved/SavedRecipeList";
import { CollectionList } from "@/components/ui/CollectionList";
import { CustomRecipeList } from "@/features/savedRecipes/CustomRecipeList";
import { useTheme } from "@/theme";

export default function SavedHub() {
  const [tab, setTab] = useState<(typeof SAVED_TABS)[number]>("Tất cả");
  const { colors, radius, shadows } = useTheme();

  const header = (
    <View className="gap-4">
      <AppText variant="title">Đã lưu</AppText>
      <View
        style={[
          styles.segmentContainer,
          {
            backgroundColor: colors.surfaceVariant,
            borderRadius: radius.full,
          },
        ]}>
        {SAVED_TABS.map((t) => {
          const isActive = t === tab;
          return (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              style={[
                styles.segmentItem,
                {
                  borderRadius: radius.full,
                  backgroundColor: isActive ? colors.primary : "transparent",
                },
                isActive ? shadows.sm : null,
              ]}>
              <AppText
                style={{
                  color: isActive ? colors.textOnPrimary : colors.textSecondary,
                  fontWeight: isActive ? "700" : "600",
                  fontSize: 13,
                }}>
                {t}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  if (tab === "Tất cả" || tab === "Yêu thích") {
    return (
      <SavedRecipeList favoriteOnly={tab === "Yêu thích"} header={header} />
    );
  }

  if (tab === "Tự tạo") {
    return <CustomRecipeList header={header} />;
  }

  return (
    <View className="flex-1">
      <CollectionList header={header} />
    </View>
  );
}

const styles = StyleSheet.create({
  segmentContainer: {
    flexDirection: "row",
    padding: 4,
    alignItems: "center",
  },
  segmentItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
});
