import { useEffect, useMemo } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { COLOR_MODE } from '@/constants/theme';
import '@renderer/App.css';
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks';
import { setColorMode } from '@renderer/store/themeSlice';
import {
  createAppTheme,
  hasSavedColorMode,
  SYSTEM_DARK_MODE_QUERY,
} from '@renderer/theme';
import ChatMateDesktop from '@renderer/views/chatMate/ChatMateDesktop';
import Settings from '@renderer/views/settings/Settings';
import GlobalSnackbar from '@renderer/components/GlobalSnackbar';
import { selectThemeMode } from '@renderer/store/selectors';

export default function App() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector(selectThemeMode);
  const theme = useMemo(() => createAppTheme(mode), [mode]);

  /**
   * 没有用户手动选择时，应用跟随系统明暗主题变化。
   */
  useEffect(() => {
    if (
      hasSavedColorMode() ||
      typeof window === 'undefined' ||
      !window.matchMedia
    ) {
      return undefined;
    }

    const mediaQuery = window.matchMedia(SYSTEM_DARK_MODE_QUERY);
    const handleSystemModeChange = (event: MediaQueryListEvent) => {
      if (!hasSavedColorMode()) {
        dispatch(
          setColorMode(event.matches ? COLOR_MODE.DARK : COLOR_MODE.LIGHT),
        );
      }
    };

    mediaQuery.addEventListener('change', handleSystemModeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemModeChange);
    };
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<ChatMateDesktop />} />
        </Routes>
      </Router>
      <Settings />
      <GlobalSnackbar />
    </ThemeProvider>
  );
}
