import { Text, type TextProps } from 'react-native';
import { cn } from './cn';

const variants = {
  title: 'text-3xl font-bold text-ink dark:text-ink-dark',
  heading: 'text-lg font-bold text-ink dark:text-ink-dark',
  body: 'text-base text-ink dark:text-ink-dark',
  caption: 'text-sm text-muted dark:text-muted-dark',
  label: 'text-xs font-semibold uppercase tracking-wider text-muted dark:text-muted-dark',
  link: 'text-base font-semibold text-brand',
  error: 'text-sm text-dangerInk dark:text-dangerInk-dark',
} as const;

export interface AppTextProps extends TextProps {
  variant?: keyof typeof variants;
}

export function AppText({ variant = 'body', className, ...props }: AppTextProps) {
  return <Text className={cn(variants[variant], className)} {...props} />;
}
