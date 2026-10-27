import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  deleteAccount,
  refreshUser,
  updateAvatar,
  updateProfile,
} from "./userSlice";

/** Chỉ subscribe profile; màn hình nào cần trạng thái loading thì dùng useUserStatus. */
export function useUser() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.user.profile);

  const refresh = useCallback(() => dispatch(refreshUser()), [dispatch]);

  const updateProfileAction = useCallback(
    (body: Parameters<typeof updateProfile>[0]) =>
      dispatch(updateProfile(body)),
    [dispatch],
  );

  const updateAvatarAction = useCallback(
    (image: Parameters<typeof updateAvatar>[0]) =>
      dispatch(updateAvatar(image)),
    [dispatch],
  );

  const deleteAccountAction = useCallback(
    () => dispatch(deleteAccount()),
    [dispatch],
  );

  return {
    user,
    refresh,
    updateProfile: updateProfileAction,
    updateAvatar: updateAvatarAction,
    deleteAccount: deleteAccountAction,
  };
}

export function useUserStatus() {
  return useAppSelector((s) => s.user.status);
}
