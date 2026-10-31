// register.tsx
import { useRouter } from "expo-router";
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

export default function RegisterScreen() {
  const { isDark } = useAppTheme();
  const { signUp } = useAuth();
  const router = useRouter();

  const form = useForm(
    { displayName: "", email: "", password: "", confirm: "" },
    {
      displayName: validators.required("họ tên"),
      email: validators.email,
      password: validators.password,
      confirm: validators.match("password"),
    },
    async ({ displayName, email, password }) => {
      await signUp({ displayName, email, password });
      router.replace("/login");
    },
  );

  return (
    <AuthShell
      subtitle="Chỉ mất một phút để bắt đầu quản lý tủ nguyên liệu"
      cardTitle="Tạo Tài Khoản"
      shakeTrigger={form.formError}
      footer={
        <AuthFooter
          text="Đã có tài khoản?"
          linkText="Đăng nhập"
          href="/login"
        />
      }>
      <GlassInput3D
        label="Họ tên"
        iconName="person-outline"
        placeholder="Nguyễn Văn A"
        autoCapitalize="words"
        value={form.values.displayName}
        onChangeText={form.setValue("displayName")}
        error={form.errors.displayName}
        isDark={isDark}
      />
      <GlassInput3D
        label="Tài khoản Email"
        iconName="mail-outline"
        placeholder="nhap.email@vidu.com"
        keyboardType="email-address"
        value={form.values.email}
        onChangeText={form.setValue("email")}
        error={form.errors.email}
        isDark={isDark}
      />
      <GlassInput3D
        label="Mật khẩu bảo mật"
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
        title="Đăng Ký Ngay"
        loading={form.loading}
        onPress={form.submit}
      />
    </AuthShell>
  );
}
