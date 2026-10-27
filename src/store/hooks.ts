import { useDispatch, useSelector } from 'react-redux';
import type { ThunkAction, UnknownAction } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from './index';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export type AppThunk<R = void> = ThunkAction<R, RootState, unknown, UnknownAction>;
