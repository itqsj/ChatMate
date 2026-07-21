import { memo, useState, type MouseEvent } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import type { CodeMateChat, CodeMateWorkspace } from '@renderer/types/codeMate';
import ChatItem from './ChatItem';

type WorkspaceItemProps = {
  chats: CodeMateChat[];
  isExpanded: boolean;
  onAddChat: (workspaceId: string) => Promise<void>;
  onDeleteChatClick: (chat: CodeMateChat) => void;
  onDeleteWorkspaceClick: (workspace: CodeMateWorkspace) => void;
  onSelectChat: (chatId: string) => Promise<void>;
  onToggleExpand: (workspaceId: string) => void;
  selectedChatId: string;
  workspace: CodeMateWorkspace;
};

/**
 * 渲染单个工作区条目，并在展开后展示它下面的会话。
 */
const WorkspaceItem = memo(function WorkspaceItem({
  chats,
  isExpanded,
  onAddChat,
  onDeleteChatClick,
  onDeleteWorkspaceClick,
  onSelectChat,
  onToggleExpand,
  selectedChatId,
  workspace,
}: WorkspaceItemProps) {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  /**
   * 打开工作区更多操作菜单。
   */
  const handleOpenMenu = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  /**
   * 关闭工作区更多操作菜单。
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
    onDeleteWorkspaceClick(workspace);
  };

  return (
    <Box>
      <Box
        onClick={() => onToggleExpand(workspace.id)}
        sx={(theme) => ({
          alignItems: 'center',
          borderRadius: 1,
          cursor: 'pointer',
          display: 'flex',
          gap: 0.5,
          minHeight: 36,
          px: 0.5,
          py: 0.5,
          '&:hover': {
            bgcolor: alpha(theme.palette.primary.main, 0.1),
          },
          '&:hover .workspace-action': {
            opacity: 1,
          },
        })}
      >
        <IconButton
          aria-label={isExpanded ? '收起工作区' : '展开工作区'}
          size="small"
          sx={{ height: 20, p: 0.25, width: 20 }}
        >
          {isExpanded ? (
            <ExpandMoreIcon sx={{ fontSize: 16 }} />
          ) : (
            <ChevronRightIcon sx={{ fontSize: 16 }} />
          )}
        </IconButton>
        <FolderOpenOutlinedIcon sx={{ fontSize: 15 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography noWrap sx={{ fontSize: 12, fontWeight: 700 }}>
            {workspace.name}
          </Typography>
        </Box>
        <Tooltip title="新建任务">
          <IconButton
            aria-label={`${workspace.name} 新建任务`}
            className="workspace-action"
            onClick={(event) => {
              event.stopPropagation();
              onAddChat(workspace.id);
            }}
            sx={(theme) => ({
              color: theme.palette.text.secondary,
              height: 22,
              opacity: 0,
              width: 22,
              '&:hover': {
                color: theme.palette.primary.main,
              },
            })}
          >
            <CreateOutlinedIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="更多操作">
          <IconButton
            aria-label={`${workspace.name} 更多操作`}
            className="workspace-action"
            onClick={handleOpenMenu}
            sx={(theme) => ({
              color: theme.palette.text.secondary,
              height: 22,
              opacity: isMenuOpen ? 1 : 0,
              width: 22,
              '&:hover': {
                color: theme.palette.primary.main,
              },
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
      </Box>
      {isExpanded && chats.length > 0 && (
        <List disablePadding>
          {chats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isSelected={selectedChatId === chat.id}
              onDeleteChatClick={onDeleteChatClick}
              onSelectChat={onSelectChat}
            />
          ))}
        </List>
      )}
    </Box>
  );
});

export default WorkspaceItem;
