import { ActivityIndicator, View } from "react-native";
import { Redirect, Stack } from "expo-router";

import { brand } from "@/core/theme/colors";
import { useAdminAccess } from "@/features/admin/useAdminAccess";

/** Chặn mọi màn hình trong /admin: chỉ admin mới vào được. */
export default function AdminLayout() {
  const { isAdmin, checked } = useAdminAccess();

  if (!checked) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator color={brand.DEFAULT} />
      </View>
    );
  }

  if (!isAdmin) return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
