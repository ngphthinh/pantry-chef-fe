import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { statsService } from "@/core/di/container";
import { unauthenticated } from "@/features/auth/authSlice";
import type { AppThunk } from "@/store/hooks";
import type { UserStatsResponse } from "@/types";

export type StatsStatus = "idle" | "loading";

interface StatsState {
    data: UserStatsResponse | null;
    status: StatsStatus;
}

const initialState: StatsState = { data: null, status: "idle" };

const statsSlice = createSlice({
    name: "stats",
    initialState,
    reducers: {
        statusChanged(state, action: PayloadAction<StatsStatus>) {
            state.status = action.payload;
        },
        statsLoaded(state, action: PayloadAction<UserStatsResponse>) {
            state.data = action.payload;
        },
        cleared: () => initialState,
    },
    extraReducers: (builder) => {
        builder.addCase(unauthenticated, () => initialState);
    },
});

export const { statusChanged, statsLoaded, cleared } = statsSlice.actions;
export default statsSlice.reducer;

export const fetchStats = (): AppThunk<Promise<void>> => async (dispatch) => {
    dispatch(statusChanged("loading"));
    try {
        dispatch(statsLoaded(await statsService.getMe()));
    } finally {
        dispatch(statusChanged("idle"));
    }
};