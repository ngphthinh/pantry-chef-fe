import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { expiryReminderService } from "@/core/di/container";
import { unauthenticated } from "@/features/auth/authSlice";
import type { AppThunk } from "@/store/hooks";
import {
  DEFAULT_REMINDER_SETTINGS,
  type ExpiryReminderSettings,
  type ReminderPermission,
  type ReminderPlan,
} from "./types";

export type ExpiryReminderStatus = "idle" | "loading" | "applying";

interface ExpiryReminderState {
  settings: ExpiryReminderSettings;
  permission: ReminderPermission;
  plan: ReminderPlan | null;
  loaded: boolean;
  status: ExpiryReminderStatus;
}

const initialState: ExpiryReminderState = {
  settings: DEFAULT_REMINDER_SETTINGS,
  permission: "undetermined",
  plan: null,
  loaded: false,
  status: "idle",
};

const expiryReminderSlice = createSlice({
  name: "expiryReminder",
  initialState,
  reducers: {
    statusChanged(state, action: PayloadAction<ExpiryReminderStatus>) {
      state.status = action.payload;
    },
    settingsLoaded(
      state,
      action: PayloadAction<{ settings: ExpiryReminderSettings; permission: ReminderPermission }>,
    ) {
      state.settings = action.payload.settings;
      state.permission = action.payload.permission;
      state.loaded = true;
    },
    settingsChanged(state, action: PayloadAction<ExpiryReminderSettings>) {
      state.settings = action.payload;
    },
    permissionChanged(state, action: PayloadAction<ReminderPermission>) {
      state.permission = action.payload;
    },
    planChanged(state, action: PayloadAction<ReminderPlan | null>) {
      state.plan = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Đăng xuất thì xoá state. Thông báo đã lên lịch trên máy thì phải huỷ riêng bằng `cancelExpiryReminder`.
    builder.addCase(unauthenticated, () => initialState);
  },
});

export const { statusChanged, settingsLoaded, settingsChanged, permissionChanged, planChanged } =
  expiryReminderSlice.actions;
export default expiryReminderSlice.reducer;

/*
 * Thunk thường (không dùng createAsyncThunk) để lỗi gốc được ném nguyên cho hook.
 */

export const loadExpiryReminder = (): AppThunk<Promise<void>> => async (dispatch) => {
  dispatch(statusChanged("loading"));
  try {
    const [settings, permission] = await Promise.all([
      expiryReminderService.loadSettings(),
      expiryReminderService.getPermission(),
    ]);
    dispatch(settingsLoaded({ settings, permission }));
  } finally {
    dispatch(statusChanged("idle"));
  }
};

/** Lưu cài đặt rồi lên lịch lại. Bật lần đầu thì xin quyền thông báo trước. */
export const saveExpiryReminder =
  (next: ExpiryReminderSettings): AppThunk<Promise<ReminderPlan>> =>
  async (dispatch) => {
    dispatch(statusChanged("applying"));
    try {
      if (next.enabled) {
        let permission = await expiryReminderService.getPermission();
        if (permission !== "granted") permission = await expiryReminderService.requestPermission();
        dispatch(permissionChanged(permission));
        if (permission !== "granted") {
          throw new Error("Chưa được cấp quyền thông báo. Hãy bật thông báo cho ứng dụng trong Cài đặt của thiết bị.");
        }
      }
      const saved = await expiryReminderService.saveSettings(next);
      dispatch(settingsChanged(saved));
      const plan = await expiryReminderService.apply(saved);
      dispatch(planChanged(plan));
      return plan;
    } finally {
      dispatch(statusChanged("idle"));
    }
  };

/**
 * Lên lịch lại theo cài đặt đã lưu (không đổi cài đặt). Gọi khi mở app hoặc sau khi tủ thay đổi,
 * vì nội dung thông báo được tính lúc lên lịch.
 */
export const refreshExpiryReminder = (): AppThunk<Promise<ReminderPlan | null>> => async (dispatch) => {
  const settings = await expiryReminderService.loadSettings();
  dispatch(settingsChanged(settings));
  if (!settings.enabled) return null;
  const plan = await expiryReminderService.apply(settings);
  dispatch(planChanged(plan));
  return plan;
};

/**
 * Huỷ mọi thông báo nhắc đã lên lịch. Nên gọi khi đăng xuất / xoá tài khoản để tài khoản sau
 * không nhận thông báo về tủ của tài khoản trước.
 */
export const cancelExpiryReminder = (): AppThunk<Promise<void>> => async (dispatch) => {
  await expiryReminderService.cancelAll();
  dispatch(planChanged(null));
};
