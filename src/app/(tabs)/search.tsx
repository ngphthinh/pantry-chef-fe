import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { MenuGroup, type MenuItem } from '@/components/ui/MenuGroup';
import { Screen } from '@/components/ui/Screen';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { PANTRY_CHIPS } from '@/features/search/mock';

const SHORTCUTS: MenuItem[] = [
  { icon: 'briefcase-outline', title: 'Gợi ý theo tủ của tôi', route: 'search/suggestions' },
  { icon: 'search-outline', title: 'Khám phá món', route: 'search/discover' },
  { icon: 'sparkles-outline', title: 'Ý tưởng từ AI', route: 'ai/ideas' },
];

export default function SearchHub() {
  const router = useRouter();
  const { palette } = useAppTheme();
  const [selected, setSelected] = useState<string[]>(['Cà chua', 'Trứng gà', 'Hành lá']);
  const toggle = (c: string) => setSelected((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  const go = (route: string) => router.push(`/${route}` as Href);

  return (
    <Screen>
      <AppText variant="title">Tìm món</AppText>
      <TextInput
        placeholder="Tìm theo tên món"
        placeholderTextColor={palette.muted}
        className="h-12 rounded-full border border-line bg-surface px-4 text-base text-ink dark:border-line-dark dark:bg-surface-dark dark:text-ink-dark"
      />
      <AppText variant="label">Nguyên liệu trong tủ</AppText>
      <View className="flex-row flex-wrap gap-2">
        {PANTRY_CHIPS.map((c) => <Chip key={c} label={c} selected={selected.includes(c)} onPress={() => toggle(c)} />)}
      </View>
      <Button title={`Tìm công thức (${selected.length} nguyên liệu)`} onPress={() => go('search/results')} />
      <MenuGroup title="Lối tắt" items={SHORTCUTS} onNavigate={go} />
    </Screen>
  );
}
