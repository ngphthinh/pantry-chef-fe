import { View, type ViewProps } from 'react-native';
import { cn } from './cn';

export function Card({ className, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn('rounded-3xl border border-line bg-surface dark:border-line-dark dark:bg-surface-dark', className)}
      {...props}
    />
  );
}
