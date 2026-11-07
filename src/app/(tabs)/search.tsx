import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useRouter, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { MenuGroup, type MenuItem } from "@/components/ui/MenuGroup";
import { Screen } from "@/components/ui/Screen";
import { TactileButton } from "@/components/ui/TactileButton";
import { useTheme } from "@/theme";
import { useRecipeSearchHub } from "@/features/recipe/useRecipeSearchHub";
import { PantryPickerModal } from "@/components/ui/PantryPickerModal";

const SHORTCUTS: MenuItem[] = [
  {
    icon: "briefcase",
    title: "Gợi ý theo tủ của tôi",
    subtitle: "Nấu ngay từ những gì bạn đang có sẵn",
    route: "search/suggestions",
  },
  {
    icon: "compass",
    title: "Khám phá món",
    subtitle: "Xu hướng ẩm thực & công thức phong phú",
    route: "search/discover",
  },
  {
    icon: "sparkles",
    title: "Ý tưởng từ AI",
    subtitle: "Đầu bếp AI sáng tạo thực đơn tức thì",
    route: "ai/ideas",
  },
];

const PREVIEW_LIMIT = 6;

export default function SearchHub() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const hub = useRecipeSearchHub();
  const [pickerOpen, setPickerOpen] = useState(false);
  const go = (route: string) => router.push(`/${route}` as Href);
  const applySelection = (next: string[]) => {
    const cur = new Set(hub.selected);
    const nxt = new Set(next);
    new Set([...cur, ...nxt]).forEach((n) => {
      if (cur.has(n) !== nxt.has(n)) hub.toggle(n);
    });
  };
  const searchByName = () => {
    if (hub.prepareNameSearch()) go("search/results");
  };

  const searchByIngredients = () => {
    if (hub.prepareSearch()) go("search/results");
  };

  const hasPantry = !hub.isPantryLoading && hub.pantryNames.length > 0;
  const preview = hub.selected.slice(0, PREVIEW_LIMIT);
  const extra = hub.selected.length - preview.length;

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
          { backgroundColor: colors.surface, borderColor: colors.border },
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
          <Pressable onPress={() => hub.setKeyword("")} hitSlop={8}>
            <Ionicons
              name="close-circle"
              size={18}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>

      {/* 3. Lối tắt khám phá nhanh */}
      <MenuGroup title="Khám phá nhanh" items={SHORTCUTS} onNavigate={go} />

      {/* 4. Nấu theo nguyên liệu trong tủ */}
      <View style={styles.pantrySection}>
        <Card style={styles.pantryCard}>
          <View
            style={styles.sectionHeader}
            className="flex-row items-center justify-between">
            <View
              style={styles.sectionTitleRow}
              className="flex-row items-center">
              <View
                style={[
                  styles.cubeBadge,
                  {
                    backgroundColor: isDark
                      ? "rgba(16, 185, 129, 0.18)"
                      : "#DCFCE7",
                  },
                ]}>
                <Ionicons name="cube" size={16} color={colors.primary} />
              </View>
              <View>
                <AppText style={styles.sectionTitle}>
                  Nguyên liệu trong tủ
                </AppText>
                <AppText
                  style={[
                    styles.sectionSubtitle,
                    { color: colors.textSecondary },
                  ]}>
                  Đã chọn {hub.selectedCount}/{hub.pantryNames.length}
                </AppText>
              </View>
            </View>
          </View>

          {hub.isPantryLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : hub.pantryNames.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="basket-outline"
                size={32}
                color={colors.textSecondary}
              />
              <AppText variant="caption" style={styles.emptyText}>
                Tủ của bạn đang trống. Hãy thêm nguyên liệu vào tủ để gợi ý món
                thông minh nhé!
              </AppText>
            </View>
          ) : (
            <>
              {/* Nút mở màn chọn */}
              <Pressable
                onPress={() => setPickerOpen(true)}
                style={[
                  styles.pickerBtn,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.border,
                  },
                ]}
                className="active:opacity-70">
                <Ionicons name="list" size={18} color={colors.primary} />
                <AppText
                  style={[styles.pickerText, { color: colors.textPrimary }]}>
                  {hub.selectedCount === 0
                    ? "Chọn nguyên liệu muốn nấu"
                    : "Chỉnh sửa nguyên liệu đã chọn"}
                </AppText>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textSecondary}
                />
              </Pressable>

              {/* Xem trước các món đã chọn */}
              {hub.selectedCount > 0 && (
                <View
                  style={styles.chipsContainer}
                  className="flex-row flex-wrap">
                  {preview.map((name) => (
                    <Chip
                      key={name}
                      label={name}
                      selected
                      onPress={() => hub.toggle(name)}
                    />
                  ))}
                  {extra > 0 && (
                    <Pressable onPress={() => setPickerOpen(true)} hitSlop={6}>
                      <AppText
                        style={{ color: colors.primary, fontWeight: "700" }}>
                        +{extra} nữa
                      </AppText>
                    </Pressable>
                  )}
                </View>
              )}
            </>
          )}

          {hasPantry && (
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

      <PantryPickerModal
        visible={pickerOpen}
        names={hub.pantryNames}
        selected={hub.selected}
        onApply={applySelection}
        onClose={() => setPickerOpen(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 6 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
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
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
  pantrySection: { marginTop: 6 },
  pantryCard: { padding: 16, gap: 14 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  cubeBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  sectionSubtitle: { fontSize: 11, marginTop: 1 },
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pickerText: { flex: 1, fontSize: 14, fontWeight: "600" },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  loadingContainer: { paddingVertical: 20, alignItems: "center" },
  emptyContainer: { alignItems: "center", paddingVertical: 18, gap: 8 },
  emptyText: { textAlign: "center", paddingHorizontal: 16 },
  btnWrapper: { marginTop: 4 },
});
