import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { Link } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { useForm } from "@/components/ui/useForm";
import { useTheme } from "@/theme";
import { useAuth } from "@/features/auth/useAuth";
import { validators } from "@/features/auth/validation";
import {
  AuthErrorBanner,
  AuthFooter,
  AuthShell,
} from "@/components/auth/AuthShell";
import { GlassInput3D } from "@/components/auth/GlassInput3D";
import { TactileButton } from "@/components/ui/TactileButton";
import { HOST_STORAGE_KEY, kvStorage } from "@/core/di/container";

export default function LoginScreen() {
  const { isDark } = useTheme();
  const { signIn } = useAuth();

  const [host, setHost] = useState("");
  const [hostError, setHostError] = useState<string | undefined>();
  const [hostSaved, setHostSaved] = useState(false);
  const [hostSaving, setHostSaving] = useState(false);

  useEffect(() => {
    kvStorage.get(HOST_STORAGE_KEY).then((v) => v && setHost(v));
  }, []);

  const saveHost = async () => {
    const value = host.trim().replace(/\/+$/, "");
    if (!/^https?:\/\/.+/i.test(value)) {
      setHostError("Host phải bắt đầu bằng http:// hoặc https://");
      setHostSaved(false);
      return;
    }
    setHostError(undefined);
    setHostSaving(true);
    try {
      await kvStorage.set(HOST_STORAGE_KEY, value);
      setHost(value);
      setHostSaved(true);
    } catch {
      setHostError("Không thể lưu host");
    } finally {
      setHostSaving(false);
    }
  };

  const form = useForm(
    { email: "admin@gmail.com", password: "Admin@123" },
    { email: validators.email, password: validators.password },
    signIn,
  );

  return (
    <AuthShell
      subtitle="Không Gian Ẩm Thực Thông Minh"
      cardTitle="Đăng Nhập"
      shakeTrigger={form.formError}
      footer={
        <AuthFooter
          text="Chưa có tài khoản bếp của bạn?"
          linkText="Đăng ký ngay"
          href="/register"
        />
      }>
      <GlassInput3D
        label="Host API"
        iconName="server-outline"
        placeholder="http://192.168.1.10:8080"
        keyboardType="url"
        autoCapitalize="none"
        autoCorrect={false}
        value={host}
        onChangeText={(t: string) => {
          setHost(t);
          setHostSaved(false);
          setHostError(undefined);
        }}
        error={hostError}
        isDark={isDark}
      />
      <View className="mb-3">
        <TactileButton
          title={hostSaved ? "Đã lưu ✓" : "Lưu Host"}
          loading={hostSaving}
          onPress={saveHost}
        />
      </View>

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

      <View className="-mt-0.5 mb-2.5 items-end">
        <Link href="/forgot-password" asChild>
          <Pressable hitSlop={8}>
            <AppText
              variant="link"
              className="text-[13px] font-semibold text-brand">
              Quên mật khẩu?
            </AppText>
          </Pressable>
        </Link>
      </View>

      <AuthErrorBanner message={form.formError} />
      <TactileButton
        title="Đăng Nhập Ngay"
        loading={form.loading}
        onPress={form.submit}
      />
    </AuthShell>
  );
}
