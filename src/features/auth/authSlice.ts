import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { authService, tokenStorage } from "@/core/di/container";
import type { AppThunk } from "@/store/hooks";
import type {
  ChangePasswordRequest,
  LoginRequest,
  UserCreateRequest,
  UserResponse,
} from "@/types";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  status: AuthStatus;
  user: UserResponse | null;
}

const initialState: AuthState = { status: "loading", user: null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authenticated(state, action: PayloadAction<UserResponse>) {
      if (JSON.stringify(state.user) !== JSON.stringify(action.payload)) {
        state.user = action.payload;
      }
      state.status = "authenticated";
    },
    unauthenticated(state) {
      state.user = null;
      state.status = "unauthenticated";
    },
  },
});

export const { authenticated, unauthenticated } = authSlice.actions;
export default authSlice.reducer;

/*
 * Thunk thường (không dùng createAsyncThunk) để lỗi gốc (ApiError/AxiosError)
 * được ném nguyên vẹn cho màn hình xử lý, không bị serialize thành SerializedError.
 */

export const restoreSession =
  (): AppThunk<Promise<void>> => async (dispatch) => {
    try {
      const user = await authService.restore();
      dispatch(user ? authenticated(user) : unauthenticated());
    } catch {
      dispatch(unauthenticated());
    }
  };

export const signIn =
  (input: LoginRequest): AppThunk<Promise<void>> =>
  async (dispatch) => {
    const user = await authService.login(input);
    dispatch(authenticated(user));
  };

export const signUp =
  (input: UserCreateRequest): AppThunk<Promise<void>> =>
  async () => {
    await authService.register(input);
  };

export const changePassword =
  (input: ChangePasswordRequest): AppThunk<Promise<void>> =>
  async (dispatch) => {
    await authService.changePassword(input);
    dispatch(unauthenticated());
  };

export const signOut = (): AppThunk<Promise<void>> => async (dispatch) => {
  try {
    const accessToken = await tokenStorage.getAccessToken();
    const refreshToken = await tokenStorage.getRefreshToken();
    if (accessToken && refreshToken) {
      await authService.logout({ accessToken, refreshToken });
    }
  } finally {
    await tokenStorage.clear();
    dispatch(unauthenticated());
  }
};

/** Gọi khi API trả 401. */
export const handleUnauthorized = (): AppThunk => (dispatch) => {
  void authService.clearLocalSession();
  dispatch(unauthenticated());
};
