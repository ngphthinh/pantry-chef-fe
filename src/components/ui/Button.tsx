import { ActivityIndicator, Pressable, type PressableProps } from 'react-native';
import { AppText } from './AppText';
import { cn } from './cn';

const containers = {
  primary: 'bg-brand',
  secondary: 'bg-brandSoft dark:bg-successBg-dark',
  outline: 'border border-line dark:border-line-dark bg-transparent',
  danger: 'bg-dangerBg dark:bg-dangerBg-dark',
} as const;

const labels = {
  primary: 'text-white',
  secondary: 'text-brand dark:text-successInk-dark',
  outline: 'text-ink dark:text-ink-dark',
  danger: 'text-dangerInk dark:text-dangerInk-dark',
} as const;

interface ButtonProps extends Omit<PressableProps, 'children'> {
  title: string;
  variant?: keyof typeof containers;
  loading?: boolean;
  className?: string;
}

export function Button({ title, variant = 'primary', loading, disabled, className, ...props }: ButtonProps) {
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={inactive}
      className={cn('h-12 items-center justify-center rounded-full px-6 active:opacity-80', containers[variant], inactive && 'opacity-60', className)}
      {...props}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <AppText className={cn('font-bold', labels[variant])}>{title}</AppText>}
    </Pressable>
  );
}
