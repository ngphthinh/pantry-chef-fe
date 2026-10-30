// components/auth/AuthShell.tsx
import React, { type ComponentProps, type ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { Link, type Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppText } from "@/components/ui/AppText";
import { useAppTheme } from "@/core/theme/useAppTheme";
import { LivingBackground4D } from "@/components/auth/LivingBackground4D";
import { HeroBadge3D } from "@/components/auth/HeroBadge3D";
import { TiltCard3D } from "@/components/auth/TiltCard3D";

interface AuthShellProps {
  subtitle: string;
  cardTitle: string;
  shakeTrigger?: ComponentProps<typeof TiltCard3D>["shakeTrigger"];
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({
  subtitle,
  cardTitle,
  shakeTrigger,
  children,
  footer,
}: AuthShellProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();

  return (
    <View className="flex-1">
      <LivingBackground4D isDark={isDark} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerClassName="flex-grow justify-center px-5"
          contentContainerStyle={{
            paddingTop: Math.max(insets.top + 10, 24),
            paddingBottom: Math.max(insets.bottom + 20, 32),
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View className="mb-4 items-center">
            <HeroBadge3D isDark={isDark} />
            <AppText
              variant="title"
              className="mt-1.5 text-[26px] font-black tracking-[2.5px] text-ink dark:text-ink-dark">
              PANTRY CHEF
            </AppText>
            <AppText
              variant="caption"
              className="mt-1 text-center text-[13px] font-semibold tracking-wide text-successInk dark:text-successInk-dark">
              {subtitle}
            </AppText>
          </View>

          <TiltCard3D isDark={isDark} shakeTrigger={shakeTrigger}>
            <AppText
              variant="heading"
              className="mb-[18px] text-[22px] font-extrabold tracking-wide text-ink dark:text-ink-dark">
              {cardTitle}
            </AppText>
            {children}
          </TiltCard3D>

          {footer}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export function AuthFooter({
  text,
  linkText,
  href,
  replace,
}: {
  text: string;
  linkText: string;
  href: Href;
  replace?: boolean;
}) {
  return (
    <View className="mt-[18px] flex-row items-center justify-center gap-1.5">
      <AppText
        variant="caption"
        className="text-[13px] text-muted dark:text-muted-dark">
        {text}
      </AppText>
      <Link href={href} replace={replace} asChild>
        <Pressable hitSlop={8}>
          <AppText variant="link" className="text-[13px] font-bold text-brand">
            {linkText}
          </AppText>
        </Pressable>
      </Link>
    </View>
  );
}

export function AuthErrorBanner({ message }: { message?: string | null }) {
  const { palette } = useAppTheme();
  if (!message) return null;
  return (
    <View className="mb-2.5 flex-row items-center gap-2 rounded-[14px] border border-dangerInk bg-dangerBg p-2.5 dark:border-dangerInk-dark dark:bg-dangerBg-dark">
      <Ionicons name="alert-circle" size={18} color={palette.dangerInk} />
      <AppText variant="error" className="flex-1 text-[13px]">
        {message}
      </AppText>
    </View>
  );
}
