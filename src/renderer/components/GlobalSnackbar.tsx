import React, { useState, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

export const SHOW_SNACKBAR_EVENT = 'SHOW_GLOBAL_SNACKBAR';

type SnackbarSeverity = 'success' | 'info' | 'warning' | 'error';

/**
 * 触发全局 Snackbar 弹窗的工具函数
 */
export const showGlobalSnackbar = (
  message: string,
  severity: SnackbarSeverity = 'error',
) => {
  const event = new CustomEvent(SHOW_SNACKBAR_EVENT, {
    detail: { message, severity },
  });
  window.dispatchEvent(event);
};

export default function GlobalSnackbar() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<SnackbarSeverity>('error');

  useEffect(() => {
    const handleShowSnackbar = (event: Event) => {
      const customEvent = event as CustomEvent<{
        message: string;
        severity: SnackbarSeverity;
      }>;
      setMessage(customEvent.detail.message);
      setSeverity(customEvent.detail.severity);
      setOpen(true);
    };

    window.addEventListener(SHOW_SNACKBAR_EVENT, handleShowSnackbar);
    return () => {
      window.removeEventListener(SHOW_SNACKBAR_EVENT, handleShowSnackbar);
    };
  }, []);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
