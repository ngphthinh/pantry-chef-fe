import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { kvStorage } from '@/core/di/container';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { ONBOARDING_KEY } from '@/features/auth/onboardingFlag';

export default function OnboardingScreen() {
  const router = useRouter();
  const { brand } = useAppTheme();

  const start = async () => {
    await kvStorage.set(ONBOARDING_KEY, '1');
    router.replace('/login');
  };

  return (
    <Screen scroll={false} className="justify-center gap-4">
      <View className="mb-4 h-28 w-28 items-center justify-center self-center rounded-full bg-brandSoft dark:bg-successBg-dark">
        <Ionicons name="restaurant-outline" size={52} color={brand} />
      </View>
      <AppText variant="title" className="text-center">Pantry Chef</AppText>
      <AppText variant="caption" className="mb-6 text-center">
        Quản lý tủ nguyên liệu, tìm công thức theo những gì bạn đang có và lên thực đơn mỗi tuần.
      </AppText>
      <Button title="Bắt đầu" onPress={start} />
    </Screen>
  );
}
