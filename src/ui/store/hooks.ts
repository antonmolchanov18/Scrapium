import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index'; // Імпортуйте ваші типи

// Типізований useSelector
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Типізований useDispatch
export const useAppDispatch = () => useDispatch<AppDispatch>();
