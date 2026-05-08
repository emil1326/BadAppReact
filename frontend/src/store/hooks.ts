import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch, RootState } from './store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export const useAuth = () => useAppSelector((state) => state.auth);
export const useFlow = () => useAppSelector((state) => state.flow);
export const useUi = () => useAppSelector((state) => state.ui);
