import { ActivityIndicator, TextInput, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { MenuGroup, type MenuItem } from '@/components/ui/MenuGroup';
import { Screen } from '@/components/ui/Screen';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { useRecipeSearchHub } from '@/features/recipe/useRecipeSearchHub';

const SHORTCUTS: MenuItem[] = [
  { icon: 'briefcase-outline', title: 'Gợi ý theo tủ của tôi', route: 'search/suggestions' },
  { icon: 'sparkles-outline', title: 'Ý tưởng từ AI', route: 'ai/ideas' },
];

export default function SearchHub() {
  const router = useRouter();
  const { palette, brand } = useAppTheme();
  const hub = useRecipeSearchHub();
  const go = (route: string) => router.push(`/${route}` as Href);

  const searchByName = () => {
    if (hub.prepareNameSearch()) go('search/results');
  };

  const searchByIngredients = () => {
    if (hub.prepareSearch()) go('search/results');
  };

  return (
    <Screen>
      <AppText variant="title">Tìm món</AppText>
      <TextInput
        value={hub.keyword}
        onChangeText={hub.setKeyword}
        onSubmitEditing={searchByName}
        returnKeyType="search"
        placeholder="Tìm theo tên món"
        placeholderTextColor={palette.muted}
        className="h-12 rounded-full border border-line bg-surface px-4 text-base text-ink dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark"
      />

      <View className="flex-row items-center justify-between">
        <AppText variant="label">Nguyên liệu trong tủ</AppText>
        <AppText variant="caption">Đã chọn {hub.selectedCount}</AppText>
      </View>

      {hub.isPantryLoading && hub.pantryNames.length === 0 ? (
        <ActivityIndicator color={brand} />
      ) : hub.pantryNames.length === 0 ? (
        <AppText variant="caption">
          Tủ của bạn đang trống. Thêm nguyên liệu vào tủ để tìm món theo những gì đang có.
        </AppText>
      ) : (
        <View className="flex-row flex-wrap gap-2">
          {hub.pantryNames.map((name) => (
            <Chip key={name} label={name} selected={hub.selected.includes(name)} onPress={() => hub.toggle(name)} />
          ))}
        </View>
      )}

      <Button
        title={`Tìm công thức (${hub.selectedCount} nguyên liệu)`}
        disabled={hub.selectedCount === 0}
        onPress={searchByIngredients}
      />
      <MenuGroup title="Lối tắt" items={SHORTCUTS} onNavigate={go} />
    </Screen>
  );
}
