import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { metaService } from "@/core/di/container";
import { unauthenticated } from "@/features/auth/authSlice";
import type { AppThunk } from "@/store/hooks";
import type { MetaEnumsResponse, Unit } from "@/types";
import type { MetaData } from "./metaService";

export type MetaStatus = "idle" | "loading";

interface MetaState {
  enums: MetaEnumsResponse | null;
  units: Unit[];
  status: MetaStatus;
}

const initialState: MetaState = { enums: null, units: [], status: "idle" };

const metaSlice = createSlice({
  name: "meta",
  initialState,
  reducers: {
    statusChanged(state, action: PayloadAction<MetaStatus>) {
      state.status = action.payload;
    },
    metaLoaded(state, action: PayloadAction<MetaData>) {
      state.enums = action.payload.enums;
      state.units = action.payload.units;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(unauthenticated, () => initialState);
  },
});

export const { statusChanged, metaLoaded } = metaSlice.actions;
export default metaSlice.reducer;

export const fetchMeta =
  (force = false): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const { enums, status } = getState().meta;
    if ((enums && !force) || status === "loading") return;
    dispatch(statusChanged("loading"));
    try {
      dispatch(metaLoaded(await metaService.load()));
    } finally {
      dispatch(statusChanged("idle"));
    }
  };
