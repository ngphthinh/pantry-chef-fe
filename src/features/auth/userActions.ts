import { authService, userService } from "@/core/di/container";
import { authenticated, unauthenticated } from "@/features/auth/authSlice";
import type { AppThunk } from "@/store/hooks";
import type { PickedImage, UserUpdateRequest } from "@/types";

/*
 * Profile nằm trong auth.user nên các thunk này cập nhật qua action của authSlice.
 * Thunk thường để lỗi gốc được ném nguyên cho màn hình.
 */

export const refreshUser = (): AppThunk<Promise<void>> => async (dispatch) => {
  dispatch(authenticated(await userService.getMe()));
};

export const updateProfile =
  (body: UserUpdateRequest): AppThunk<Promise<void>> =>
  async (dispatch) => {
    dispatch(authenticated(await userService.updateMe(body)));
  };

export const updateAvatar =
  (image: PickedImage): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await userService.updateAvatar(image);
    dispatch(authenticated(await userService.getMe())); // lấy lại để có URL avatar mới
  };

export const deleteAccount =
  (): AppThunk<Promise<void>> => async (dispatch) => {
    await userService.deleteMe();
    await authService.clearLocalSession();
    dispatch(unauthenticated());
  };
