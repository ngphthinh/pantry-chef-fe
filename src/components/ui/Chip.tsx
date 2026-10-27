import { Pressable } from 'react-native';
import { AppText } from './AppText';
import { cn } from './cn';

interface ChipProps { label: string; selected?: boolean; onPress?: () => void }

export function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn('rounded-full px-4 py-2', selected ? 'bg-brandSoft dark:bg-successBg-dark' : 'bg-soft dark:bg-soft-dark')}
    >
      <AppText className="font-semibold">{label}</AppText>
    </Pressable>
  );
}
