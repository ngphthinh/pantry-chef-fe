import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { cn } from '@/components/ui/cn';
import { useAppTheme } from '@/core/theme/useAppTheme';
import { useAppliedSubstitutions } from '@/features/ai/useAppliedSubstitutions';

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export interface SubstituteButtonProps {
  recipeTitle?: string;
  recipeId?: string;
  ingredientName: string;
  className?: string;
}

export function SubstituteButton({
  recipeTitle,
  recipeId,
  ingredientName,
  className,
}: SubstituteButtonProps) {
  const router = useRouter();
  const { brand, palette } = useAppTheme();
  const { getSubstitution, remove } = useAppliedSubstitutions(
    recipeId,
    recipeTitle,
  );

  const applied = getSubstitution(ingredientName);

  const handlePress = () => {
    const trimmed = ingredientName.trim();
    if (!trimmed) return;

    const validUuid =
      recipeId && UUID_REGEX.test(recipeId) ? recipeId : undefined;

    router.push({
      pathname: '/ai/substitutions',
      params: {
        ...(validUuid ? { recipeId: validUuid } : {}),
        ...(recipeTitle ? { recipeTitle: recipeTitle.trim() } : {}),
        missingIngredient: trimmed,
      },
    });
  };

  if (applied) {
    return (
      <View className="flex-row items-center gap-1.5">
        <Pressable
          onPress={handlePress}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`Đổi nguyên liệu thay thế cho ${ingredientName}`}
          className={cn(
            'flex-row items-center gap-1 rounded-full border border-successInk/40 bg-successBg px-2 py-1 active:scale-95 dark:border-successInk-dark/40 dark:bg-successBg-dark',
            className,
          )}
        >
          <Ionicons
            name="swap-horizontal"
            size={13}
            color={palette.successInk}
          />
          <AppText className="text-xs font-semibold text-successInk dark:text-successInk-dark">
            Đổi
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => remove(ingredientName)}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel={`Hủy thay thế cho ${ingredientName}`}
          className="h-6 w-6 items-center justify-center rounded-full bg-soft active:scale-90 dark:bg-soft-dark"
        >
          <Ionicons name="close" size={13} color={palette.muted} />
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={`Tìm nguyên liệu thay thế cho ${ingredientName}`}
      className={cn(
        'flex-row items-center gap-1 rounded-full border border-brand/30 bg-brandSoft/60 px-2 py-1 active:scale-95 dark:border-brand/40 dark:bg-surface-dark',
        className,
      )}
    >
      <Ionicons name="swap-horizontal" size={13} color={brand} />
      <AppText className="text-xs font-semibold text-brand">Thay thế</AppText>
    </Pressable>
  );
}

export function AppliedSubstituteInfo({
  recipeId,
  recipeTitle,
  ingredientName,
}: {
  recipeId?: string;
  recipeTitle?: string;
  ingredientName: string;
}) {
  const { getSubstitution } = useAppliedSubstitutions(recipeId, recipeTitle);
  const applied = getSubstitution(ingredientName);
  if (!applied) return null;

  return (
    <View className="mt-0.5 flex-row items-center gap-1">
      <Ionicons name="arrow-forward" size={11} color="#10B981" />
      <AppText className="text-xs font-semibold text-successInk dark:text-successInk-dark">
        Thay bằng: {applied.name} {applied.ratio ? `(${applied.ratio})` : ''}
      </AppText>
    </View>
  );
}
