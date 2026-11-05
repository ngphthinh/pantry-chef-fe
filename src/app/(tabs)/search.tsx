import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { MenuGroup, type MenuItem } from '@/components/ui/MenuGroup';
import { Screen } from '@/components/ui/Screen';
import { TactileButton } from '@/components/ui/TactileButton';
import { useTheme } from '@/theme';
import { useRecipeSearchHub } from '@/features/recipe/useRecipeSearchHub';

const SHORTCUTS: MenuItem[] = [
  {
    icon: 'briefcase',
    title: 'Gợi ý theo tủ của tôi',
    subtitle: 'Nấu ngay từ những gì bạn đang có sẵn',
    route: 'search/suggestions',
  },
  {
    icon: 'compass',
    title: 'Khám phá món',
    subtitle: 'Xu hướng ẩm thực & công thức phong phú',
    route: 'search/discover',
  },
  {
    icon: 'sparkles',
    title: 'Ý tưởng từ AI',
    subtitle: 'Đầu bếp AI sáng tạo thực đơn tức thì',
    route: 'ai/ideas',
  },
];

export default function SearchHub() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const hub = useRecipeSearchHub();
  const go = (route: string) => router.push(`/${route}` as Href);

  const searchByName = () => {
    if (hub.prepareNameSearch()) go('search/results');
  };

  const searchByIngredients = () => {
    if (hub.prepareSearch()) go('search/results');
  };

  const isAllSelected = hub.selectedCount === hub.pantryNames.length && hub.pantryNames.length > 0;

  return (
    <Screen>
      {/* 1. Header */}
      <View style={styles.header}>
        <AppText variant="title">Tìm món</AppText>
        <AppText variant="caption">
          Tìm kiếm công thức nấu ăn ngon từ nguyên liệu sẵn có
        </AppText>
      </View>

      {/* 2. Modern Search Capsule */}
      <View
        style={[
          styles.searchBar,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
        className="flex-row items-center">
        <Ionicons name="search" size={20} color={colors.primary} />
        <TextInput
          value={hub.keyword}
          onChangeText={hub.setKeyword}
          onSubmitEditing={searchByName}
          returnKeyType="search"
          placeholder="Tìm theo tên món (Phở, Bún bò, Canh...)"
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.textPrimary }]}
        />
        {hub.keyword ? (
          <Pressable onPress={() => hub.setKeyword('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </Pressable>
        ) : null}
      </View>

      {/* 3. Lối tắt khám phá nhanh (Bento Quick Shortcuts) */}
      <MenuGroup title="Khám phá nhanh" items={SHORTCUTS} onNavigate={go} />

      {/* 4. Nấu theo nguyên liệu trong tủ */}
      <View style={styles.pantrySection}>
        <Card style={styles.pantryCard}>
          {/* Card Header with Counter & Quick Select/Deselect */}
          <View style={styles.sectionHeader} className="flex-row items-center justify-between">
            <View style={styles.sectionTitleRow} className="flex-row items-center">
              <View
                style={[
                  styles.cubeBadge,
                  {
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.18)' : '#DCFCE7',
                  },
                ]}>
                <Ionicons name="cube" size={16} color={colors.primary} />
              </View>
              <View>
                <AppText style={styles.sectionTitle}>Nguyên liệu trong tủ</AppText>
                <AppText style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                  Chọn nguyên liệu muốn nấu ({hub.selectedCount}/{hub.pantryNames.length})
                </AppText>
              </View>
            </View>

            {hub.pantryNames.length > 0 && (
              <Pressable
                onPress={isAllSelected ? hub.clearAll : hub.selectAll}
                hitSlop={8}
                style={[
                  styles.toggleBtn,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.border,
                  },
                ]}
                className="flex-row items-center active:scale-95">
                <AppText
                  style={{
                    color: colors.primary,
                    fontSize: 12,
                    fontWeight: '700',
                  }}>
                  {isAllSelected ? 'Bỏ chọn hết' : 'Chọn tất cả'}
                </AppText>
              </Pressable>
            )}
          </View>

          {/* Chips Grid */}
          {hub.isPantryLoading && hub.pantryNames.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : hub.pantryNames.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="basket-outline"
                size={32}
                color={colors.textSecondary}
              />
              <AppText variant="caption" style={styles.emptyText}>
                Tủ của bạn đang trống. Hãy thêm nguyên liệu vào tủ để gợi ý món thông minh nhé!
              </AppText>
            </View>
          ) : (
            <View style={styles.chipsContainer} className="flex-row flex-wrap">
              {hub.pantryNames.map((name) => (
                <Chip
                  key={name}
                  label={name}
                  selected={hub.selected.includes(name)}
                  onPress={() => hub.toggle(name)}
                />
              ))}
            </View>
          )}

          {/* CTA Action Button */}
          {hub.pantryNames.length > 0 && (
            <View style={styles.btnWrapper}>
              <TactileButton
                title="Tìm công thức"
                disabled={hub.selectedCount === 0}
                onPress={searchByIngredients}
                variant="accent"
                iconName="restaurant"
              />
            </View>
          )}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 6,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    borderWidth: 1.2,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  pantrySection: {
    marginTop: 6,
  },
  pantryCard: {
    padding: 16,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cubeBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 4,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  emptyText: {
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  btnWrapper: {
    marginTop: 4,
  },
});
