import "../global.css";
import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { store } from "@/store";
import { AppBootstrap } from "@/store/AppBootstrap";
import { useAuth } from "@/features/auth/useAuth";
import { forbiddenEvent } from "@/core/events/emitter";
import { useAppTheme } from "@/core/theme/useAppTheme";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { status } = useAuth();
  const { palette, isDark } = useAppTheme();
  const router = useRouter();
  const isAuthed = status === "authenticated";

  useEffect(() => {
    if (status !== "loading") SplashScreen.hideAsync();
  }, [status]);

  // 403 từ API -> trang Forbidden
  useEffect(() => forbiddenEvent.on(() => router.push("/forbidden")), [router]);

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.canvas },
        }}>
        {/* Khu vực đã đăng nhập */}
        <Stack.Protected guard={isAuthed}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="pantry/[id]" />
          <Stack.Screen name="pantry/new" />
          <Stack.Screen name="pantry/select-ingredient" />
          <Stack.Screen name="pantry/new-ingredient" />
          <Stack.Screen name="pantry/scan-review" />
          <Stack.Screen name="pantry/expiring" />
          <Stack.Screen name="search/results" />
          <Stack.Screen name="search/suggestions" />
          <Stack.Screen name="recipe/external/[externalId]" />
          <Stack.Screen name="recipe/similar" />
          <Stack.Screen name="recipe/cooking" />
          <Stack.Screen name="meal-plan/add-entry" />
          <Stack.Screen name="meal-plan/shopping-preview" />
          <Stack.Screen name="meal-plan/[id]" />
          <Stack.Screen name="ai/meal-plan" />
          <Stack.Screen name="pantry/barcode" />
          <Stack.Screen name="settings/excluded-ingredients" />
          <Stack.Screen name="settings/notifications" />
          <Stack.Screen name="dev/dev-tools" />
          <Stack.Screen name="shopping/index" />
          <Stack.Screen name="shopping/[id]" />
          <Stack.Screen name="recipe/custom/index" />
          <Stack.Screen name="recipe/custom/[id]" />
          <Stack.Screen name="recipe/custom/form" />
          <Stack.Screen name="settings/unit-converter" />
          <Stack.Screen name="settings/feedback" />
          <Stack.Screen name="settings/about" />
          <Stack.Screen
            name="settings/preferences"
            options={{
              headerShown: true,
              title: "Giao diện & hệ đo",
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
