import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageScreen } from "@/components/ui/PageScreen";
import { TextField } from "@/components/ui/TextField";
import { brand } from "@/core/theme/colors";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { confirmAction, notify } from "@/core/ui/dialogs";
import { useAdminAccess } from "@/features/admin/useAdminAccess";
import { useCallback, useEffect, useState } from "react";
import { IngredientCategoryRequest, IngredientCategoryResponse } from "@/types";
import { ingredientService } from "@/core/di/container";
import { Screen } from "@/components/ui/Screen";
export default function IngredientCategoriesScreen() {
  const { isAdmin } = useAdminAccess();

  const [categories, setCategories] = useState<IngredientCategoryResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [keyword, setKeyword] = useState("");

  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<IngredientCategoryResponse | null>(
    null,
  );

  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await ingredientService.listCategories();
      setCategories(data);
    } catch {
      Alert.alert("Lỗi", "Không tải được danh mục nguyên liệu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const openForm = (category?: IngredientCategoryResponse) => {
    setEditing(category ?? null);
    setCode(category?.code ?? "");
    setName(category?.name ?? "");
    setVisible(true);
  };

  const saveCategory = async () => {
    const body: IngredientCategoryRequest = {
      code: code.trim().toUpperCase(),
      name: name.trim(),
    };

    if (!/^[A-Z][A-Z0-9_]{1,49}$/.test(body.code)) {
      Alert.alert(
        "Thông báo",
        "Mã phải viết hoa, dùng chữ, số hoặc dấu _, tối thiểu 2 ký tự.",
      );
      return;
    }

    if (!body.name) {
      Alert.alert("Thông báo", "Vui lòng nhập tên danh mục.");
      return;
    }

    try {
      setSaving(true);

      if (editing) {
        await ingredientService.updateCategory(editing.id, body);
      } else {
        await ingredientService.createCategory(body);
      }

      setVisible(false);
      await loadCategories();
    } catch {
      Alert.alert(
        "Lỗi",
        "Không lưu được danh mục. Hãy kiểm tra quyền Admin và dữ liệu.",
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = (category: IngredientCategoryResponse) => {
    Alert.alert("Xóa danh mục", `Bạn có chắc muốn xóa "${category.name}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await ingredientService.removeCategory(category.id);
            await loadCategories();
          } catch {
            Alert.alert(
              "Không thể xóa",
              "Danh mục có thể vẫn đang chứa nguyên liệu.",
            );
          }
        },
      },
    ]);
  };

  const filtered = categories.filter((item) => {
    const text = keyword.trim().toLowerCase();
    return (
      item.name.toLowerCase().includes(text) ||
      item.code.toLowerCase().includes(text)
    );
  });

  return (
    <PageScreen title="Danh mục nguyên liệu">
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Danh mục nguyên liệu</Text>
          <Text style={styles.subtitle}>{categories.length} danh mục</Text>
        </View>

        {isAdmin && (
          <Pressable style={styles.addButton} onPress={() => openForm()}>
            <Text style={styles.addText}>+ Thêm</Text>
          </Pressable>
        )}
      </View>

      <TextInput
        style={styles.search}
        placeholder="Tìm theo tên hoặc mã..."
        value={keyword}
        onChangeText={setKeyword}
      />

      {loading ? (
        <ActivityIndicator size="large" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={() => void loadCategories()}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            <Text style={styles.empty}>Không có danh mục nào.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.code}>{item.code}</Text>
              </View>

              {isAdmin && (
                <View style={styles.actions}>
                  <Pressable onPress={() => openForm(item)}>
                    <Text style={styles.edit}>Sửa</Text>
                  </Pressable>
                  <Pressable onPress={() => deleteCategory(item)}>
                    <Text style={styles.delete}>Xóa</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}
        />
      )}

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>
              {editing ? "Sửa danh mục" : "Thêm danh mục"}
            </Text>

            <Text style={styles.label}>Mã danh mục</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: VEGETABLE"
              value={code}
              onChangeText={(value) =>
                setCode(value.toUpperCase().replace(/\s/g, "_"))
              }
              autoCapitalize="characters"
              maxLength={50}
            />

            <Text style={styles.label}>Tên danh mục</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Rau củ"
              value={name}
              onChangeText={setName}
              maxLength={255}
            />

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setVisible(false)}
                disabled={saving}>
                <Text>Hủy</Text>
              </Pressable>

              <Pressable
                style={styles.saveButton}
                onPress={() => void saveCategory()}
                disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveText}>Lưu</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </PageScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222222",
  },
  subtitle: {
    color: "#777777",
    marginTop: 4,
  },
  addButton: {
    backgroundColor: "#83B0D4",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  search: {
    backgroundColor: "#F1F1F1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    gap: 12,
  },
  iconText: {
    fontSize: 23,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222222",
  },
  code: {
    fontSize: 12,
    color: "#888888",
    marginTop: 4,
  },
  actions: {
    gap: 12,
  },
  edit: {
    color: "#2876B8",
    fontWeight: "600",
  },
  delete: {
    color: "#D93636",
    fontWeight: "600",
  },
  empty: {
    textAlign: "center",
    color: "#777777",
    marginTop: 32,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#EEEEEE",
  },
  saveButton: {
    padding: 12,
    minWidth: 80,
    alignItems: "center",
    borderRadius: 8,
    backgroundColor: "#2876B8",
  },
  saveText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
