import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { COLOR_MODE } from '@/constants/theme';
import type { ColorMode } from '@renderer/theme';

/**
 * 主题状态，目前只维护全局明暗主题模式。
 */
export type ThemeState = {
  mode: ColorMode;
};

/**
 * 默认值只作为 reducer fallback。
 * 真正运行时初始主题会在 createAppStore 的 preloadedState 中读取。
 */
const initialState: ThemeState = {
  mode: COLOR_MODE.LIGHT,
};

/**
 * 获取主题切换后的下一个模式。
 */
const getNextColorMode = (mode: ColorMode): ColorMode => {
  return mode === COLOR_MODE.DARK ? COLOR_MODE.LIGHT : COLOR_MODE.DARK;
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    /**
     * 设置明确的主题模式，用于系统主题变化等外部输入。
     */
    setColorMode(state, action: PayloadAction<ColorMode>) {
      state.mode = action.payload;
    },
    /**
     * 在 light 和 dark 之间切换，用于用户点击主题按钮。
     */
    toggleColorMode(state) {
      state.mode = getNextColorMode(state.mode);
    },
  },
});

export const { setColorMode, toggleColorMode } = themeSlice.actions;
export default themeSlice.reducer;
