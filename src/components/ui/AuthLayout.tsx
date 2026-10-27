import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { AppText } from './AppText';
import { Screen } from './Screen';

interface AuthLayoutProps { title: string; subtitle: string; children: ReactNode }

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen className="gap-4 pt-10">
        <AppText variant="title">{title}</AppText>
        <AppText variant="caption" className="mb-2">{subtitle}</AppText>
        {children}
      </Screen>
    </KeyboardAvoidingView>
  );
}
