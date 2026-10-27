import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cn } from './cn';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  className?: string;
}

export function Screen({ children, scroll = true, className }: ScreenProps) {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-canvas dark:bg-canvas-dark">
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName={cn('px-5 pb-8 pt-3 gap-4', className)}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View className={cn('flex-1 px-5 pt-3', className)}>{children}</View>
      )}
    </SafeAreaView>
  );
}
