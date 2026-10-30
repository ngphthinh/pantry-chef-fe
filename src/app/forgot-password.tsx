// forgot-password.tsx
import { useState } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/ui/AppText";
import { useForm } from "@/components/ui/useForm";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { authService } from "@/core/di/container";
import { validators } from "@/features/auth/validation";
import { ForgotPasswordRequest } from "@/types";
import {
  AuthErrorBanner,
  AuthFooter,
  AuthShell,
} from "@/components/auth/AuthShell";
import { GlassInput3D } from "@/components/auth/GlassInput3D";
import { TactileButton } from "@/components/ui/TactileButton";

export default function ForgotPasswordScreen() {
  const { isDark, palette } = useAppTheme();
  const [sent, setSent] = useState(false);

  const form = useForm(
    { email: "" },
    { email: validators.email },
    async ({ email }: ForgotPasswordRequest) => {
      await authService.forgotPassword({ email });
      setSent(true);
    },
  );

  return (
    <AuthShell
      subtitle="Nhập email để nhận liên kết đặt lại mật khẩu"
      cardTitle="Quên Mật Khẩu"
      shakeTrigger={form.formError}
      footer={
        <AuthFooter
          text="Nhớ mật khẩu rồi?"
          linkText={sent ? "Quay về đăng nhập" : "Quay lại đăng nhập"}
          href="/login"
          replace
        />
      }>
      {!sent ? (
        <GlassInput3D
          label="Tài khoản Email"
          iconName="mail-outline"
          placeholder="nhap.email@vidu.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.values.email}
          onChangeText={form.setValue("email")}
          error={form.errors.email}
          isDark={isDark}
        />
      ) : (
        <View className="mb-3 flex-row gap-2.5 rounded-[14px] border border-successInk bg-successBg p-3 dark:border-successInk-dark dark:bg-successBg-dark">
          <Ionicons name="mail-open" size={18} color={palette.successInk} />
          <AppText className="flex-1 text-[13px]">
            Nếu email được cung cấp tồn tại trong hệ thống, bạn sẽ nhận được
            hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư đến và thư mục
            spam.
          </AppText>
        </View>
      )}

      <AuthErrorBanner message={form.formError} />
      <TactileButton
        title={sent ? "Gửi Lại Email" : "Gửi Liên Kết"}
        loading={form.loading}
        onPress={form.submit}
      />
    </AuthShell>
  );
}
  