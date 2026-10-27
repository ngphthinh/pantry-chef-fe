import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { AppText } from '../ui/AppText';
import { Button } from '../ui/Button';
import { Screen } from '../ui/Screen';

interface StatusScreenProps {
  code: string;
  title: string;
  message: string;
  icon: keyof typeof Ionicons.glyphMap;
}

/** Khung chung cho các trang trạng thái (403, 404, sau này 500/offline...). */
export function StatusScreen({ code, title, message, icon }: StatusScreenProps) {
  const router = useRouter();
  const { brand } = useAppTheme();
  return (
    <Screen scroll={false} className="items-center justify-center gap-3">
      <View className="h-24 w-24 items-center justify-center rounded-full bg-brandSoft dark:bg-successBg-dark">
        <Ionicons name={icon} size={44} color={brand} />
      </View>
      <AppText variant="label">Lỗi {code}</AppText>
      <AppText variant="title" className="text-center">{title}</AppText>
      <AppText variant="caption" className="mb-4 text-center">{message}</AppText>
      <Button title="Về trang chủ" onPress={() => router.replace('/')} className="self-stretch" />
    </Screen>
  );
}
