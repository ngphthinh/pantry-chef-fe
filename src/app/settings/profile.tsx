import { useEffect, useState } from "react";
import { Alert, Image, Platform, Pressable, View } from "react-native";
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
import { brand } from "@/core/theme/colors";
import { useUser } from "@/features/auth/useUser";

export default function ProfileScreen() {
  const router = useRouter();

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
      <View className="gap-5 pb-8">
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-surface">
            <Ionicons name="arrow-back" size={22} color={brand.DEFAULT} />
          </Pressable>

          <View className="flex-1">
            <AppText variant="title">Hồ sơ cá nhân</AppText>
            <AppText variant="caption">
              Quản lý thông tin tài khoản của bạn
            </AppText>
          </View>
        </View>

        <Card className="items-center gap-3 p-5">
          <Pressable
            onPress={handleChangeAvatar}
            disabled={avatarLoading}
            className="items-center">
            <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-brandSoft">
              {user?.avatarUri ? (
                <Image
                  source={{ uri: user.avatarUri }}
                  className="h-28 w-28"
                  resizeMode="cover"
                />
              ) : (
                <AppText variant="heading" className="text-brand">
                  {user?.displayName?.trim()?.charAt(0)?.toUpperCase() ?? "?"}
                </AppText>
              )}
            </View>

            <View className="mt-2 flex-row items-center gap-1">
              <Ionicons name="camera-outline" size={16} color={brand.DEFAULT} />
              <AppText variant="caption" className="text-brand">
                {avatarLoading ? "Đang cập nhật..." : "Đổi ảnh đại diện"}
              </AppText>
            </View>
          </Pressable>

          <AppText variant="heading">
            {user?.displayName || "Người dùng"}
          </AppText>

          <AppText variant="caption">
            {user?.email || "Chưa cập nhật email"}
          </AppText>
        </Card>

        <Card className="gap-4 p-4">
          <AppText variant="heading">Thông tin cá nhân</AppText>

          <TextField
            label="Họ và tên"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Nhập họ và tên"
          />

          <View className="gap-1">
            <AppText variant="label">Email</AppText>
            <View className="flex-row items-center gap-2 rounded-xl border border-border bg-surface p-3">
              <Ionicons name="mail-outline" size={20} color={brand.DEFAULT} />
              <View className="flex-1">
                <AppText>{user?.email || "Chưa cập nhật email"}</AppText>
              </View>
              <Ionicons
                name="lock-closed-outline"
                size={16}
                color={brand.DEFAULT}
              />
            </View>
            <AppText variant="caption">Email được hiển thị chỉ đọc.</AppText>
          </View>

          <Button
            title="Lưu thay đổi"
            loading={loading}
            onPress={handleUpdateProfile}
          />
        </Card>

        <Card className="gap-3 p-4">
          <AppText variant="heading">Bảo mật</AppText>

          <Pressable
            onPress={() => router.push("/settings/change-password")}
            className="flex-row items-center gap-3 py-2">
            <Ionicons
              name="lock-closed-outline"
              size={22}
              color={brand.DEFAULT}
            />
            <View className="flex-1">
              <AppText>Đổi mật khẩu</AppText>
              <AppText variant="caption">Cập nhật mật khẩu tài khoản</AppText>
            </View>
            <Ionicons name="chevron-forward" size={20} color={brand.DEFAULT} />
          </Pressable>
        </Card>

        <Card className="gap-3 border border-danger p-4">
          <AppText variant="heading" className="text-danger">
            Vùng nguy hiểm
          </AppText>

          <AppText variant="caption">
            Xóa tài khoản có thể khiến bạn mất quyền truy cập dữ liệu cá nhân.
          </AppText>

          <Button
            title="Xóa tài khoản"
            loading={loading}
            onPress={handleDeleteAccount}
          />
        </Card>
      </View>
    </Screen>
  );
}
