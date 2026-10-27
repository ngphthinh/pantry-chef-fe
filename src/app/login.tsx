import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { useForm } from '@/components/ui/useForm';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { useAuth } from '@/features/auth/useAuth';
import { validators } from '@/features/auth/validation';
import { LivingBackground4D } from '@/components/auth/LivingBackground4D';
import { HeroBadge3D } from '@/components/auth/HeroBadge3D';
import { TiltCard3D } from '@/components/auth/TiltCard3D';
import { GlassInput3D } from '@/components/auth/GlassInput3D';
import { TactileButton3D } from '@/components/auth/TactileButton3D';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const { signIn } = useAuth();
  const router = useRouter();
  const [selectedDemo, setSelectedDemo] = useState<'admin' | 'chef' | null>(null);

  const form = useForm(
    { email: 'admin@gmail.com', password: 'Admin@123' },
    { email: validators.email, password: validators.password },
    signIn,
  );

  const fillCredentials = (type: 'admin' | 'chef') => {
    setSelectedDemo(type);
    if (type === 'admin') {
      form.setValue('email')('admin@gmail.com');
      form.setValue('password')('Admin@123');
    } else {
      form.setValue('email')('chef@gmail.com');
      form.setValue('password')('Chef@123');
    }
  };

  const handleBiometricSimulation = async () => {
    // Quick login with stored credentials
    form.setValue('email')('admin@gmail.com');
    form.setValue('password')('Admin@123');
    await form.submit();
  };

  return (
    <View style={styles.root}>
      {/* 4D Living Background with Autonomous Fluid Energy & Particles */}
      <LivingBackground4D isDark={isDark} />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: Math.max(insets.top + 10, 24), paddingBottom: Math.max(insets.bottom + 20, 32) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header 3D Holographic Crest & Title */}
          <View style={styles.header}>
            <HeroBadge3D isDark={isDark} />

            <AppText
              variant="title"
              style={[
                styles.brandTitle,
                { color: isDark ? '#F3F4F6' : '#111827' },
              ]}
            >
              PANTRY CHEF
            </AppText>

            <View style={styles.subtitleRow}>
              <View style={[styles.glowDot, { backgroundColor: isDark ? '#34D399' : '#10B981' }]} />
              <AppText
                variant="caption"
                style={[
                  styles.brandSubtitle,
                  { color: isDark ? '#A7F3D0' : '#065F46' },
                ]}
              >
                Không Gian Ẩm Thực Thông Minh
              </AppText>
            </View>
          </View>

          {/* Quick Demo Credentials Pill Bar */}
          <View style={styles.demoBar}>
            <AppText
              variant="label"
              style={[styles.demoLabel, { color: isDark ? '#9CA3AF' : '#6B7280' }]}
            >
              Tài khoản mẫu:
            </AppText>

            <View style={styles.demoButtonsRow}>
              <Pressable
                onPress={() => fillCredentials('admin')}
                style={[
                  styles.demoPill,
                  {
                    backgroundColor:
                      selectedDemo === 'admin'
                        ? isDark ? 'rgba(52, 211, 153, 0.25)' : 'rgba(46, 125, 79, 0.2)'
                        : isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                    borderColor:
                      selectedDemo === 'admin'
                        ? isDark ? '#34D399' : '#2E7D4F'
                        : isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                  },
                ]}
              >
                <AppText style={styles.demoEmoji}>👑</AppText>
                <AppText
                  style={[
                    styles.demoPillText,
                    {
                      color:
                        selectedDemo === 'admin'
                          ? isDark ? '#34D399' : '#2E7D4F'
                          : isDark ? '#E5E7EB' : '#374151',
                    },
                  ]}
                >
                  Admin
                </AppText>
              </Pressable>

              <Pressable
                onPress={() => fillCredentials('chef')}
                style={[
                  styles.demoPill,
                  {
                    backgroundColor:
                      selectedDemo === 'chef'
                        ? isDark ? 'rgba(245, 158, 11, 0.25)' : 'rgba(217, 119, 6, 0.2)'
                        : isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                    borderColor:
                      selectedDemo === 'chef'
                        ? isDark ? '#FBBF24' : '#D97706'
                        : isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                  },
                ]}
              >
                <AppText style={styles.demoEmoji}>👨‍🍳</AppText>
                <AppText
                  style={[
                    styles.demoPillText,
                    {
                      color:
                        selectedDemo === 'chef'
                          ? isDark ? '#FBBF24' : '#D97706'
                          : isDark ? '#E5E7EB' : '#374151',
                    },
                  ]}
                >
                  Đầu bếp
                </AppText>
              </Pressable>
            </View>
          </View>

          {/* Interactive 3D Perspective Tilt Card */}
          <TiltCard3D isDark={isDark} shakeTrigger={form.formError}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View>
                <AppText
                  variant="heading"
                  style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#111827' }]}
                >
                  Đăng Nhập
                </AppText>
                <AppText
                  variant="caption"
                  style={[styles.cardSubtitle, { color: isDark ? '#9CA3AF' : '#6B7280' }]}
                >
                  Mở khóa tủ nguyên liệu và công thức AI
                </AppText>
              </View>

              {/* 3D Depth Indicator Badge */}
              <View
                style={[
                  styles.cardCornerBadge,
                  { backgroundColor: isDark ? 'rgba(52, 211, 153, 0.15)' : 'rgba(46, 125, 79, 0.12)' },
                ]}
              >
                <Ionicons
                  name="cube-outline"
                  size={15}
                  color={isDark ? '#34D399' : '#2E7D4F'}
                />
              </View>
            </View>

            {/* Email Field with 3D Glass */}
            <GlassInput3D
              label="Tài khoản Email"
              iconName="mail-outline"
              placeholder="nhap.email@vidu.com"
              keyboardType="email-address"
              value={form.values.email}
              onChangeText={form.setValue('email')}
              error={form.errors.email}
              isDark={isDark}
            />

            {/* Password Field with 3D Glass */}
            <GlassInput3D
              label="Mật khẩu bảo mật"
              iconName="lock-closed-outline"
              placeholder="••••••••"
              secureTextEntry
              value={form.values.password}
              onChangeText={form.setValue('password')}
              error={form.errors.password}
              isDark={isDark}
            />

            {/* Forgot Password */}
            <View style={styles.forgotRow}>
              <Link href="/forgot-password" asChild>
                <Pressable hitSlop={8}>
                  <AppText
                    variant="link"
                    style={[styles.forgotText, { color: isDark ? '#6EE7B7' : '#2E7D4F' }]}
                  >
                    Quên mật khẩu?
                  </AppText>
                </Pressable>
              </Link>
            </View>

            {/* Server / Form Error Banner with 3D Alert Bevel */}
            {form.formError ? (
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.18)' : 'rgba(254, 226, 226, 0.9)',
                    borderColor: isDark ? 'rgba(248, 113, 113, 0.5)' : '#EF4444',
                  },
                ]}
              >
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <AppText variant="error" style={styles.bannerErrorText}>
                  {form.formError}
                </AppText>
              </View>
            ) : null}

            {/* 3D Tactile Submit Button */}
            <TactileButton3D
              title="Đăng Nhập Ngay"
              loading={form.loading}
              onPress={form.submit}
              iconName="arrow-forward-outline"
            />

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)' },
                ]}
              />
              <AppText
                variant="caption"
                style={[styles.dividerText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}
              >
                hoặc tiếp tục với
              </AppText>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)' },
                ]}
              />
            </View>

            {/* Social / Quick Biometric Actions */}
            <View style={styles.socialRow}>
              {/* Biometric Touch/Face */}
              <Pressable
                onPress={handleBiometricSimulation}
                style={[
                  styles.socialBtn,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                  },
                ]}
              >
                <Ionicons
                  name="finger-print-outline"
                  size={22}
                  color={isDark ? '#34D399' : '#2E7D4F'}
                />
              </Pressable>

              {/* Google Glass Pill */}
              <Pressable
                onPress={() => fillCredentials('admin')}
                style={[
                  styles.socialBtn,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                  },
                ]}
              >
                <Ionicons name="logo-google" size={20} color={isDark ? '#F87171' : '#EA4335'} />
              </Pressable>

              {/* Apple Glass Pill */}
              <Pressable
                onPress={() => fillCredentials('chef')}
                style={[
                  styles.socialBtn,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                  },
                ]}
              >
                <Ionicons name="logo-apple" size={21} color={isDark ? '#FFFFFF' : '#000000'} />
              </Pressable>
            </View>
          </TiltCard3D>

          {/* Footer Register Link */}
          <View style={styles.footer}>
            <AppText
              variant="caption"
              style={[styles.footerText, { color: isDark ? '#9CA3AF' : '#6B7280' }]}
            >
              Chưa có tài khoản bếp của bạn?
            </AppText>
            <Link href="/register" asChild>
              <Pressable hitSlop={8}>
                <AppText
                  variant="link"
                  style={[styles.registerLink, { color: isDark ? '#34D399' : '#2E7D4F' }]}
                >
                  Đăng ký ngay
                </AppText>
              </Pressable>
            </Link>
          </View>

          {/* 3D Interaction Hint Badge */}
          <View
            style={[
              styles.interactionHint,
              { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)' },
            ]}
          >
            <Ionicons name="sparkles" size={12} color="#FBBF24" />
            <AppText
              variant="label"
              style={[styles.hintText, { color: isDark ? '#6B7280' : '#9CA3AF' }]}
            >
              Chạm & vuốt trên thẻ để trải nghiệm hiệu ứng 3D Parallax
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2.5,
    marginTop: 6,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  glowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  brandSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  demoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  demoLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
  },
  demoEmoji: {
    fontSize: 12,
  },
  demoPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 3,
  },
  cardCornerBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginTop: -2,
    marginBottom: 10,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    marginBottom: 10,
  },
  bannerErrorText: {
    fontSize: 13,
    flex: 1,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '500',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 2,
  },
  socialBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    gap: 6,
  },
  footerText: {
    fontSize: 13,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  interactionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'center',
    gap: 6,
  },
  hintText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
