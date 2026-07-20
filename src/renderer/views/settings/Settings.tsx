import { useState } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { COLOR_MODE } from '@/constants/theme';
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks';
import { setColorMode } from '@renderer/store/themeSlice';
import type { ColorMode } from '@renderer/theme';

const THEME_OPTIONS: Array<{
  description: string;
  label: string;
  mode: ColorMode;
}> = [
  {
    description: '浅色背景，适合白天和高亮环境。',
    label: '简约白',
    mode: COLOR_MODE.LIGHT,
  },
  {
    description: '深色背景，适合长时间编码。',
    label: '商务黑',
    mode: COLOR_MODE.DARK,
  },
];

/**
 * 渲染系统设置入口和右侧抽屉，当前支持切换全局明暗主题。
 */
export default function Settings() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);
  const [open, setOpen] = useState(false);

  /**
   * 打开系统设置抽屉。
   */
  const handleOpenDrawer = () => {
    setOpen(true);
  };

  /**
   * 关闭系统设置抽屉。
   */
  const handleCloseDrawer = () => {
    setOpen(false);
  };

  /**
   * 切换全局主题模式，交给 Redux 统一驱动页面主题。
   */
  const handleChangeMode = (nextMode: ColorMode) => {
    dispatch(setColorMode(nextMode));
  };

  return (
    <>
      <IconButton
        aria-label="打开系统设置"
        onClick={handleOpenDrawer}
        sx={(theme) => ({
          bgcolor: theme.palette.primary.main,
          borderRadius: '6px 0 0 6px',
          boxShadow: theme.shadows[8],
          color: theme.palette.primary.contrastText,
          fontSize: 14,
          height: 36,
          bottom: 96,
          position: 'fixed',
          right: -18,
          transition: theme.transitions.create(['right', 'background-color'], {
            duration: theme.transitions.duration.short,
          }),
          width: 36,
          zIndex: theme.zIndex.drawer - 1,
          '&:hover': {
            bgcolor: theme.palette.primary.dark,
            right: 0,
          },
        })}
      >
        <SettingsIcon sx={{ fontSize: 18 }} />
      </IconButton>

      <Drawer
        anchor="right"
        open={open}
        onClose={handleCloseDrawer}
        slotProps={{
          paper: {
            sx: (theme) => ({
              backdropFilter: 'blur(18px)',
              bgcolor: alpha(theme.palette.background.paper, 0.92),
              borderLeft: `1px solid ${theme.palette.divider}`,
              color: theme.palette.text.primary,
              width: 320,
            }),
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
              系统设置
            </Typography>
            <IconButton
              aria-label="关闭系统设置"
              onClick={handleCloseDrawer}
              sx={{ borderRadius: 1, fontSize: 12, height: 28, width: 46 }}
            >
              关闭
            </IconButton>
          </Stack>

          <Typography
            sx={(theme) => ({
              color: theme.palette.text.secondary,
              fontSize: 11,
              mt: 0.5,
            })}
          >
            选择界面主题
          </Typography>

          <Stack spacing={1} sx={{ mt: 2 }}>
            {THEME_OPTIONS.map((option) => {
              const selected = mode === option.mode;

              return (
                <ButtonBase
                  key={option.mode}
                  aria-label={`切换到${option.label}`}
                  onClick={() => handleChangeMode(option.mode)}
                  sx={(theme) => ({
                    alignItems: 'stretch',
                    bgcolor: selected
                      ? alpha(theme.palette.primary.main, 0.16)
                      : theme.palette.action.hover,
                    border: `1px solid ${
                      selected
                        ? alpha(theme.palette.primary.main, 0.52)
                        : theme.palette.divider
                    }`,
                    borderRadius: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    p: 1,
                    textAlign: 'left',
                    width: '100%',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                    },
                  })}
                >
                  <Box
                    sx={(theme) => ({
                      background:
                        option.mode === COLOR_MODE.DARK
                          ? 'linear-gradient(135deg, #111827 0%, #1f2937 100%)'
                          : 'linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      height: 56,
                      position: 'relative',
                    })}
                  >
                    {selected && (
                      <Box
                        sx={(theme) => ({
                          alignItems: 'center',
                          bgcolor: theme.palette.primary.main,
                          borderRadius: 1,
                          color: theme.palette.primary.contrastText,
                          display: 'flex',
                          fontSize: 10,
                          height: 20,
                          justifyContent: 'center',
                          position: 'absolute',
                          right: 8,
                          top: 8,
                          width: 34,
                        })}
                      >
                        已选
                      </Box>
                    )}
                  </Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, mt: 0.75 }}>
                    {option.label}
                  </Typography>
                  <Typography
                    sx={(theme) => ({
                      color: theme.palette.text.secondary,
                      fontSize: 10,
                      mt: 0.25,
                    })}
                  >
                    {option.description}
                  </Typography>
                </ButtonBase>
              );
            })}
          </Stack>
        </Box>
      </Drawer>
    </>
  );
}
