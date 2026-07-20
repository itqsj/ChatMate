import { useState, type MouseEvent } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';

type MenuName = 'file' | 'view' | 'help';

const HELP_LINKS = {
  learnMore: 'https://electronjs.org',
  documentation: 'https://github.com/electron/electron/tree/main/docs#readme',
  community: 'https://www.electronjs.org/community',
  issues: 'https://github.com/electron/electron/issues',
};

/**
 * 渲染无边框窗口的自定义顶部栏，承接菜单、拖拽区和窗口按钮。
 */
export default function ChatMateWindowBar() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [openMenu, setOpenMenu] = useState<MenuName | null>(null);

  /**
   * 打开指定菜单，并记录当前按钮作为弹层定位点。
   */
  const handleOpenMenu = (
    menuName: MenuName,
    event: MouseEvent<HTMLElement>,
  ) => {
    setAnchorEl(event.currentTarget);
    setOpenMenu(menuName);
  };

  /**
   * 关闭当前展开的菜单。
   */
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setOpenMenu(null);
  };

  /**
   * 打开外部帮助链接，失败时保留控制台错误便于排查。
   */
  const handleOpenExternal = async (url: string) => {
    try {
      await window.electron.openExternal(url);
      handleCloseMenu();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to open external url', error);
    }
  };

  return (
    <Box
      component="header"
      sx={(theme) => ({
        WebkitAppRegion: 'drag',
        alignItems: 'center',
        background: 'transparent',
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexShrink: 0,
        gridColumn: '1 / -1',
        height: 34,
        justifyContent: 'space-between',
        pl: 0.5,
      })}
    >
      <Stack
        direction="row"
        spacing={0.25}
        sx={{
          alignItems: 'center',
          WebkitAppRegion: 'no-drag',
        }}
      >
        <Button
          onClick={(event) => handleOpenMenu('file', event)}
          sx={{ minWidth: 42, px: 1 }}
        >
          File
        </Button>
        <Button
          onClick={(event) => handleOpenMenu('view', event)}
          sx={{ minWidth: 42, px: 1 }}
        >
          View
        </Button>
        <Button
          onClick={(event) => handleOpenMenu('help', event)}
          sx={{ minWidth: 42, px: 1 }}
        >
          Help
        </Button>
      </Stack>

      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          WebkitAppRegion: 'no-drag',
        }}
      >
        <IconButton
          aria-label="最小化窗口"
          onClick={() => window.electron.minimizeWindow()}
          sx={{ borderRadius: 0, fontSize: 22, height: 34, width: 42 }}
        >
          -
        </IconButton>
        <IconButton
          aria-label="最大化窗口"
          onClick={() => window.electron.toggleMaximizeWindow()}
          sx={{ borderRadius: 0, fontSize: 22, height: 34, width: 42 }}
        >
          □
        </IconButton>
        <IconButton
          aria-label="关闭窗口"
          onClick={() => window.electron.closeWindow()}
          sx={(theme) => ({
            borderRadius: 0,
            fontSize: 22,
            height: 34,
            width: 42,
            '&:hover': {
              bgcolor: theme.palette.error.main,
              color: theme.palette.error.contrastText,
            },
          })}
        >
          ×
        </IconButton>
      </Stack>

      <Menu
        anchorEl={anchorEl}
        open={openMenu === 'file'}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleCloseMenu}>Open</MenuItem>
        <Divider />
        <MenuItem onClick={() => window.electron.closeWindow()}>Close</MenuItem>
      </Menu>

      <Menu
        anchorEl={anchorEl}
        open={openMenu === 'view'}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => window.electron.reloadWindow()}>
          Reload
        </MenuItem>
        <MenuItem onClick={() => window.electron.toggleFullScreenWindow()}>
          Toggle Full Screen
        </MenuItem>
      </Menu>

      <Menu
        anchorEl={anchorEl}
        open={openMenu === 'help'}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleOpenExternal(HELP_LINKS.learnMore)}>
          Learn More
        </MenuItem>
        <MenuItem onClick={() => handleOpenExternal(HELP_LINKS.documentation)}>
          Documentation
        </MenuItem>
        <MenuItem onClick={() => handleOpenExternal(HELP_LINKS.community)}>
          Community Discussions
        </MenuItem>
        <MenuItem onClick={() => handleOpenExternal(HELP_LINKS.issues)}>
          Search Issues
        </MenuItem>
      </Menu>
    </Box>
  );
}
