import { View } from 'react-native';
import { Link } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { AuthLayout } from '@/components/ui/AuthLayout';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useForm } from '@/components/ui/useForm';
import { useAuth } from '@/features/auth/useAuth';
import { validators } from '@/features/auth/validation';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const form = useForm(
    { email: 'admin@gmail.com', password: 'Admin@123' },
    { email: validators.email, password: validators.password },
    signIn,
  );

  return (
    <AuthLayout title="Đăng nhập" subtitle="Chào mừng trở lại! Đăng nhập để mở tủ nguyên liệu của bạn.">
      <TextField label="Email" keyboardType="email-address" value={form.values.email} onChangeText={form.setValue('email')} error={form.errors.email} />
      <TextField label="Mật khẩu" secureTextEntry value={form.values.password} onChangeText={form.setValue('password')} error={form.errors.password} />
      <Link href="/forgot-password" asChild>
        <AppText variant="link" className="self-end">Quên mật khẩu?</AppText>
      </Link>
      {form.formError ? <AppText variant="error">{form.formError}</AppText> : null}
      <Button title="Đăng nhập" loading={form.loading} onPress={form.submit} />
      <View className="flex-row justify-center gap-1">
        <AppText variant="caption">Chưa có tài khoản?</AppText>
        <Link href="/register"><AppText variant="link" className="text-sm">Đăng ký</AppText></Link>
      </View>
    </AuthLayout>
  );
}
