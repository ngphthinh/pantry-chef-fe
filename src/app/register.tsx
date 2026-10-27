import { View } from "react-native";
import { Link, useRouter } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { AuthLayout } from "@/components/ui/AuthLayout";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useForm } from "@/components/ui/useForm";
import { useAuth } from "@/features/auth/useAuth";
import { validators } from "@/features/auth/validation";

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const router = useRouter();
  const form = useForm(
    {
      displayName: "",
      email: "",
      password: "",
      confirm: "",
    },
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
    <AuthLayout
      title="Tạo tài khoản"
      subtitle="Chỉ mất một phút để bắt đầu quản lý tủ nguyên liệu.">
      <TextField
        label="Họ tên"
        autoCapitalize="words"
        value={form.values.displayName}
        onChangeText={form.setValue("displayName")}
        error={form.errors.displayName}
      />
      <TextField
        label="Email"
        keyboardType="email-address"
        value={form.values.email}
        onChangeText={form.setValue("email")}
        error={form.errors.email}
      />
      <TextField
        label="Mật khẩu"
        secureTextEntry
        value={form.values.password}
        onChangeText={form.setValue("password")}
        error={form.errors.password}
      />
      <TextField
        label="Nhập lại mật khẩu"
        secureTextEntry
        value={form.values.confirm}
        onChangeText={form.setValue("confirm")}
        error={form.errors.confirm}
      />
      {form.formError ? (
        <AppText variant="error">{form.formError}</AppText>
      ) : null}
      <Button title="Đăng ký" loading={form.loading} onPress={form.submit} />
      <View className="flex-row justify-center gap-1">
        <AppText variant="caption">Đã có tài khoản?</AppText>
        <Link href="/login">
          <AppText variant="link" className="text-sm">
            Đăng nhập
          </AppText>
        </Link>
      </View>
    </AuthLayout>
  );
}
