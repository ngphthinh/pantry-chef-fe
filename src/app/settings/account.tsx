import { useState } from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { confirmAction, notify } from "@/core/ui/dialogs";
import { useMoreMenu } from "@/features/more/useMoreMenu";

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

/** Quản lý tài khoản: đổi mật khẩu và xóa tài khoản. */
export default function AccountScreen() {
  const router = useRouter();
  const { palette, brand } = useAppTheme();
  const { deleteAccount } = useMoreMenu();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    const ok = await confirmAction({
      title: "Xóa tài khoản",
      message:
        "Bạn có chắc chắn muốn xóa tài khoản? Hành động này có thể không thể hoàn tác.",
      confirmText: "Xóa tài khoản",
      destructive: true,
    });
    if (!ok) return;

    setDeleting(true);
    const result = await deleteAccount();
    setDeleting(false);
    if (!result.ok) notify("Lỗi", result.message);
  };

  return (
    <Screen>
      <View className="gap-5 pb-10">
        {/* Header */}
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/")
            }
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            className="h-10 w-10 items-center justify-center rounded-full bg-soft active:scale-90 dark:bg-surface-dark"
          >
            <Ionicons name="arrow-back" size={20} color={palette.ink} />
          </Pressable>
          <View className="flex-1">
            <AppText variant="title">Quản lý tài khoản</AppText>
            <AppText variant="caption">Bảo mật và xóa tài khoản</AppText>
          </View>
        </View>

        {/* Bảo mật */}
        <View className="gap-2.5">
          <SectionTitle icon="shield-checkmark" label="Bảo mật" />
          <Card className="overflow-hidden shadow-sm">
            <Pressable
              onPress={() => router.push("/settings/change-password")}
              accessibilityRole="button"
              className="flex-row items-center gap-3 p-4 active:bg-soft dark:active:bg-soft-dark"
            >
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

        {/* Vùng nguy hiểm */}
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
              loading={deleting}
              onPress={() => void handleDeleteAccount()}
            />
          </Card>
        </View>
      </View>
    </Screen>
  );
}
