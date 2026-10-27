import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DatePickerModal } from '@/components/ui/DatePickerModal';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { usePantry } from '@/features/pantry/usePantry';
import { pantryValidators } from '@/features/pantry/validation';
import type { StorageLocation, Unit } from '@/types';

const TONE_MAP = {
  fresh: 'success',
  soon: 'warn',
  expired: 'danger',
} as const;

export default function PantryItemDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { brand, palette } = useAppTheme();
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
  const [consumeAmount, setConsumeAmount] = useState('1');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [editQty, setEditQty] = useState('');
  const [editExpiry, setEditExpiry] = useState('');
  const [editLocation, setEditLocation] = useState<StorageLocation>('FRIDGE');

  useEffect(() => {
    if (id && id !== 'select-ingredient') {
      loadItemById(id).catch(() => {});
    }
  }, [id, loadItemById]);

  useEffect(() => {
    if (selectedItem) {
      setEditQty(String(selectedItem.quantity));
      setEditExpiry(selectedItem.expiryDate || '');
      setEditLocation(selectedItem.location || 'FRIDGE');
    }
  }, [selectedItem]);

  const handleConsume = async () => {
    if (!id || !selectedItem) return;
    const qty = parseFloat(consumeAmount);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập lượng sử dụng hợp lệ (> 0)');
      return;
    }
    if (qty > selectedItem.quantity) {
      Alert.alert('Lỗi', `Số lượng dùng không thể lớn hơn lượng hiện có (${selectedItem.quantity})`);
      return;
    }
    try {
      await consume(id, qty);
      setConsumeModalVisible(false);
      setConsumeAmount('1');
      Alert.alert('Thành công', `Đã dùng ${qty} ${selectedItem.unit}`);
    } catch {
      Alert.alert('Lỗi', 'Không thể dùng bớt nguyên liệu');
    }
  };

  const handleUpdate = async () => {
    if (!id || !selectedItem) return;
    const qty = parseFloat(editQty);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Lỗi', 'Số lượng phải lớn hơn 0');
      return;
    }
    const expiryError = pantryValidators.expiryDate(editExpiry);
    if (expiryError) {
      Alert.alert('Hạn sử dụng không hợp lệ', expiryError);
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
      Alert.alert('Thành công', 'Đã cập nhật thông tin món');
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật món');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xoá',
      'Bạn có chắc chắn muốn xoá nguyên liệu này khỏi tủ?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            try {
              await remove(id);
              router.back();
            } catch {
              Alert.alert('Lỗi', 'Không thể xoá món này');
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
      Alert.alert('Quyền truy cập', 'Vui lòng cấp quyền truy cập ảnh');
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!res.canceled && res.assets[0]) {
      const asset = res.assets[0];
      try {
        await uploadPhoto(id, {
          uri: asset.uri,
          fileName: asset.fileName || 'pantry.jpg',
          mimeType: asset.mimeType || 'image/jpeg',
        });
        Alert.alert('Thành công', 'Đã tải ảnh lên');
      } catch {
        Alert.alert('Lỗi', 'Không thể tải ảnh lên');
      }
    }
  };

  if (isLoading && !selectedItem) {
    return (
      <View className="flex-1 items-center justify-center bg-canvas dark:bg-canvas-dark">
        <ActivityIndicator size="large" color={brand} />
      </View>
    );
  }

  if (!selectedItem) {
    return (
      <Screen>
        <AppText variant="heading">Không tìm thấy món trong tủ</AppText>
        <Button title="Quay lại" onPress={() => router.back()} className="mt-4" />
      </Screen>
    );
  }

  return (
    <View className="flex-1 bg-canvas dark:bg-canvas-dark">
      <Screen>
        {/* Navigation Bar */}
        <View className="flex-row items-center justify-between pb-2">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-soft dark:bg-surface-dark"
          >
            <Ionicons name="arrow-back" size={20} color={palette.ink} />
          </Pressable>
          <AppText variant="heading">Chi tiết nguyên liệu</AppText>
          <Pressable
            onPress={() => setEditModalVisible(true)}
            className="h-10 w-10 items-center justify-center rounded-full bg-soft dark:bg-surface-dark"
          >
            <Ionicons name="pencil-outline" size={20} color={brand} />
          </Pressable>
        </View>

        {/* 3D Main Card */}
        <Card className="items-center p-6 shadow-md">
          {selectedItem.photoUri ? (
            <Image
              source={{ uri: selectedItem.photoUri }}
              className="mb-4 h-40 w-full rounded-2xl"
              resizeMode="cover"
            />
          ) : (
            <View className="mb-4 h-32 w-32 items-center justify-center rounded-3xl bg-brandSoft dark:bg-surface-dark shadow-inner">
              <Ionicons name="nutrition-outline" size={56} color={brand} />
            </View>
          )}

          <AppText variant="title" className="text-center">
            {selectedItem.ingredientName}
          </AppText>
          <AppText variant="caption" className="mt-1">
            Danh mục: {selectedItem.categoryName || 'Nguyên liệu thực phẩm'}
          </AppText>

          <View className="mt-4 flex-row items-center gap-3">
            <Badge
              label={selectedItem.freshness.label}
              tone={TONE_MAP[selectedItem.freshness.status]}
            />
            <View className="rounded-full bg-soft px-3 py-1 dark:bg-soft-dark">
              <AppText variant="caption" className="font-semibold">
                {selectedItem.location === 'FREEZER'
                  ? 'Tủ đông 🧊'
                  : selectedItem.location === 'PANTRY_SHELF'
                  ? 'Kệ bếp 🥫'
                  : 'Tủ lạnh ❄️'}
              </AppText>
            </View>
          </View>
        </Card>

        {/* Stats Grid */}
        <View className="flex-row gap-3">
          <Card className="flex-1 p-4 shadow-sm">
            <AppText variant="caption">Số lượng hiện có</AppText>
            <AppText variant="title" className="mt-1 text-brand">
              {selectedItem.quantity} {selectedItem.unit}
            </AppText>
          </Card>
          <Card className="flex-1 p-4 shadow-sm">
            <AppText variant="caption">Hạn sử dụng</AppText>
            <AppText variant="title" className="mt-1 text-sm font-bold">
              {selectedItem.expiryDate || 'Không có'}
            </AppText>
          </Card>
        </View>

        {/* Action Buttons */}
        <View className="gap-3 pt-2">
          <Button
            title="Dùng bớt nguyên liệu"
            onPress={() => setConsumeModalVisible(true)}
            variant="primary"
          />

          <Button
            title={isUploading ? 'Đang tải ảnh...' : 'Cập nhật ảnh chụp'}
            onPress={handlePickPhoto}
            variant="outline"
            disabled={isUploading}
          />

          <Button
            title="Xoá khỏi tủ"
            onPress={handleDelete}
            variant="danger"
          />
        </View>
      </Screen>

      {/* Modal Consume */}
      <Modal visible={consumeModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <Card className="m-4 gap-4 p-6 shadow-2xl">
            <AppText variant="heading">Dùng bớt nguyên liệu</AppText>
            <AppText variant="caption">
              Lượng hiện có: {selectedItem.quantity} {selectedItem.unit}
            </AppText>

            <TextField
              label="Số lượng muốn dùng"
              value={consumeAmount}
              onChangeText={setConsumeAmount}
              keyboardType="numeric"
              placeholder="Ví dụ: 1"
            />

            <View className="flex-row gap-3">
              <Button
                title="Huỷ"
                variant="outline"
                className="flex-1"
                onPress={() => setConsumeModalVisible(false)}
              />
              <Button
                title={isConsuming ? 'Đang xử lý...' : 'Xác nhận dùng'}
                variant="primary"
                className="flex-1"
                onPress={handleConsume}
                disabled={isConsuming}
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Modal Edit */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/50">
          <Card className="m-4 gap-4 p-6 shadow-2xl">
            <AppText variant="heading">Chỉnh sửa nguyên liệu</AppText>

            <TextField
              label="Số lượng"
              value={editQty}
              onChangeText={setEditQty}
              keyboardType="numeric"
            />

            <View>
              <AppText variant="label" className="mb-2">
                Hạn sử dụng
              </AppText>

              <Pressable
                onPress={() => setCalendarOpen(true)}
                className="flex-row items-center justify-between rounded-2xl border border-line bg-soft p-3.5 dark:border-line-dark dark:bg-soft-dark"
              >
                <View className="flex-row items-center gap-3">
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-brandSoft dark:bg-surface-dark">
                    <Ionicons name="calendar-outline" size={18} color={brand} />
                  </View>
                  <View>
                    <AppText
                      className={
                        editExpiry
                          ? 'font-bold text-ink dark:text-ink-dark'
                          : 'text-muted'
                      }
                    >
                      {editExpiry || 'Chạm để chọn từ lịch...'}
                    </AppText>
                    <AppText variant="caption">
                      Không cho phép ngày trong quá khứ
                    </AppText>
                  </View>
                </View>

                {editExpiry ? (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      setEditExpiry('');
                    }}
                    className="p-1"
                  >
                    <Ionicons name="close-circle" size={18} color={palette.muted} />
                  </Pressable>
                ) : (
                  <Ionicons name="chevron-forward" size={18} color={palette.muted} />
                )}
              </Pressable>

              {/* Quick Presets */}
              <View className="mt-2.5 flex-row flex-wrap gap-2">
                {[
                  { label: '+3 ngày', days: 3 },
                  { label: '+1 tuần', days: 7 },
                  { label: '+2 tuần', days: 14 },
                  { label: '+1 tháng', days: 30 },
                ].map((p) => (
                  <Pressable
                    key={p.days}
                    onPress={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + p.days);
                      const y = d.getFullYear();
                      const m = String(d.getMonth() + 1).padStart(2, '0');
                      const day = String(d.getDate()).padStart(2, '0');
                      setEditExpiry(`${y}-${m}-${day}`);
                    }}
                    className="rounded-xl border border-line bg-brandSoft px-3 py-1.5 dark:bg-surface-dark"
                  >
                    <AppText className="text-xs font-bold text-brand">{p.label}</AppText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="flex-row gap-3 pt-2">
              <Button
                title="Huỷ"
                variant="outline"
                className="flex-1"
                onPress={() => setEditModalVisible(false)}
              />
              <Button
                title={isSaving ? 'Đang lưu...' : 'Lưu'}
                variant="primary"
                className="flex-1"
                onPress={handleUpdate}
                disabled={isSaving}
              />
            </View>
          </Card>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        onSelectDate={(date) => setEditExpiry(date)}
        currentValue={editExpiry}
        minDate={new Date()}
      />
    </View>
  );
}
