import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { authService, userService } from "@/core/di/container";
import { authenticated, unauthenticated } from "@/features/auth/authSlice";
import type { AppThunk } from "@/store/hooks";
import type { PickedImage, UserResponse, UserUpdateRequest } from "@/types";

export type UserStatus =
  | "idle"
  | "refreshing"
  | "updating"
  | "uploadingAvatar"
  | "deleting";

interface UserState {
  profile: UserResponse | null;
  status: UserStatus;
}

const initialState: UserState = { profile: null, status: "idle" };

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    statusChanged(state, action: PayloadAction<UserStatus>) {
      state.status = action.payload;
    },
  },
  /*
   * Ghi profile qua MỘT đường duy nhất: dispatch authenticated(user) / unauthenticated().
   * userSlice chỉ lắng nghe nên profile luôn đồng bộ với auth.user, không bị lệch.
   */
  extraReducers: (builder) => {
    builder
      .addCase(authenticated, (state, action) => {
        // Giữ nguyên tham chiếu nếu dữ liệu không đổi -> không kích hoạt render lại.
        if (JSON.stringify(state.profile) !== JSON.stringify(action.payload)) {
          state.profile = action.payload;
        }
      })
      .addCase(unauthenticated, () => initialState);
  },
});

export const { statusChanged } = userSlice.actions;
export default userSlice.reducer;

/*
 * Thunk thường (không dùng createAsyncThunk) để lỗi gốc được ném nguyên cho màn hình.
 */

const withStatus =
  <T>(status: UserStatus, run: () => Promise<T>): AppThunk<Promise<T>> =>
  async (dispatch) => {
    dispatch(statusChanged(status));
    try {
      return await run();
    } finally {
      dispatch(statusChanged("idle"));
    }
  };

export const refreshUser = (): AppThunk<Promise<void>> => (dispatch) =>
  dispatch(
    withStatus("refreshing", async () => {
      dispatch(authenticated(await userService.getMe()));
    }),
  );

export const updateProfile =
  (body: UserUpdateRequest): AppThunk<Promise<void>> =>
  (dispatch) =>
    dispatch(
      withStatus("updating", async () => {
        await userService.updateMe(body);
        // Response của PUT có thể thiếu email/avatar -> lấy lại hồ sơ đầy đủ để không ghi đè mất dữ liệu
        dispatch(authenticated(await userService.getMe()));
      }),
    );

export const updateAvatar =
  (image: PickedImage): AppThunk<Promise<void>> =>
  (dispatch) =>
    dispatch(
      withStatus("uploadingAvatar", async () => {
        await userService.updateAvatar(image);
        dispatch(authenticated(await userService.getMe())); // lấy lại để có URL avatar mới
      }),
    );

export const deleteAccount = (): AppThunk<Promise<void>> => (dispatch) =>
  dispatch(
    withStatus("deleting", async () => {
      await userService.deleteMe();
      await authService.clearLocalSession();
      dispatch(unauthenticated());
    }),
  );
