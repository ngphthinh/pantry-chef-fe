import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { kvStorage } from '@/core/di/container';
import { ONBOARDING_KEY } from '@/features/auth/onboardingFlag';
import { useAuth } from '@/features/auth/useAuth';

/** Màn "index" (khởi động): chỉ quyết định điều hướng, không có UI. */
export default function Index() {
  const { status } = useAuth();
  const [seen, setSeen] = useState<boolean | null>(null);

  useEffect(() => {
    kvStorage.get(ONBOARDING_KEY).then((v) => setSeen(v === '1'));
  }, []);

  if (status === 'loading' || seen === null) return null;
  if (status === 'authenticated') return <Redirect href="/(tabs)/pantry" />;
  return <Redirect href={seen ? '/login' : '/onboarding'} />;
}
