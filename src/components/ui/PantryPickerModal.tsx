import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { TactileButton } from "@/components/ui/TactileButton";
import { useTheme } from "@/theme";
import { normalize } from "@/features/ingredient/ingredientMatch";

interface Props {
  visible: boolean;
  names: string[];
  /** Danh sách đã áp dụng; modal lấy làm bản nháp ban đầu mỗi lần mở. */
  selected: string[];
  onApply: (next: string[]) => void;
  onClose: () => void;
}

export function PantryPickerModal({
  visible,
  names,
  selected,
  onApply,
  onClose,
}: Props) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Set<string>>(() => new Set(selected));

  // mỗi lần mở: nháp = danh sách đang áp dụng
  useEffect(() => {
    if (visible) {
      setDraft(new Set(selected));
      setQuery("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const data = useMemo(() => {
    const q = normalize(query);
    return q ? names.filter((n) => normalize(n).includes(q)) : names;
  }, [names, query]);

  const toggle = (name: string) =>
    setDraft((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });

  // "Chọn tất cả" áp dụng cho các món đang hiển thị (đang lọc thì chỉ kết quả lọc)
  const allVisibleOn = data.length > 0 && data.every((n) => draft.has(n));
  const toggleVisible = () =>
    setDraft((prev) => {
      const next = new Set(prev);
      data.forEach((n) => (allVisibleOn ? next.delete(n) : next.add(n)));
      return next;
    });

  const apply = () => {
    // giữ thứ tự theo danh sách tủ; món đã chọn nhưng không còn trong tủ vẫn được giữ
    const ordered = [
      ...names.filter((n) => draft.has(n)),
      ...[...draft].filter((n) => !names.includes(n)),
    ];
    onApply(ordered);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <AppText style={styles.title}>Chọn nguyên liệu</AppText>
            <AppText variant="caption">
              Đã chọn {draft.size}/{names.length}
            </AppText>
          </View>
          {data.length > 0 && (
            <Pressable
              onPress={toggleVisible}
              hitSlop={8}
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.border,
                },
              ]}>
              <AppText
                style={{
                  color: colors.primary,
                  fontSize: 12,
                  fontWeight: "700",
                }}>
                {allVisibleOn
                  ? query
                    ? "Bỏ chọn kết quả"
                    : "Bỏ chọn hết"
                  : query
                    ? "Chọn kết quả"
                    : "Chọn tất cả"}
              </AppText>
            </Pressable>
          )}
          <Pressable onPress={onClose} hitSlop={8} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={colors.textPrimary} />
          </Pressable>
        </View>

        <View
          style={[
            styles.search,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Lọc nguyên liệu..."
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.textPrimary }]}
            autoCorrect={false}
          />
          {query ? (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textSecondary}
              />
            </Pressable>
          ) : null}
        </View>

        <FlatList
          data={data}
          keyExtractor={(n) => n}
          extraData={draft}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 16 }}
          ListEmptyComponent={
            <AppText variant="caption" style={styles.empty}>
              Không có nguyên liệu nào khớp "{query}".
            </AppText>
          }
          renderItem={({ item }) => {
            const on = draft.has(item);
            return (
              <Pressable
                onPress={() => toggle(item)}
                style={[styles.row, { borderColor: colors.border }]}
                className="active:opacity-70">
                <AppText style={[styles.rowText, on && { fontWeight: "700" }]}>
                  {item}
                </AppText>
                <Ionicons
                  name={on ? "checkbox" : "square-outline"}
                  size={22}
                  color={on ? colors.primary : colors.textSecondary}
                />
              </Pressable>
            );
          }}
        />

        <View
          style={[
            styles.footer,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}>
          <TactileButton
            title={`Áp dụng (${draft.size})`}
            onPress={apply}
            variant="accent"
            iconName="checkmark"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: { fontSize: 18, fontWeight: "700" },
  toggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
  },
  closeBtn: { padding: 4 },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1.2,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowText: { fontSize: 15, flex: 1, paddingRight: 12 },
  empty: { textAlign: "center", paddingVertical: 32 },
  footer: { paddingHorizontal: 16, paddingTop: 8 },
});
