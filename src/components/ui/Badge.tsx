import React from 'react';
import { AppBadge, type BadgeTone } from './AppBadge';

export interface BadgeProps {
  label: string;
  tone: 'success' | 'warn' | 'danger' | 'warning' | 'info' | 'primary' | 'neutral';
}

export function Badge({ label, tone }: BadgeProps) {
  const mappedTone: BadgeTone =
    tone === 'warn' ? 'warning' : (tone as BadgeTone);

  return <AppBadge label={label} tone={mappedTone} />;
}
