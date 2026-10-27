import '../global.css';
import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { AppBootstrap } from '@/store/AppBootstrap';
import { useAuth } from '@/features/auth/useAuth';
import { forbiddenEvent } from '@/core/events/emitter';
import { useAppTheme } from '@/core/theme/useAppTheme';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { status } = useAuth();
  const { palette, isDark } = useAppTheme();
  const router = useRouter();
  const isAuthed = status === 'authenticated';

  useEffect(() => {
    if (status !== 'loading') SplashScreen.hideAsync();
  }, [status]);

  // 403 từ API -> trang Forbidden
  useEffect(() => forbiddenEvent.on(() => router.push('/forbidden')), [router]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: palette.canvas } }}>
        {/* Khu vực đã đăng nhập */}
        <Stack.Protected guard={isAuthed}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="settings/preferences"
            options={{
              headerShown: true,
              title: 'Giao diện & hệ đo',
              headerStyle: { backgroundColor: palette.canvas },
              headerTintColor: palette.ink,
              headerShadowVisible: false,
            }}
          />
        </Stack.Protected>

        {/* Khu vực chưa đăng nhập */}
        <Stack.Protected guard={!isAuthed}>
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen name="reset-password" />
        </Stack.Protected>

        {/* Dùng chung */}
        <Stack.Screen name="forbidden" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppBootstrap>
          <RootNavigator />
        </AppBootstrap>
      </Provider>
    </SafeAreaProvider>
  );
}
