import { useState } from "react";
import { Link } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { AuthLayout } from "@/components/ui/AuthLayout";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { useForm } from "@/components/ui/useForm";
import { authService } from "@/core/di/container";
import { validators } from "@/features/auth/validation";
import { ForgotPasswordRequest } from "@/types";

export default function ForgotPasswordScreen() {
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
    <AuthLayout
      title="Quên mật khẩu"
      subtitle="Nhập email để nhận liên kết đặt lại mật khẩu.">
      {!sent ? (
        <>
          <TextField
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.values.email}
            onChangeText={form.setValue("email")}
            error={form.errors.email}
          />

          {form.formError ? (
            <AppText variant="error">{form.formError}</AppText>
          ) : null}

          <Button
            title="Gửi liên kết"
            loading={form.loading}
            onPress={form.submit}
          />

          <Link href="/login" replace>
            <AppText variant="link" className="self-center">
              Quay lại đăng nhập
            </AppText>
          </Link>
        </>
      ) : (
        <>
          <AppText>
            Nếu email được cung cấp tồn tại trong hệ thống, bạn sẽ nhận được
            hướng dẫn đặt lại mật khẩu. Vui lòng kiểm tra hộp thư đến và thư mục
            spam.
          </AppText>

          {form.formError ? (
            <AppText variant="error">{form.formError}</AppText>
          ) : null}

          <Button
            title="Gửi lại email"
            variant="secondary"
            loading={form.loading}
            onPress={form.submit}
          />

          <Link href="/login" replace>
            <AppText variant="link" className="self-center">
              Quay về đăng nhập
            </AppText>
          </Link>
        </>
      )}
    </AuthLayout>
  );
}
