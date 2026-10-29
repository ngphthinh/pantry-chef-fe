import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { syncService } from "@/core/di/container";
import { unauthenticated } from "@/features/auth/authSlice";
import type { AppThunk } from "@/store/hooks";
import type { SyncStatusResponse } from "@/types";

export type SyncStatusLoading = "idle" | "loading";

interface SyncState {
  statuses: SyncStatusResponse[];
  loaded: boolean;
  status: SyncStatusLoading;
}

const initialState: SyncState = { statuses: [], loaded: false, status: "idle" };

const syncSlice = createSlice({
  name: "sync",
  initialState,
  reducers: {
    statusChanged(state, action: PayloadAction<SyncStatusLoading>) {
      state.status = action.payload;
    },
    statusesLoaded(state, action: PayloadAction<SyncStatusResponse[]>) {
      state.statuses = action.payload;
      state.loaded = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(unauthenticated, () => initialState);
  },
});

export const { statusChanged, statusesLoaded } = syncSlice.actions;
export default syncSlice.reducer;

/** Chỉ gọi API lần đầu; truyền `force` để tải lại. */
export const fetchSyncStatuses =
  (force = false): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { loaded, status } = getState().sync;
    if ((loaded && !force) || status === "loading") return;
    dispatch(statusChanged("loading"));
    try {
      dispatch(statusesLoaded(await syncService.listStatuses()));
    } finally {
      dispatch(statusChanged("idle"));
    }
  };
