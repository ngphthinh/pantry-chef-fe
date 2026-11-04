import React from 'react';
import { AppButton, type AppButtonProps } from './AppButton';

export interface ButtonProps extends Omit<AppButtonProps, 'variant'> {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  className?: string;
}

export function Button({
  title,
  variant = 'primary',
  loading,
  disabled,
  onPress,
  ...props
}: ButtonProps) {
  return (
    <AppButton
      title={title}
      variant={variant}
      loading={loading}
      disabled={disabled}
      onPress={onPress}
      {...props}
    />
  );
}
