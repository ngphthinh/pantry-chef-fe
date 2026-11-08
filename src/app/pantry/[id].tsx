import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { InlineCalendar } from "@/components/ui/InlineCalendar";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { useTheme } from "@/theme";
import { usePantry } from "@/features/pantry/usePantry";
import { pantryValidators } from "@/features/pantry/validation";
import { UNIT_LABEL, type StorageLocation } from "@/types";
import { toDisplayDate } from "@/core/format/datetime";
import { getErrorMessage } from "@/core/http/apiError";
import { validateImageSize } from "@/core/utils/imageValidation";

const TONE_MAP = {
  fresh: "success",
  soon: "warn",
  expired: "danger",
} as const;

export default function PantryItemDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const brand = colors.primary;
  const palette = {
    ink: colors.textPrimary,
    muted: colors.textSecondary,
    warnInk: colors.warning,
  };
  const {
    selectedItem,
    isLoading,
    isConsuming,
    isSaving,
    isUploading,
    loadItemById,
    consume,
    update,
    remove,
    uploadPhoto,
  } = usePantry();

  const [consumeModalVisible, setConsumeModalVisible] = useState(false);
  const [consumeAmount, setConsumeAmount] = useState("1");
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [editQty, setEditQty] = useState("");
  const [editExpiry, setEditExpiry] = useState("");
  const [editLocation, setEditLocation] = useState<StorageLocation>("FRIDGE");
  const [imageFailed, setImageFailed] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (id && id !== "select-ingredient") {
      setIsFetching(true);
      setFetchError(null);
      loadItemById(id)
        .catch((err: any) => {
          if (isMounted) {
            setFetchError(err?.message || "Không thể tải thông tin món");
          }
        })
        .finally(() => {
          if (isMounted) {
            setIsFetching(false);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [id, loadItemById]);

  useEffect(() => {
    if (selectedItem) {
      setImageFailed(false);
      setEditQty(String(Math.round(selectedItem.quantity)));
      setEditExpiry(selectedItem.expiryDate || "");
      setEditLocation(selectedItem.location || "FRIDGE");
      setShowCalendar(false);
    }
  }, [selectedItem]);

  const handleConsume = async () => {
    if (!id || !selectedItem) return;
    const qty = parseFloat(consumeAmount);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập lượng sử dụng hợp lệ (> 0)");
      return;
    }
    if (qty > selectedItem.quantity) {
      Alert.alert(
        "Lỗi",
        `Số lượng dùng không thể lớn hơn lượng hiện có (${Math.round(selectedItem.quantity)})`,
      );
      return;
    }
    try {
      await consume(id, qty);
      setConsumeModalVisible(false);
      setConsumeAmount("1");
      Alert.alert(
        "Thành công",
        `Đã dùng ${Math.round(qty)} ${UNIT_LABEL[selectedItem.unit]}`,
      );
    } catch {
      Alert.alert("Lỗi", "Không thể dùng bớt nguyên liệu");
    }
  };

  const handleUpdate = async () => {
    if (!id || !selectedItem) return;
    const qty = parseFloat(editQty);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert("Lỗi", "Số lượng phải lớn hơn 0");
      return;
    }
    const expiryError = pantryValidators.expiryDate(editExpiry);
    if (expiryError) {
      Alert.alert("Hạn sử dụng không hợp lệ", expiryError);
      return;
    }
    try {
      await update(id, {
        quantity: qty,
        unit: selectedItem.unit,
        location: editLocation,
        expiryDate: editExpiry || undefined,
      });
      setEditModalVisible(false);
      Alert.alert("Thành công", "Đã cập nhật thông tin món");
    } catch {
      Alert.alert("Lỗi", "Không thể cập nhật món");
    }
  };

  const handleTakePhoto = async () => {
    if (!id) return;

    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Quyền truy cập", "Vui lòng cấp quyền sử dụng camera.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];

      // Kiểm tra dung lượng ảnh (Tối đa 10MB)
      const sizeValidation = validateImageSize(asset);
      if (!sizeValidation.valid) {
        Alert.alert("Ảnh quá dung lượng", sizeValidation.error);
        return;
      }

      try {
        await uploadPhoto(id, {
          uri: asset.uri,
          fileName: asset.fileName || "pantry.jpg",
          mimeType: asset.mimeType || "image/jpeg",
        });

        Alert.alert("Thành công", "Đã cập nhật ảnh.");
      } catch (err: unknown) {
        Alert.alert("Lỗi tải ảnh", getErrorMessage(err));
      }
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Xác nhận xoá",
      "Bạn có chắc chắn muốn xoá nguyên liệu này khỏi tủ?",
      [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            if (!id) return;
            try {
              await remove(id);
              router.back();
            } catch {
              Alert.alert("Lỗi", "Không thể xoá món này");
            }
          },
        },
      ],
    );
  };

  const handlePickPhoto = async () => {
    if (!id) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Quyền truy cập", "Vui lòng cấp quyền truy cập ảnh");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!res.canceled && res.assets[0]) {
      const asset = res.assets[0];

      // Kiểm tra dung lượng ảnh (Tối đa 10MB)
      const sizeValidation = validateImageSize(asset);
      if (!sizeValidation.valid) {
        Alert.alert("Ảnh quá dung lượng", sizeValidation.error);
        return;
      }

      try {
        await uploadPhoto(id, {
          uri: asset.uri,
          fileName: asset.fileName || "pantry.jpg",
          mimeType: asset.mimeType || "image/jpeg",
        });
        Alert.alert("Thành công", "Đã tải ảnh lên");
      } catch (err: unknown) {
        Alert.alert("Lỗi tải ảnh", getErrorMessage(err));
      }
    }
  };

  if (!selectedItem || selectedItem.id !== id || isFetching || isLoading) {
    if (fetchError && !isLoading && !isFetching) {
      return (
        <View className="flex-1 bg-canvas dark:bg-canvas-dark">
          <Screen>
            <View className="flex-row items-center gap-3 pb-4">
              <Pressable
                onPress={() => router.back()}
                className="h-10 w-10 items-center justify-center rounded-full bg-soft dark:bg-surface-dark"
              >
                <Ionicons name="arrow-back" size={20} color={palette.ink} />
              </Pressable>
              <AppText variant="heading">Chi tiết nguyên liệu</AppText>
            </View>
            <Card className="items-center p-8 text-center shadow-sm">
              <Ionicons
                name="alert-circle-outline"
                size={48}
                color={palette.warnInk}
              />
              <AppText variant="heading" className="mt-3 text-center">
                {fetchError || "Không tìm thấy món trong tủ"}
              </AppText>
              <Button
                title="Quay lại danh sách"
                onPress={() => router.back()}
                className="mt-6 w-full max-w-xs"
              />
            </Card>
          </Screen>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center bg-canvas dark:bg-canvas-dark">
        <ActivityIndicator size="large" color={brand} />
        <AppText variant="caption" className="mt-3 font-medium text-muted">
          Đang tải dữ liệu nguyên liệu...
        </AppText>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-canvas dark:bg-canvas-dark">
      <Screen>
        {/* Navigation Bar */}
        <View className="flex-row items-center justify-between pb-3">
          <Pressable
            onPress={() => router.back()}
            style={{
              backgroundColor: colors.surfaceVariant,
              borderColor: colors.border,
              borderWidth: 1,
            }}
            className="h-10 w-10 items-center justify-center rounded-full active:scale-95"
          >
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          </Pressable>
          <AppText variant="heading">Chi tiết nguyên liệu</AppText>
          <Pressable
            onPress={() => setEditModalVisible(true)}
            style={{
              backgroundColor: colors.surfaceVariant,
              borderColor: colors.border,
              borderWidth: 1,
            }}
            className="h-10 w-10 items-center justify-center rounded-full active:scale-95"
          >
            <Ionicons name="pencil" size={18} color={colors.primary} />
          </Pressable>
        </View>

        {/* 3D Main Card */}
        <Card className="items-center p-6 shadow-md">
          {isUploading ? (
            <View className="mb-4 h-48 w-full items-center justify-center rounded-2xl bg-soft shadow-inner dark:bg-soft-dark">
              <ActivityIndicator size="large" color={brand} />
              <AppText variant="caption" className="mt-2 text-muted">
                Đang tải ảnh lên...
              </AppText>
            </View>
          ) : selectedItem.photoUri && !imageFailed ? (
            <Image
              source={{ uri: selectedItem.photoUri }}
              className="mb-4 h-48 w-full rounded-2xl"
              resizeMode="cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <Pressable
              onPress={handlePickPhoto}
              style={{
                backgroundColor: isDark
                  ? "rgba(16, 185, 129, 0.08)"
                  : "#F0FDF4",
                borderColor: isDark
                  ? "rgba(16, 185, 129, 0.25)"
                  : "rgba(46, 125, 79, 0.2)",
                borderWidth: 1.5,
                borderStyle: "dashed",
              }}
              className="mb-4 h-48 w-full items-center justify-center rounded-2xl active:opacity-80"
            >
              <View
                style={{
                  backgroundColor: isDark
                    ? "rgba(16, 185, 129, 0.2)"
                    : "#DCFCE7",
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 8,
                }}
              >
                <Ionicons name="camera" size={26} color={colors.primary} />
              </View>
              <AppText
                style={{
                  color: colors.textPrimary,
                  fontWeight: "700",
                  fontSize: 14,
                }}
              >
                Chưa có ảnh nguyên liệu
              </AppText>
              <AppText
                style={{
                  color: colors.primary,
                  fontWeight: "600",
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                Chạm để chụp hoặc chọn ảnh
              </AppText>
            </Pressable>
          )}

          <AppText variant="title" className="text-center">
            {selectedItem.ingredientName}
          </AppText>
          <AppText variant="caption" className="mt-1">
            Danh mục: {selectedItem.categoryName || "Nguyên liệu thực phẩm"}
          </AppText>

          <View className="mt-4 flex-row items-center gap-3">
            <Badge
              label={selectedItem.freshness.label}
              tone={TONE_MAP[selectedItem.freshness.status]}
            />
            <View
              style={{
                backgroundColor: colors.surfaceVariant,
                borderColor: colors.border,
                borderWidth: 1,
              }}
              className="rounded-full px-3.5 py-1"
            >
              <AppText
                style={{
                  color: colors.textPrimary,
                  fontWeight: "600",
                  fontSize: 12,
                }}
              >
                {selectedItem.location === "FREEZER"
                  ? "Tủ đông 🧊"
                  : selectedItem.location === "PANTRY_SHELF"
                    ? "Kệ bếp 🥫"
                    : "Tủ mát ❄️"}
              </AppText>
            </View>
          </View>
        </Card>

        {/* Stats Grid */}
        <View className="flex-row gap-3">
          {/* Card Số lượng */}
          <Card className="flex-1 p-4 shadow-sm">
            <View className="flex-row items-center justify-between">
              <AppText
                variant="caption"
                style={{ color: colors.textSecondary, fontWeight: "600" }}
              >
                Số lượng hiện có
              </AppText>
              <View
                style={{
                  backgroundColor: isDark
                    ? "rgba(16, 185, 129, 0.16)"
                    : "rgba(46, 125, 79, 0.08)",
                }}
                className="h-8 w-8 items-center justify-center rounded-xl"
              >
                <Ionicons
                  name="cube-outline"
                  size={16}
                  color={colors.primary}
                />
              </View>
            </View>

            <View className="mt-3">
              <AppText
                variant="title"
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{
                  color: colors.primary,
                  fontSize: 22,
                  fontWeight: "800",
                  letterSpacing: -0.3,
                }}
              >
                {Math.round(selectedItem.quantity)}{" "}
                {UNIT_LABEL[selectedItem.unit]}
              </AppText>
            </View>
          </Card>

          {/* Card Hạn sử dụng */}
          <Card className="flex-1 p-4 shadow-sm">
            <View className="flex-row items-center justify-between">
              <AppText
                variant="caption"
                style={{ color: colors.textSecondary, fontWeight: "600" }}
              >
                Hạn sử dụng
              </AppText>
              <View
                style={{
                  backgroundColor: isDark
                    ? "rgba(255, 255, 255, 0.08)"
                    : "rgba(0, 0, 0, 0.04)",
                }}
                className="h-8 w-8 items-center justify-center rounded-xl"
              >
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={colors.textPrimary}
                />
              </View>
            </View>

            <View className="mt-3">
              <AppText
                variant="title"
                numberOfLines={1}
                adjustsFontSizeToFit
                style={{
                  color: colors.textPrimary,
                  fontSize: 19,
                  fontWeight: "800",
                  letterSpacing: -0.3,
                }}
              >
                {selectedItem.expiryDate
                  ? toDisplayDate(selectedItem.expiryDate)
                  : "Không thời hạn"}
              </AppText>
            </View>
          </Card>
        </View>

        {/* Action Buttons */}
        <View className="gap-3 pt-3">
          <Button
            title="Dùng bớt nguyên liệu"
            onPress={() => setConsumeModalVisible(true)}
            variant="primary"
            iconLeft={
              <Ionicons
                name="remove-circle-outline"
                size={18}
                color="#FFFFFF"
              />
            }
          />

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                title={isUploading ? "Đang tải..." : "Chụp ảnh"}
                onPress={handleTakePhoto}
                variant="outline"
                disabled={isUploading}
                iconLeft={
                  <Ionicons
                    name="camera-outline"
                    size={17}
                    color={colors.textPrimary}
                  />
                }
              />
            </View>

            <View className="flex-1">
              <Button
                title={isUploading ? "Đang tải..." : "Tải ảnh từ máy"}
                onPress={handlePickPhoto}
                variant="outline"
                disabled={isUploading}
                iconLeft={
                  <Ionicons
                    name="images-outline"
                    size={17}
                    color={colors.textPrimary}
                  />
                }
              />
            </View>
          </View>
          <Button
            title="Xoá khỏi tủ"
            onPress={handleDelete}
            variant="danger"
            iconLeft={
              <Ionicons name="trash-outline" size={17} color="#FFFFFF" />
            }
          />
        </View>
      </Screen>

      {/* Modal Consume */}
      <Modal
        visible={consumeModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setConsumeModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              Keyboard.dismiss();
              setConsumeModalVisible(false);
            }}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "padding"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            style={{ width: "100%" }}
          >
            <Card
              style={{
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                paddingBottom: Platform.OS === "ios" ? 34 : 24,
              }}
              className="p-6 gap-4 shadow-2xl"
            >
              <AppText variant="heading">Dùng bớt nguyên liệu</AppText>
              <AppText variant="caption">
                Lượng hiện có: {Math.round(selectedItem.quantity)}{" "}
                {UNIT_LABEL[selectedItem.unit]}
              </AppText>

              <TextField
                label="Số lượng muốn dùng"
                value={consumeAmount}
                onChangeText={setConsumeAmount}
                keyboardType="numeric"
                placeholder="Ví dụ: 1"
              />

              <View className="flex-row gap-3 pt-2">
                <Button
                  title="Huỷ"
                  variant="outline"
                  className="flex-1"
                  onPress={() => {
                    Keyboard.dismiss();
                    setConsumeModalVisible(false);
                  }}
                />
                <Button
                  title={isConsuming ? "Đang xử lý..." : "Xác nhận dùng"}
                  variant="primary"
                  className="flex-1"
                  onPress={handleConsume}
                  disabled={isConsuming}
                />
              </View>
            </Card>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Modal Edit */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => {
              Keyboard.dismiss();
              setEditModalVisible(false);
            }}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "padding"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            style={{ width: "100%" }}
          >
            <Card
              style={{
                maxHeight: "85%",
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                paddingBottom: Platform.OS === "ios" ? 34 : 24,
              }}
              className="p-5 shadow-2xl"
            >
              {/* Header Modal */}
              <View className="flex-row items-center justify-between pb-3 border-b border-line dark:border-line-dark">
                <AppText variant="heading" className="text-lg font-bold">
                  Chỉnh sửa nguyên liệu
                </AppText>
                <Pressable
                  onPress={() => {
                    Keyboard.dismiss();
                    setEditModalVisible(false);
                  }}
                  className="h-8 w-8 items-center justify-center rounded-full bg-soft dark:bg-surface-dark active:opacity-70"
                >
                  <Ionicons name="close" size={18} color={palette.muted} />
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                  gap: 16,
                  paddingTop: 14,
                  paddingBottom: 16,
                }}
              >
                {/* Số lượng */}
                <View>
                  <TextField
                    label={`Số lượng (${selectedItem ? UNIT_LABEL[selectedItem.unit] : "đơn vị"})`}
                    value={editQty}
                    onChangeText={setEditQty}
                    keyboardType="numeric"
                    placeholder="Ví dụ: 1"
                  />
                </View>

                {/* Vị trí bảo quản */}
                <View>
                  <AppText variant="label" className="mb-2">
                    Vị trí bảo quản
                  </AppText>
                  <View className="flex-row gap-2">
                    {[
                      { key: "FRIDGE" as StorageLocation, label: "Tủ mát ❄️" },
                      {
                        key: "FREEZER" as StorageLocation,
                        label: "Tủ đông 🧊",
                      },
                      {
                        key: "PANTRY_SHELF" as StorageLocation,
                        label: "Kệ bếp 🥫",
                      },
                    ].map((loc) => {
                      const isSelected = editLocation === loc.key;
                      return (
                        <Pressable
                          key={loc.key}
                          onPress={() => {
                            Keyboard.dismiss();
                            setEditLocation(loc.key);
                          }}
                          style={{
                            backgroundColor: isSelected
                              ? isDark
                                ? "rgba(16, 185, 129, 0.2)"
                                : colors.primarySoft
                              : isDark
                                ? "rgba(255, 255, 255, 0.05)"
                                : "#F1F5F9",
                            borderColor: isSelected
                              ? colors.primary
                              : isDark
                                ? "rgba(255, 255, 255, 0.1)"
                                : colors.border,
                            borderWidth: isSelected ? 1.5 : 1,
                          }}
                          className="flex-1 py-2.5 px-1 items-center justify-center rounded-xl active:scale-95"
                        >
                          <AppText
                            style={{
                              fontSize: 12,
                              fontWeight: isSelected ? "700" : "500",
                              color: isSelected
                                ? colors.primary
                                : colors.textPrimary,
                            }}
                          >
                            {loc.label}
                          </AppText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Hạn sử dụng */}
                <View>
                  <View className="flex-row items-center justify-between mb-2">
                    <AppText variant="label">Hạn sử dụng</AppText>
                    <AppText
                      variant="caption"
                      style={{ color: colors.textSecondary, fontSize: 11 }}
                    >
                      Không chọn ngày quá khứ
                    </AppText>
                  </View>

                  {/* Ô chọn ngày */}
                  <Pressable
                    onPress={() => {
                      Keyboard.dismiss();
                      setShowCalendar((prev) => !prev);
                    }}
                    className="flex-row items-center justify-between rounded-2xl border border-line bg-soft p-3.5 dark:border-line-dark dark:bg-soft-dark active:opacity-80"
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="h-9 w-9 items-center justify-center rounded-xl bg-brandSoft dark:bg-surface-dark">
                        <Ionicons
                          name="calendar-outline"
                          size={18}
                          color={brand}
                        />
                      </View>
                      <View>
                        <AppText
                          className={
                            editExpiry
                              ? "font-bold text-ink dark:text-ink-dark"
                              : "text-muted"
                          }
                        >
                          {editExpiry
                            ? toDisplayDate(editExpiry)
                            : "Chạm để tự chọn ngày từ lịch..."}
                        </AppText>
                        <AppText
                          variant="caption"
                          style={{ color: brand, fontWeight: "600" }}
                        >
                          {showCalendar
                            ? "Thu gọn lịch ▲"
                            : "Mở lịch chọn ngày ▼"}
                        </AppText>
                      </View>
                    </View>

                    {editExpiry ? (
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          setEditExpiry("");
                        }}
                        className="p-1"
                      >
                        <Ionicons
                          name="close-circle"
                          size={18}
                          color={palette.muted}
                        />
                      </Pressable>
                    ) : (
                      <Ionicons
                        name="chevron-down"
                        size={18}
                        color={palette.muted}
                      />
                    )}
                  </Pressable>

                  {/* Inline Calendar khi mở (đã có ràng buộc minDate = new Date() không cho chọn ngày quá khứ) */}
                  {showCalendar && (
                    <View className="mt-2 overflow-hidden rounded-2xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark p-2">
                      <InlineCalendar
                        selectedDate={editExpiry}
                        onSelectDate={(date) => {
                          setEditExpiry(date);
                          setShowCalendar(false);
                        }}
                        minDate={new Date()}
                      />
                    </View>
                  )}

                  {/* Quick Presets */}
                  <View className="mt-2.5 flex-row flex-wrap gap-2">
                    {[
                      { label: "+3 ngày", days: 3 },
                      { label: "+1 tuần", days: 7 },
                      { label: "+2 tuần", days: 14 },
                      { label: "+1 tháng", days: 30 },
                    ].map((p) => (
                      <Pressable
                        key={p.days}
                        onPress={() => {
                          Keyboard.dismiss();
                          const d = new Date();
                          d.setDate(d.getDate() + p.days);
                          const y = d.getFullYear();
                          const m = String(d.getMonth() + 1).padStart(2, "0");
                          const day = String(d.getDate()).padStart(2, "0");
                          setEditExpiry(`${y}-${m}-${day}`);
                        }}
                        style={{
                          backgroundColor: isDark
                            ? "rgba(16, 185, 129, 0.15)"
                            : "#E8F5EE",
                          borderColor: isDark
                            ? "rgba(16, 185, 129, 0.3)"
                            : "rgba(46, 125, 79, 0.25)",
                          borderWidth: 1,
                        }}
                        className="rounded-xl px-3 py-1.5 active:scale-95"
                      >
                        <AppText
                          style={{ color: colors.primary }}
                          className="text-xs font-bold"
                        >
                          {p.label}
                        </AppText>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Action buttons */}
                <View className="flex-row gap-3 pt-3">
                  <Button
                    title="Huỷ"
                    variant="outline"
                    className="flex-1"
                    onPress={() => {
                      Keyboard.dismiss();
                      setEditModalVisible(false);
                    }}
                  />
                  <Button
                    title={isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                    variant="primary"
                    className="flex-1"
                    onPress={handleUpdate}
                    disabled={isSaving}
                  />
                </View>
              </ScrollView>
            </Card>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}
