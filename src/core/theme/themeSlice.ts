import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { kvStorage } from '../di/container';
import type { AppThunk } from '@/store/hooks';

export type ThemeMode = 'light' | 'dark' | 'system';
const KEY = 'pc.themeMode';

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: 'system' as ThemeMode },
  reducers: {
    modeChanged(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
    },
  },
});

export const { modeChanged } = themeSlice.actions;
export default themeSlice.reducer;

export const loadThemeMode = (): AppThunk<Promise<void>> => async (dispatch) => {
  const saved = await kvStorage.get(KEY);
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    dispatch(modeChanged(saved));
  }
};

export const setThemeMode =
  (mode: ThemeMode): AppThunk =>
  (dispatch) => {
    dispatch(modeChanged(mode));
    void kvStorage.set(KEY, mode);
  };
