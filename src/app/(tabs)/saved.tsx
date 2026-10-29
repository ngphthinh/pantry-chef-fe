import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { cn } from '@/components/ui/cn';
import { SAVED_RECIPES, SAVED_TABS } from '@/features/saved/mock';
import { SavedRecipeList } from '@/components/saved/SavedRecipeList';
import { CollectionList } from '@/components/ui/CollectionList';

const USE_REAL_DATA = true;

export default function SavedHub() {
    const router = useRouter();
    const [tab, setTab] = useState<(typeof SAVED_TABS)[number]>('Tất cả');

    const header = (
        <View className="gap-4">
            <AppText variant="title">Đã lưu</AppText>
            <View className="flex-row rounded-full bg-soft p-1 dark:bg-soft-dark">
                {SAVED_TABS.map((t) => (
                    <Pressable key={t} onPress={() => setTab(t)} className={cn('flex-1 items-center rounded-full py-2.5', t === tab && 'bg-brand')}>
                        <AppText className={cn('text-sm font-bold', t === tab && 'text-white')}>{t}</AppText>
                    </Pressable>
                ))}
            </View>
        </View>
    );

    if (USE_REAL_DATA && (tab === 'Tất cả' || tab === 'Yêu thích')) {
        return <SavedRecipeList favoriteOnly={tab === 'Yêu thích'} header={header} />;
    }

    return (
        <Screen>
            {header}
            {USE_REAL_DATA && tab === 'Bộ sưu tập' && <CollectionList />}
            {(!USE_REAL_DATA || tab === 'Tự tạo') && (
                <View className="flex-row flex-wrap justify-between gap-y-3">
                    {SAVED_RECIPES.map((r) => (
                        <Pressable key={r.id} className="w-[48.5%]" onPress={() => router.push(`/recipe/saved/${r.id}` as Href)}>
                            <Card className="overflow-hidden">
                                <View className="h-28 bg-soft dark:bg-soft-dark" />
                                <View className="p-3">
                                    <AppText className="font-bold">{r.title}</AppText>
                                    <AppText variant="caption">{r.meta}</AppText>
                                </View>
                            </Card>
                        </Pressable>
                    ))}
                </View>
            )}
        </Screen>
    );
}