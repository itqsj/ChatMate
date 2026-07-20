import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import type { ColorMode } from '@renderer/theme';
import { getInitialColorMode, saveColorMode } from '@renderer/theme';
import codeMateReducer from '@renderer/store/codeMateSlice';
import themeReducer, {
  setColorMode,
  toggleColorMode,
} from '@renderer/store/themeSlice';

/**
 * Redux listener middleware 用来处理 reducer 之外的副作用。
 * 这里专门监听主题设置动作，并把更新后的主题模式保存到 localStorage。
 */
const themeListenerMiddleware = createListenerMiddleware();

themeListenerMiddleware.startListening({
  matcher: (action) =>
    setColorMode.match(action) || toggleColorMode.match(action),
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as { theme: { mode: ColorMode } };

    saveColorMode(state.theme.mode);
  },
});

/**
 * 创建 Redux store，方便测试按用例重新初始化状态。
 * preloadedState 会在创建 store 时读取 localStorage 或系统主题，保证初始主题正确。
 */
export const createAppStore = () => {
  return configureStore({
    preloadedState: {
      theme: {
        mode: getInitialColorMode(),
      },
    },
    reducer: {
      codeMate: codeMateReducer,
      theme: themeReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(themeListenerMiddleware.middleware),
  });
};

/**
 * 应用运行时使用的全局 Redux store。
 */
export const store = createAppStore();

/**
 * 从 store 推导出的类型，供 typed hooks 和 dispatch 使用。
 */
export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
