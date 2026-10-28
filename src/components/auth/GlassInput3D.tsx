import React, { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/ui/AppText';

interface GlassInput3DProps extends TextInputProps {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  error?: string | null;
  isDark?: boolean;
}

export function GlassInput3D({
  label,
  iconName,
  error,
  isDark = true,
  secureTextEntry,
  value,
  onChangeText,
  ...props
}: GlassInput3DProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secureTextEntry);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      error
        ? isDark ? '#EF4444' : '#DC2626'
        : isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
      error
        ? isDark ? '#F87171' : '#EF4444'
        : isDark ? '#34D399' : '#2E7D4F',
    ],
  });

  const bgInterpolation = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [
      isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.65)',
      isDark ? 'rgba(46, 125, 79, 0.12)' : 'rgba(255, 255, 255, 0.95)',
    ],
  });

  return (
    <View style={styles.container}>
      {/* Input Label with Icon Accent */}
      <View style={styles.labelRow}>
        <AppText
          variant="caption"
          style={[
            styles.label,
            { color: isFocused ? (isDark ? '#34D399' : '#2E7D4F') : (isDark ? '#9CA3AF' : '#6B7280') },
          ]}
        >
          {label}
        </AppText>
      </View>

      {/* Glass Field */}
      <Animated.View
        style={[
          styles.fieldWrapper,
          {
            borderColor,
            backgroundColor: bgInterpolation,
            shadowColor: isFocused ? (isDark ? '#34D399' : '#2E7D4F') : '#000',
            shadowOpacity: isFocused ? 0.35 : 0.05,
            shadowRadius: isFocused ? 10 : 3,
            shadowOffset: { width: 0, height: isFocused ? 4 : 2 },
            elevation: isFocused ? 5 : 1,
          },
        ]}
      >
        {/* Leading 3D Icon */}
        <Ionicons
          name={iconName}
          size={20}
          color={
            error
              ? '#EF4444'
              : isFocused
              ? (isDark ? '#34D399' : '#2E7D4F')
              : (isDark ? '#9CA3AF' : '#6B7280')
          }
          style={styles.leadingIcon}
        />

        {/* Input */}
        <TextInput
          style={[
            styles.input,
            { color: isDark ? '#F9FAFB' : '#111827' },
          ]}
          placeholderTextColor={isDark ? '#6B7280' : '#9CA3AF'}
          autoCapitalize="none"
          secureTextEntry={hidden}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {/* Action icons (Show/Hide Password or Quick Clear) */}
        {secureTextEntry ? (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} style={styles.trailingAction}>
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={isDark ? '#9CA3AF' : '#6B7280'}
            />
          </Pressable>
        ) : value && value.length > 0 ? (
          <Pressable onPress={() => onChangeText?.('')} hitSlop={10} style={styles.trailingAction}>
            <Ionicons
              name="close-circle"
              size={18}
              color={isDark ? '#6B7280' : '#9CA3AF'}
            />
          </Pressable>
        ) : null}
      </Animated.View>

      {/* Error message */}
      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={isDark ? '#F87171' : '#DC2626'} />
          <AppText variant="error" style={styles.errorText}>
            {error}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  fieldWrapper: {
    height: 52,
    borderRadius: 18,
    borderWidth: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  leadingIcon: {
    marginRight: 10,
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
    marginTop: 5,
    gap: 4,
  },
  errorText: {
    fontSize: 12,
  },
});
