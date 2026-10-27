import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { changePassword, signIn, signOut, signUp } from './authSlice';

/** Giữ nguyên API cũ của useAuth để các màn hình không phải sửa. */
export function useAuth() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.status);
  const user = useAppSelector((s) => s.auth.user);

  return useMemo(
    () => ({
      status,
      user,
      signIn: (input: Parameters<typeof signIn>[0]) => dispatch(signIn(input)),
      signUp: (input: Parameters<typeof signUp>[0]) => dispatch(signUp(input)),
      changePassword: (input: Parameters<typeof changePassword>[0]) => dispatch(changePassword(input)),
      signOut: () => dispatch(signOut()),
    }),
    [status, user, dispatch],
  );
}
