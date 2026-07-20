import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@renderer/store';

/**
 * 类型安全的 dispatch hook。
 * 组件里使用它可以直接 dispatch Redux action，并保留 AppDispatch 类型推导。
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

/**
 * 类型安全的 selector hook。
 * 组件里使用它读取 Redux state 时，可以自动识别 RootState 的结构。
 */
export const useAppSelector = useSelector.withTypes<RootState>();
