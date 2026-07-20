import { createTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';
import { COLOR_MODE, COLOR_MODE_STORAGE_KEY } from '@/constants/theme';

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
    // palette 控制 MUI 全局颜色体系，组件默认会从这里读取主色、背景色和文本对比。
    palette: {
      // mode 告诉 MUI 当前是 light 还是 dark，影响组件的默认配色算法。
      mode,
      // primary 是应用主操作色，用于按钮、选中态、链接等强调元素。
      primary: {
        main: '#2563eb',
      },
      // secondary 是辅助强调色，用于次级按钮或少量装饰性强调。
      secondary: {
        main: '#db2777',
      },
      // background 定义页面和卡片类容器的基础背景。
      background: {
        default: mode === COLOR_MODE.DARK ? DARK_BACKGROUND : LIGHT_BACKGROUND,
        // paper 用作面板、弹层、输入框外壳等承载内容的背景色。
        paper: mode === COLOR_MODE.DARK ? '#111827' : '#ffffff',
      },
    },
    // shape 控制组件默认圆角。
    shape: {
      borderRadius: 5,
    },
    // typography 控制全局字体排版基准。
    typography: {
      fontSize: 12,
    },
    // components 用于覆盖 MUI 组件的默认属性和样式。
    components: {
      // MuiCssBaseline 注入全局基础样式。
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            scrollbarColor:
              mode === COLOR_MODE.DARK
                ? 'rgba(148, 163, 184, 0.42) transparent'
                : 'rgba(100, 116, 139, 0.42) transparent',
            scrollbarWidth: 'thin',
          },
          // WebKit 浏览器滚动条整体尺寸。
          '*::-webkit-scrollbar': {
            height: 8,
            width: 8,
          },
          // WebKit 滚动条轨道。
          '*::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          // WebKit 滚动条滑块。
          '*::-webkit-scrollbar-thumb': {
            backgroundClip: 'content-box',
            backgroundColor:
              mode === COLOR_MODE.DARK
                ? 'rgba(148, 163, 184, 0.26)'
                : 'rgba(100, 116, 139, 0.26)',
            border: '2px solid transparent',
            borderRadius: 999,
          },
          // WebKit 滚动条滑块 hover 态。
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor:
              mode === COLOR_MODE.DARK
                ? 'rgba(148, 163, 184, 0.48)'
                : 'rgba(100, 116, 139, 0.48)',
          },
        },
      },
      // MuiButton 统一按钮的默认密度和文字风格。
      MuiButton: {
        // defaultProps 设置所有 Button 的默认属性。
        defaultProps: {
          disableElevation: true,
          size: 'small',
        },
        // styleOverrides 覆盖 Button 内部插槽样式。
        styleOverrides: {
          // root 是 Button 根节点。
          root: {
            textTransform: 'none',
            fontWeight: 700,
            fontSize: 12,
            minHeight: 28,
            paddingBottom: 4,
            paddingTop: 4,
          },
        },
      },
      // MuiIconButton 统一图标按钮的默认密度。
      MuiIconButton: {
        defaultProps: {
          size: 'small',
        },
        // styleOverrides 覆盖 IconButton 内部插槽样式。
        styleOverrides: {
          root: {
            padding: 4,
          },
        },
      },
    },
  });
};
