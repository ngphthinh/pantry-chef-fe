import { TextInput, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Screen } from "@/components/ui/Screen";
import { BackHeader } from "@/components/recipe/BackHeader";
import { RecipeList } from "@/components/recipe/RecipeList";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { useOpenRecipe } from "@/features/recipe/useOpenRecipe";
import {
  useRecipeDiscover,
  type DiscoverMode,
} from "@/features/recipe/useRecipeDiscover";

const MODES: { mode: DiscoverMode; label: string }[] = [
  { mode: "random", label: "Ngẫu nhiên" },
  { mode: "name", label: "Theo tên" },
];

export default function DiscoverScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const { palette } = useAppTheme();
  const discover = useRecipeDiscover(q ?? "");
  const openRecipe = useOpenRecipe();

  const header = (
    <View className="gap-3 pb-3">
      <View className="flex-row gap-2">
        {MODES.map((item) => (
          <Chip
            key={item.mode}
            label={item.label}
            selected={discover.mode === item.mode}
            onPress={() => discover.setMode(item.mode)}
          />
        ))}
      </View>

      {discover.mode === "name" ? (
        <TextInput
          value={discover.keyword}
          onChangeText={discover.setKeyword}
          autoFocus={!q}
          placeholder="Nhập tên món, ví dụ: pasta"
          placeholderTextColor={palette.muted}
          className="h-12 rounded-full border border-line bg-surface px-4 text-base text-ink dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark"
        />
      ) : null}

      {discover.mode === "random" ? (
        <Button
          title="Gợi ý món khác"
          variant="primary"
          loading={discover.isLoading}
          onPress={discover.reroll}
        />
      ) : null}

      {discover.needsKeyword ? (
        <AppText variant="caption">Gõ tên món để bắt đầu tìm.</AppText>
      ) : null}
    </View>
  );

  return (
    <Screen scroll={false}>
      <BackHeader
        title="Khám phá món"
        subtitle="Món của bạn và món từ kho công thức"
      />
      <RecipeList
        items={discover.items}
        isLoading={discover.isLoading}
        isLoadingMore={discover.isLoadingMore}
        error={discover.error}
        isEmpty={discover.isEmpty}
        emptyTitle="Không tìm thấy món"
        emptyMessage="Thử một từ khóa khác."
        header={header}
        onPressItem={openRecipe}
        onEndReached={discover.hasNext ? discover.loadMore : undefined}
      />
    </Screen>
  );
}