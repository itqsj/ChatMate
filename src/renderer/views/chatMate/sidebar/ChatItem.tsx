import { memo, useState, type MouseEvent } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import type { CodeMateChat } from '@renderer/types/codeMate';

type ChatItemProps = {
  chat: CodeMateChat;
  isSelected: boolean;
  onDeleteChatClick: (chat: CodeMateChat) => void;
  onSelectChat: (chatId: string) => Promise<void>;
};

/**
 * 渲染单条会话记录，并提供更多操作菜单。
 */
const ChatItem = memo(function ChatItem({
  chat,
  isSelected,
  onDeleteChatClick,
  onSelectChat,
}: ChatItemProps) {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  /**
   * 打开会话更多操作菜单。
   */
  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  /**
   * 关闭会话更多操作菜单。
   */
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  /**
   * 关闭菜单后交给父组件打开确认删除弹窗。
   */
  const handleDeleteClick = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    handleCloseMenu();
    onDeleteChatClick(chat);
  };

  return (
    <ListItemButton
      selected={isSelected}
      onClick={() => {
        onSelectChat(chat.id);
      }}
      sx={(theme) => ({
        border: `1px solid ${
          isSelected ? alpha(theme.palette.primary.main, 0.28) : 'transparent'
        }`,
        borderRadius: 1,
        mb: 0.25,
        minHeight: 36,
        px: 0.75,
        py: 0.4,
        '&.Mui-selected': {
          bgcolor: alpha(theme.palette.primary.main, 0.14),
        },
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.1),
        },
        '&:hover .chat-action': {
          opacity: 1,
        },
      })}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography noWrap sx={{ fontSize: 12 }}>
          {chat.title}
        </Typography>
        <Typography
          noWrap
          sx={(theme) => ({
            color: theme.palette.text.secondary,
            fontSize: 10,
            mt: 0.1,
          })}
        >
          {chat.time}
        </Typography>
      </Box>
      <Tooltip title="更多操作">
        <IconButton
          aria-label={`${chat.title} 更多操作`}
          className="chat-action"
          onClick={handleOpenMenu}
          sx={(theme) => ({
            color: theme.palette.text.secondary,
            height: 22,
            opacity: isSelected || isMenuOpen ? 1 : 0,
            width: 22,
          })}
        >
          <MoreHorizIcon sx={{ fontSize: 15 }} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
        onClose={handleCloseMenu}
        onClick={(event) => event.stopPropagation()}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        slotProps={{ list: { sx: { py: 0 } } }}
      >
        <MenuItem onClick={handleDeleteClick} sx={{ fontSize: 12 }}>
          <DeleteOutlinedIcon sx={{ fontSize: 16, mr: 1 }} />
          删除
        </MenuItem>
      </Menu>
    </ListItemButton>
  );
});

export default ChatItem;
