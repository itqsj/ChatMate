import { createTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';
import { COLOR_MODE, COLOR_MODE_STORAGE_KEY } from '../constants/theme';

export type ColorMode = PaletteMode;

export const SYSTEM_DARK_MODE_QUERY = '(prefers-color-scheme: dark)';
export const DARK_BACKGROUND =
  'linear-gradient(200.96deg, #020617 -29.09%, #1e1b4b 51.77%, #831843 129.35%)';
export const LIGHT_BACKGROUND =
  'linear-gradient(200.96deg, #ecfeff -29.09%, #dbeafe 51.77%, #fef9c3 129.35%)';

/**
 * 判断读取到的主题模式是否是项目支持的值。
 */
export const isColorMode = (value: string | null): value is ColorMode => {
  return value === COLOR_MODE.LIGHT || value === COLOR_MODE.DARK;
};

/**
 * 获取系统当前的明暗主题偏好。
 */
export const getSystemColorMode = (): ColorMode => {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return COLOR_MODE.LIGHT;
  }

  return window.matchMedia(SYSTEM_DARK_MODE_QUERY).matches
    ? COLOR_MODE.DARK
    : COLOR_MODE.LIGHT;
};

/**
 * 获取应用初始化主题，优先使用用户上次手动选择的主题。
 */
export const getInitialColorMode = (): ColorMode => {
  if (typeof window === 'undefined') {
    return COLOR_MODE.LIGHT;
  }

  const storedMode = window.localStorage.getItem(COLOR_MODE_STORAGE_KEY);

  if (isColorMode(storedMode)) {
    return storedMode;
  }

  return getSystemColorMode();
};

/**
 * 判断用户是否已经手动选择过主题。
 */
export const hasSavedColorMode = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return isColorMode(window.localStorage.getItem(COLOR_MODE_STORAGE_KEY));
};

/**
 * 保存用户手动选择的主题模式。
 */
export const saveColorMode = (mode: ColorMode) => {
  window.localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode);
};

/**
 * 创建 Material UI 全局主题。
 */
export const createAppTheme = (mode: ColorMode) => {
  return createTheme({
    palette: {
      mode,
      primary: {
        main: '#2563eb',
      },
      secondary: {
        main: '#db2777',
      },
      background: {
        default: mode === COLOR_MODE.DARK ? DARK_BACKGROUND : LIGHT_BACKGROUND,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 700,
          },
        },
      },
    },
  });
};
