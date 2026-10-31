// reset-password.tsx
import { useLocalSearchParams, useRouter } from "expo-router";
import { useForm } from "@/components/ui/useForm";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { authService } from "@/core/di/container";
import { validators } from "@/features/auth/validation";
import {
  AuthErrorBanner,
  AuthFooter,
  AuthShell,
} from "@/components/auth/AuthShell";
import { GlassInput3D } from "@/components/auth/GlassInput3D";
import { TactileButton } from "@/components/ui/TactileButton";

/** Mở bằng deep link: pantrychef://reset-password?token=... */
export default function ResetPasswordScreen() {
  const { isDark } = useAppTheme();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();

  const form = useForm(
    { password: "", confirm: "" },
    { password: validators.password, confirm: validators.match("password") },
    async ({ password }) => {
      await authService.resetPassword({
        token: token ?? "",
        newPassword: password,
      });
      router.replace("/login");
    },
  );

  return (
    <AuthShell
      subtitle="Nhập mật khẩu mới cho tài khoản của bạn"
      cardTitle="Đặt Lại Mật Khẩu"
      shakeTrigger={form.formError}
      footer={
        <AuthFooter
          text="Nhớ mật khẩu rồi?"
          linkText="Đăng nhập"
          href="/login"
        />
      }>
      <GlassInput3D
        label="Mật khẩu mới"
        iconName="lock-closed-outline"
        placeholder="••••••••"
        secureTextEntry
        value={form.values.password}
        onChangeText={form.setValue("password")}
        error={form.errors.password}
        isDark={isDark}
      />
      <GlassInput3D
        label="Nhập lại mật khẩu"
        iconName="shield-checkmark-outline"
        placeholder="••••••••"
        secureTextEntry
        value={form.values.confirm}
        onChangeText={form.setValue("confirm")}
        error={form.errors.confirm}
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
