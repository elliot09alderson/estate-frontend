import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';

// Typed versions of useDispatch and useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T => useSelector(selector);

// Custom hook for auth state
export const useAuthState = () => {
  return useAppSelector((state) => state.auth);
};