import React, { useState, forwardRef } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { AppText } from './AppText';

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  leadingIcon?: keyof typeof Ionicons.glyphMap;
  containerStyle?: ViewStyle;
}

export const AppInput = forwardRef<any, AppInputProps>(function AppInput(
  {
    label,
    error,
    leadingIcon,
    secureTextEntry,
    value,
    onChangeText,
    containerStyle,
    style,
    ...props
  },
  ref,
) {
  const { colors, radius, spacing } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);

  const borderColor = error
    ? colors.error
    : isFocused
      ? colors.borderFocus
      : colors.border;

  const backgroundColor = isFocused ? colors.surface : colors.surfaceVariant;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <AppText
          variant="caption"
          style={[
            styles.label,
            {
              color: isFocused ? colors.borderFocus : colors.textSecondary,
            },
          ]}
        >
          {label}
        </AppText>
      ) : null}

      <View
        style={[
          styles.fieldWrapper,
          {
            backgroundColor,
            borderColor,
            borderRadius: radius.xl,
            paddingHorizontal: spacing.md,
          },
        ]}
      >
        {leadingIcon ? (
          <Ionicons
            name={leadingIcon}
            size={20}
            color={error ? colors.error : isFocused ? colors.borderFocus : colors.textSecondary}
            style={styles.leadingIcon}
          />
        ) : null}

        <TextInput
          ref={ref}
          style={[
            styles.input,
            {
              color: colors.textPrimary,
            },
            style,
          ]}
          placeholderTextColor={colors.textDisabled}
          autoCapitalize="none"
          secureTextEntry={hidden}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {secureTextEntry ? (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            style={styles.trailingAction}
          >
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : value && value.length > 0 ? (
          <Pressable
            onPress={() => onChangeText?.('')}
            hitSlop={10}
            style={styles.trailingAction}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color={colors.textDisabled}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={colors.error} />
          <AppText variant="error" style={[styles.errorText, { color: colors.error }]}>
            {error}
          </AppText>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 10,
  },
  label: {
    fontWeight: '600',
    fontSize: 13,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  fieldWrapper: {
    height: 48,
    borderWidth: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leadingIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 0,
  },
  trailingAction: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  errorText: {
    fontSize: 12,
  },
});
