import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "@/components/ui/AppText";
import { useForm } from "@/components/ui/useForm";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { useAuth } from "@/features/auth/useAuth";
import { validators } from "@/features/auth/validation";
import { LivingBackground4D } from "@/components/auth/LivingBackground4D";
import { HeroBadge3D } from "@/components/auth/HeroBadge3D";
import { TiltCard3D } from "@/components/auth/TiltCard3D";
import { GlassInput3D } from "@/components/auth/GlassInput3D";
import { TactileButton } from "@/components/ui/TactileButton";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const { signIn } = useAuth();
  const router = useRouter();
  const [selectedDemo, setSelectedDemo] = useState<"admin" | "chef" | null>(
    null,
  );

  const form = useForm(
    { email: "admin@gmail.com", password: "Admin@123" },
    { email: validators.email, password: validators.password },
    signIn,
  );

  return (
    <View style={styles.root}>
      {/* 4D Living Background with Autonomous Fluid Energy & Particles */}
      <LivingBackground4D isDark={isDark} />

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top + 10, 24),
              paddingBottom: Math.max(insets.bottom + 20, 32),
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Header 3D Holographic Crest & Title */}
          <View style={styles.header}>
            <HeroBadge3D isDark={isDark} />

            <AppText
              variant="title"
              style={[
                styles.brandTitle,
                { color: isDark ? "#F3F4F6" : "#111827" },
              ]}>
              PANTRY CHEF
            </AppText>

            <View style={styles.subtitleRow}>
              <AppText
                variant="caption"
                style={[
                  styles.brandSubtitle,
                  { color: isDark ? "#A7F3D0" : "#065F46" },
                ]}>
                Không Gian Ẩm Thực Thông Minh
              </AppText>
            </View>
          </View>

          {/* Interactive 3D Perspective Tilt Card */}
          <TiltCard3D isDark={isDark} shakeTrigger={form.formError}>
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View>
                <AppText
                  variant="heading"
                  style={[
                    styles.cardTitle,
                    { color: isDark ? "#FFFFFF" : "#111827" },
                  ]}>
                  Đăng Nhập
                </AppText>
              </View>
            </View>

            {/* Email Field with 3D Glass */}
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

            {/* Password Field with 3D Glass */}
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

            {/* Forgot Password */}
            <View style={styles.forgotRow}>
              <Link href="/forgot-password" asChild>
                <Pressable hitSlop={8}>
                  <AppText
                    variant="link"
                    style={[
                      styles.forgotText,
                      { color: isDark ? "#6EE7B7" : "#2E7D4F" },
                    ]}>
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
                    backgroundColor: isDark
                      ? "rgba(239, 68, 68, 0.18)"
                      : "rgba(254, 226, 226, 0.9)",
                    borderColor: isDark
                      ? "rgba(248, 113, 113, 0.5)"
                      : "#EF4444",
                  },
                ]}>
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <AppText variant="error" style={styles.bannerErrorText}>
                  {form.formError}
                </AppText>
              </View>
            ) : null}

            {/* 3D Tactile Submit Button */}
            <TactileButton
              title="Đăng Nhập Ngay"
              loading={form.loading}
              onPress={form.submit}
            />
          </TiltCard3D>

          {/* Footer Register Link */}
          <View style={styles.footer}>
            <AppText
              variant="caption"
              style={[
                styles.footerText,
                { color: isDark ? "#9CA3AF" : "#6B7280" },
              ]}>
              Chưa có tài khoản bếp của bạn?
            </AppText>
            <Link href="/register" asChild>
              <Pressable hitSlop={8}>
                <AppText
                  variant="link"
                  style={[
                    styles.registerLink,
                    { color: isDark ? "#34D399" : "#2E7D4F" },
                  ]}>
                  Đăng ký ngay
                </AppText>
              </Pressable>
            </Link>
          </View>

          {/* 3D Ínteraction Hint Badge */}
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
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 2.5,
    marginTop: 6,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  demoBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  demoLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  demoButtonsRow: {
    flexDirection: "row",
    gap: 8,
  },
  demoPill: {
    flexDirection: "row",
    alignItems: "center",
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
    fontWeight: "700",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
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
    alignItems: "center",
    justifyContent: "center",
  },
  forgotRow: {
    alignItems: "flex-end",
    marginTop: -2,
    marginBottom: 10,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "600",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
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
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    gap: 6,
  },
  footerText: {
    fontSize: 13,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: "700",
  },
  interactionHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "center",
    gap: 6,
  },
  hintText: {
    fontSize: 11,
    fontWeight: "500",
  },
});
