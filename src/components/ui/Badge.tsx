import { View } from 'react-native';
import { AppText } from './AppText';
import { cn } from './cn';

const tones = {
  success: ['bg-successBg dark:bg-successBg-dark', 'text-successInk dark:text-successInk-dark'],
  warn: ['bg-warnBg dark:bg-warnBg-dark', 'text-warnInk dark:text-warnInk-dark'],
  danger: ['bg-dangerBg dark:bg-dangerBg-dark', 'text-dangerInk dark:text-dangerInk-dark'],
} as const;

export function Badge({ label, tone }: { label: string; tone: keyof typeof tones }) {
  return (
    <View className={cn('rounded-full px-3 py-1', tones[tone][0])}>
      <AppText className={cn('text-sm font-semibold', tones[tone][1])}>{label}</AppText>
    </View>
  );
}
