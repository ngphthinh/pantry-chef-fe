import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import type { UserUpdateRequest } from "@/types";
import type { PickedImage } from "@/types";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { useUser } from "@/features/auth/useUser";

function SectionTitle({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  const { brand } = useAppTheme();
  return (
    <View className="flex-row items-center gap-2">
      <View className="h-8 w-8 items-center justify-center rounded-xl bg-brandSoft dark:bg-surface-dark">
        <Ionicons name={icon} size={16} color={brand} />
      </View>
      <AppText variant="heading" className="text-base">
        {label}
      </AppText>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { brand, palette } = useAppTheme();

  const { user, refresh, updateProfile, updateAvatar, deleteAccount } =
    useUser();

  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? "");
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleUpdateProfile = async () => {
    const name = displayName.trim();

    if (!name) {
      Alert.alert("Thông báo", "Vui lòng nhập họ tên.");
      return;
    }

    setLoading(true);

    try {
      await updateProfile({
        displayName: name,
      } as UserUpdateRequest);

      Alert.alert("Thành công", "Hồ sơ đã được cập nhật.");
    } catch (error) {
      Alert.alert(
        "Lỗi",
        error instanceof Error ? error.message : "Không thể cập nhật hồ sơ.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangeAvatar = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Cần cấp quyền",
          "Vui lòng cấp quyền truy cập thư viện ảnh để đổi avatar.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];

      const image: PickedImage = {
        uri: asset.uri,
        fileName: asset.fileName ?? "avatar.jpg",
        mimeType: asset.mimeType ?? "image/jpeg",
      };

      setAvatarLoading(true);
      await updateAvatar(image);

      Alert.alert("Thành công", "Ảnh đại diện đã được cập nhật.");
    } catch (error) {
      Alert.alert(
        "Lỗi",
        error instanceof Error
          ? error.message
          : "Không thể cập nhật ảnh đại diện.",
      );
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    const confirmDelete = async () => {
      setLoading(true);

      try {
        await deleteAccount();
        router.replace("/login");
      } catch (error) {
        Alert.alert(
          "Lỗi",
          error instanceof Error ? error.message : "Không thể xóa tài khoản.",
        );
      } finally {
        setLoading(false);
      }
    };

    if (Platform.OS === "web") {
      if (
        window.confirm(
          "Bạn có chắc chắn muốn xóa tài khoản? Hành động này có thể không thể hoàn tác.",
        )
      ) {
        void confirmDelete();
      }
      return;
    }

    Alert.alert(
      "Xóa tài khoản",
      "Bạn có chắc chắn muốn xóa tài khoản? Hành động này có thể không thể hoàn tác.",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa tài khoản",
          style: "destructive",
          onPress: () => void confirmDelete(),
        },
      ],
    );
  };

  return (
    <Screen>
      <View className="gap-5 pb-10">
        {/* Header */}
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            className="h-10 w-10 items-center justify-center rounded-full bg-soft active:scale-90 dark:bg-surface-dark">
            <Ionicons name="arrow-back" size={20} color={palette.ink} />
          </Pressable>
          <View className="flex-1">
            <AppText variant="title">Hồ sơ cá nhân</AppText>
            <AppText variant="caption">
              Quản lý thông tin tài khoản của bạn
            </AppText>
          </View>
        </View>

        {/* Hero */}
        <Card className="items-center gap-1 bg-brandSoft/50 p-6 shadow-sm dark:bg-surface-dark">
          <Pressable
            onPress={handleChangeAvatar}
            disabled={avatarLoading}
            className="active:scale-95">
            <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-brandSoft shadow-md dark:border-soft-dark dark:bg-soft-dark">
              {user?.avatarUri ? (
                <Image
                  source={{ uri: user.avatarUri }}
                  className="h-28 w-28"
                  resizeMode="cover"
                />
              ) : (
                <AppText className="text-4xl font-extrabold text-brand">
                  {user?.displayName?.trim()?.charAt(0)?.toUpperCase() ?? "?"}
                </AppText>
              )}
              {avatarLoading ? (
                <View className="absolute inset-0 items-center justify-center bg-black/40">
                  <ActivityIndicator color="#FFFFFF" />
                </View>
              ) : null}
            </View>

            {/* Nút camera */}
            <View className="absolute bottom-0 right-0 h-9 w-9 items-center justify-center rounded-full border-2 border-surface bg-brand dark:border-soft-dark">
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </View>
          </Pressable>

          <AppText variant="heading" className="mt-3 text-xl">
            {user?.displayName || "Người dùng"}
          </AppText>
          <AppText variant="caption">
            {user?.email || "Chưa cập nhật email"}
          </AppText>
          <AppText variant="caption" className="mt-1 font-semibold text-brand">
            {avatarLoading ? "Đang cập nhật..." : "Chạm vào ảnh để đổi"}
          </AppText>
        </Card>

        {/* Personal info */}
        <View className="gap-2.5">
          <SectionTitle icon="person" label="Thông tin cá nhân" />
          <Card className="gap-4 p-4 shadow-sm">
            <TextField
              label="Họ và tên"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Nhập họ và tên"
            />

            <View className="gap-1.5">
              <AppText variant="label">Email</AppText>
              <View className="flex-row items-center gap-2.5 rounded-2xl border border-line bg-soft p-3 dark:border-line-dark dark:bg-soft-dark">
                <Ionicons name="mail-outline" size={20} color={brand} />
                <View className="flex-1">
                  <AppText numberOfLines={1}>
                    {user?.email || "Chưa cập nhật email"}
                  </AppText>
                </View>
                <Ionicons name="lock-closed" size={15} color={palette.muted} />
              </View>
              <AppText variant="caption">Email được hiển thị chỉ đọc.</AppText>
            </View>

            <Button
              title="Lưu thay đổi"
              loading={loading}
              onPress={handleUpdateProfile}
            />
          </Card>
        </View>

        {/* Security */}
        <View className="gap-2.5">
          <SectionTitle icon="shield-checkmark" label="Bảo mật" />
          <Card className="overflow-hidden shadow-sm">
            <Pressable
              onPress={() => router.push("/settings/change-password")}
              className="flex-row items-center gap-3 p-4 active:bg-soft dark:active:bg-soft-dark">
              <View className="h-10 w-10 items-center justify-center rounded-2xl bg-brandSoft dark:bg-surface-dark">
                <Ionicons name="key" size={20} color={brand} />
              </View>
              <View className="flex-1">
                <AppText className="font-semibold">Đổi mật khẩu</AppText>
                <AppText variant="caption">Cập nhật mật khẩu tài khoản</AppText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={palette.muted}
              />
            </Pressable>
          </Card>
        </View>

        {/* Danger zone */}
        <View className="gap-2.5">
          <SectionTitle icon="warning" label="Vùng nguy hiểm" />
          <Card className="gap-3 border border-dangerInk/40 bg-dangerBg/40 p-4 dark:border-dangerInk-dark/40 dark:bg-dangerBg-dark">
            <View className="flex-row items-start gap-2.5">
              <Ionicons
                name="alert-circle"
                size={20}
                color={palette.dangerInk}
              />
              <AppText variant="caption" className="flex-1">
                Xóa tài khoản có thể khiến bạn mất quyền truy cập dữ liệu cá
                nhân.
              </AppText>
            </View>
            <Button
              title="Xóa tài khoản"
              variant="danger"
              loading={loading}
              onPress={handleDeleteAccount}
            />
          </Card>
        </View>
      </View>
    </Screen>
  );
}
