// SavedHub
import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { cn } from "@/components/ui/cn";
import { SAVED_TABS } from "@/features/saved/mock";
import { SavedRecipeList } from "@/components/saved/SavedRecipeList";
import { CollectionList } from "@/components/ui/CollectionList";
import { CustomRecipeList } from "@/features/savedRecipes/CustomRecipeList";

export default function SavedHub() {
  const [tab, setTab] = useState<(typeof SAVED_TABS)[number]>("Tất cả");

  const header = (
    <View className="gap-4">
      <AppText variant="title">Đã lưu</AppText>
      <View className="flex-row rounded-full bg-soft p-1 dark:bg-soft-dark">
        {SAVED_TABS.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className={cn(
              "flex-1 items-center rounded-full py-2.5",
              t === tab && "bg-brand",
            )}>
            <AppText
              className={cn("text-sm font-bold", t === tab && "text-white")}>
              {t}
            </AppText>
          </TouchableOpacity>
        ))}
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
    <Screen>
      {header}
      <CollectionList />
    </Screen>
  );
}
