import { useState } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { AppText } from "@/components/ui/AppText";
import { useForm } from "@/components/ui/useForm";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { useAuth } from "@/features/auth/useAuth";
import { validators } from "@/features/auth/validation";
import {
  AuthErrorBanner,
  AuthFooter,
  AuthShell,
} from "@/components/auth/AuthShell";
import { GlassInput3D } from "@/components/auth/GlassInput3D";
import { TactileButton } from "@/components/ui/TactileButton";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { isDark, palette } = useAppTheme();
  const { changePassword, signOut } = useAuth();
  const [success, setSuccess] = useState(false);

  const form = useForm(
    {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    {
      oldPassword: validators.required("mật khẩu hiện tại"),
      newPassword: validators.password,
      confirmPassword: (value, all) =>
        value !== all.newPassword ? "Mật khẩu xác nhận không khớp" : null,
    },
    async ({ oldPassword, newPassword }) => {
      await changePassword({ oldPassword, newPassword });
      setSuccess(true);
    },
  );

  if (success) {
    return (
      <AuthShell
        subtitle="Mật khẩu của bạn đã được cập nhật"
        cardTitle="Đổi Mật Khẩu Thành Công">
        <View className="mb-3 flex-row gap-2.5 rounded-[14px] border border-successInk bg-successBg p-3 dark:border-successInk-dark dark:bg-successBg-dark">
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={palette.successInk}
          />
          <AppText className="flex-1 text-[13px]">
            Hãy sử dụng mật khẩu mới trong những lần đăng nhập tiếp theo.
          </AppText>
        </View>

        <TactileButton
          title="Quay Lại Đăng Nhập"
          onPress={async () => {
            await signOut();
            router.replace("/login");
          }}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      subtitle="Nhập mật khẩu hiện tại và thiết lập mật khẩu mới"
      cardTitle="Đổi Mật Khẩu"
      shakeTrigger={form.formError}
      footer={
        <AuthFooter
          text="Không muốn đổi nữa?"
          linkText="Quay lại"
          href="/login"
        />
      }>
      <GlassInput3D
        label="Mật khẩu hiện tại"
        iconName="lock-closed-outline"
        placeholder="••••••••"
        secureTextEntry
        value={form.values.oldPassword}
        onChangeText={form.setValue("oldPassword")}
        error={form.errors.oldPassword}
        isDark={isDark}
      />
      <GlassInput3D
        label="Mật khẩu mới"
        iconName="key-outline"
        placeholder="••••••••"
        secureTextEntry
        value={form.values.newPassword}
        onChangeText={form.setValue("newPassword")}
        error={form.errors.newPassword}
        isDark={isDark}
      />
      <GlassInput3D
        label="Xác nhận mật khẩu mới"
        iconName="shield-checkmark-outline"
        placeholder="••••••••"
        secureTextEntry
        value={form.values.confirmPassword}
        onChangeText={form.setValue("confirmPassword")}
        error={form.errors.confirmPassword}
        isDark={isDark}
      />

      <AuthErrorBanner message={form.formError} />
      <TactileButton
        title="Cập Nhật Mật Khẩu"
        loading={form.loading}
        onPress={form.submit}
      />
    </AuthShell>
  );
}
