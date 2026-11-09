import React, { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/theme';
import { AmbientBackground } from './AmbientBackground';

export interface AppScreenProps {
  children: ReactNode;
  scroll?: boolean;
  edges?: readonly Edge[];
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  ambient?: boolean;
}

/**
 * Màn hình chuẩn AppScreen:
 * Tự động đồng bộ StatusBar, màu nền hệ thống, quầng sáng môi trường Ambient, và SafeAreaView.
 */
export function AppScreen({
  children,
  scroll = true,
  edges = ['top'],
  style,
  contentContainerStyle,
  ambient = true,
}: AppScreenProps) {
  const { colors, spacing, isDark } = useTheme();

  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
        },
        style,
      ]}
    >
      {ambient && <AmbientBackground />}
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: spacing.lg,
              paddingBottom: Math.max(spacing['2xl'], 180),
              paddingTop: spacing.sm,
            },
            contentContainerStyle,
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={true}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          style={styles.keyboardView}
        >
          <View
            style={[
              styles.staticContent,
              {
                paddingHorizontal: spacing.lg,
                paddingTop: spacing.sm,
              },
              contentContainerStyle,
            ]}
          >
            {children}
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 16,
  },
  staticContent: {
    flex: 1,
  },
});

