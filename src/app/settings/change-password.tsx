import { useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { AppText } from "@/components/ui/AppText";
import { AuthLayout } from "@/components/ui/AuthLayout";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useForm } from "@/components/ui/useForm";
import { useAuth } from "@/features/auth/useAuth";
import { validators } from "@/features/auth/validation";

export default function ChangePasswordScreen() {
  const router = useRouter();
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
      <AuthLayout
        title="Đổi mật khẩu thành công"
        subtitle="Mật khẩu của bạn đã được cập nhật.">
        <AppText>
          Hãy sử dụng mật khẩu mới trong những lần đăng nhập tiếp theo.
        </AppText>

        <Button
          title="Quay lại đăng nhập"
          onPress={async () => {
            await signOut();
            router.replace("/login");
          }}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Đổi mật khẩu"
      subtitle="Nhập mật khẩu hiện tại và thiết lập mật khẩu mới.">
      <View className="gap-4">
        <TextField
          label="Mật khẩu hiện tại"
          secureTextEntry
          value={form.values.oldPassword}
          onChangeText={form.setValue("oldPassword")}
          error={form.errors.oldPassword}
        />

        <TextField
          label="Mật khẩu mới"
          secureTextEntry
          value={form.values.newPassword}
          onChangeText={form.setValue("newPassword")}
          error={form.errors.newPassword}
        />

        <TextField
          label="Xác nhận mật khẩu mới"
          secureTextEntry
          value={form.values.confirmPassword}
          onChangeText={form.setValue("confirmPassword")}
          error={form.errors.confirmPassword}
        />

        {form.formError ? (
          <AppText variant="error">{form.formError}</AppText>
        ) : null}

        <Button
          title="Cập nhật mật khẩu"
          loading={form.loading}
          onPress={form.submit}
        />

        <Button title="Hủy" variant="secondary" onPress={() => router.back()} />
      </View>
    </AuthLayout>
  );
}
