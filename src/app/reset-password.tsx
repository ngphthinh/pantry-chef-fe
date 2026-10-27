import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useForm } from '@/components/ui/useForm';
import { authService } from '@/core/di/container';
import { validators } from '@/features/auth/validation';

/** Mở bằng deep link: pantrychef://reset-password?token=... */
export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const form = useForm(
    { password: '', confirm: '' },
    { password: validators.password, confirm: validators.match('password') },
    async ({ password }) => {
      await authService.resetPassword({ token: token ?? '', newPassword: password });
      router.replace('/login');
    },
  );

  return (
    <AuthLayout title="Đặt lại mật khẩu" subtitle="Nhập mật khẩu mới cho tài khoản của bạn.">
      <TextField label="Mật khẩu mới" secureTextEntry value={form.values.password} onChangeText={form.setValue('password')} error={form.errors.password} />
      <TextField label="Nhập lại mật khẩu" secureTextEntry value={form.values.confirm} onChangeText={form.setValue('confirm')} error={form.errors.confirm} />
      {form.formError ? <AppText variant="error">{form.formError}</AppText> : null}
      <Button title="Cập nhật mật khẩu" loading={form.loading} onPress={form.submit} />
    </AuthLayout>
  );
}
