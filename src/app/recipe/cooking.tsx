import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { BackHeader } from '@/components/recipe/BackHeader';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { formatTimer } from '@/features/recipe/recipeLabels';
import { useCookingMode } from '@/features/recipe/useCookingMode';

const PERCENT = 100;

export default function CookingScreen() {
  const { externalId } = useLocalSearchParams<{ externalId: string }>();
  const router = useRouter();
  const { brand } = useAppTheme();
  const cooking = useCookingMode(externalId);

  if (cooking.error) {
    return (
      <Screen>
        <BackHeader title="Nấu ăn" />
        <Card className="items-center gap-2 p-5">
          <AppText variant="error" className="text-center">{cooking.error}</AppText>
          <Button title="Thử lại" variant="outline" onPress={cooking.reload} />
        </Card>
      </Screen>
    );
  }

  if (cooking.isLoading) {
    return (
      <Screen>
        <BackHeader title="Nấu ăn" />
        <ActivityIndicator color={brand} />
      </Screen>
    );
  }

  if (cooking.isEmpty || !cooking.step) {
    return (
      <Screen>
        <BackHeader title={cooking.title || 'Nấu ăn'} />
        <Card className="items-center p-5">
          <AppText className="text-center">Công thức này chưa có các bước thực hiện.</AppText>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <BackHeader title={cooking.title} subtitle={`Bước ${cooking.stepNumber}/${cooking.totalSteps}`} />

      <View className="h-2 overflow-hidden rounded-full bg-soft dark:bg-soft-dark">
        <View className="h-2 rounded-full bg-brand" style={{ width: `${cooking.progress * PERCENT}%` }} />
      </View>

      <Card className="gap-3 p-6">
        <AppText variant="label">Bước {cooking.stepNumber}</AppText>
        <AppText className="text-xl leading-8">{cooking.step.text}</AppText>
      </Card>

      {cooking.hasTimer && cooking.remainingSeconds !== null ? (
        <Card className="items-center gap-3 p-5">
          <AppText className={`text-5xl font-bold ${cooking.isAlarmed ? 'text-dangerInk dark:text-dangerInk-dark' : ''}`}>
            {formatTimer(cooking.remainingSeconds)}
          </AppText>
          {cooking.isAlarmed ? <AppText variant="heading">Hết giờ!</AppText> : null}
          <View className="w-full flex-row gap-3">
            <Button
              className="flex-1"
              title={cooking.isTimerRunning ? 'Tạm dừng' : cooking.isAlarmed ? 'Đếm lại' : 'Bắt đầu đếm giờ'}
              onPress={cooking.toggleTimer}
            />
            <Button className="flex-1" title="Đặt lại" variant="outline" onPress={cooking.resetTimer} />
          </View>
        </Card>
      ) : null}

      <View className="flex-row gap-3">
        <Button className="flex-1" title="Bước trước" variant="outline" disabled={cooking.isFirst} onPress={cooking.previous} />
        {cooking.isLast ? (
          <Button className="flex-1" title="Hoàn thành" onPress={() => router.back()} />
        ) : (
          <Button className="flex-1" title="Bước tiếp" onPress={cooking.next} />
        )}
      </View>
    </Screen>
  );
}
