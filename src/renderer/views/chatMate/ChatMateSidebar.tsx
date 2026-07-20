import { memo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks';
import {
  addWorkspaceFromPath,
  resetToFirstChat,
  selectChat,
  selectCodeMateActiveWorkspaceId,
  selectCodeMateChats,
  selectCodeMateSelectedChatId,
  selectCodeMateWorkspaces,
  selectWorkspace,
  setFolderMessage,
} from '@renderer/store/codeMateSlice';
import type { CodeMateChat, CodeMateWorkspace } from '@renderer/types/codeMate';

type WorkspaceItemProps = {
  isActive: boolean;
  onSelectWorkspace: (workspaceId: string) => void;
  workspace: CodeMateWorkspace;
};

type ChatItemProps = {
  chat: CodeMateChat;
  isSelected: boolean;
  onSelectChat: (chatId: string) => void;
};

/**
 * 渲染单个工作区条目，负责展示名称、路径和选中态。
 */
const WorkspaceItem = memo(function WorkspaceItem({
  isActive,
  onSelectWorkspace,
  workspace,
}: WorkspaceItemProps) {
  return (
    <Box
      onClick={() => onSelectWorkspace(workspace.id)}
      sx={(theme) => ({
        bgcolor: isActive
          ? alpha(theme.palette.primary.main, 0.16)
          : 'transparent',
        border: `1px solid ${
          isActive ? alpha(theme.palette.primary.main, 0.3) : 'transparent'
        }`,
        borderRadius: 1.5,
        cursor: 'pointer',
        display: 'flex',
        gap: 0.75,
        minHeight: 42,
        overflow: 'hidden',
        px: 0.75,
        py: 0.5,
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.1),
        },
      })}
    >
      <Typography sx={{ fontSize: 13, mt: 0.1 }}>📁</Typography>
      <Box sx={{ minWidth: 0 }}>
        <Typography noWrap sx={{ fontSize: 12, fontWeight: 700 }}>
          {workspace.name}
        </Typography>
        <Typography
          noWrap
          sx={(theme) => ({
            color: theme.palette.text.secondary,
            fontSize: 10,
            mt: 0.1,
          })}
        >
          {workspace.path}
        </Typography>
      </Box>
    </Box>
  );
});

/**
 * 渲染单条聊天记录，负责展示标题、时间和更多操作入口。
 */
const ChatItem = memo(function ChatItem({
  chat,
  isSelected,
  onSelectChat,
}: ChatItemProps) {
  return (
    <ListItemButton
      selected={isSelected}
      onClick={() => onSelectChat(chat.id)}
      sx={(theme) => ({
        border: `1px solid ${
          isSelected ? alpha(theme.palette.primary.main, 0.28) : 'transparent'
        }`,
        borderRadius: 1.5,
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
      <Box sx={{ minWidth: 0, flex: 1 }}>
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
      <IconButton
        aria-label={`${chat.title} 更多操作`}
        className="chat-action"
        sx={(theme) => ({
          color: theme.palette.text.secondary,
          fontSize: 11,
          height: 22,
          opacity: isSelected ? 1 : 0,
          width: 22,
        })}
      >
        ...
      </IconButton>
    </ListItemButton>
  );
});

/**
 * 渲染 Codex 风格左侧栏，状态从 Redux 读取，避免父组件层层透传。
 */
export default function ChatMateSidebar() {
  const dispatch = useAppDispatch();
  const activeWorkspaceId = useAppSelector(selectCodeMateActiveWorkspaceId);
  const chats = useAppSelector(selectCodeMateChats);
  const selectedChatId = useAppSelector(selectCodeMateSelectedChatId);
  const workspaces = useAppSelector(selectCodeMateWorkspaces);

  /**
   * 处理新建聊天按钮，当前模拟为回到第一条聊天。
   */
  const handleCreateChat = useCallback(() => {
    dispatch(resetToFirstChat());
  }, [dispatch]);

  /**
   * 处理聊天记录点击，切换当前选中的聊天。
   */
  const handleSelectChat = useCallback(
    (chatId: string) => {
      dispatch(selectChat(chatId));
    },
    [dispatch],
  );

  /**
   * 处理工作区点击，切换当前绑定的工作区上下文。
   */
  const handleSelectWorkspace = useCallback(
    (workspaceId: string) => {
      dispatch(selectWorkspace(workspaceId));
    },
    [dispatch],
  );

  /**
   * 调用 Electron 文件夹选择器，并把选中的文件夹写入 Redux 工作区列表。
   */
  const handleOpenFolder = useCallback(async () => {
    try {
      const result = await window.electron.openFolder();

      if (result.canceled || result.filePaths.length === 0) {
        dispatch(setFolderMessage('已取消选择文件夹'));
        return;
      }

      dispatch(addWorkspaceFromPath(result.filePaths[0]));
    } catch (error) {
      // 失败不能静默吞掉，控制台保留具体错误，界面给用户可理解的反馈。
      // eslint-disable-next-line no-console
      console.error('Failed to open folder dialog', error);
      dispatch(setFolderMessage('打开文件夹失败，请稍后重试'));
    }
  }, [dispatch]);

  return (
    <Box
      component="aside"
      sx={(theme) => ({
        bgcolor: 'transparent',
        borderRight: `1px solid ${theme.palette.divider}`,
        boxShadow: theme.shadows[8],
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        width: 260,
      })}
    >
      <Stack spacing={0.75} sx={{ p: 1 }}>
        <Button
          fullWidth
          onClick={handleCreateChat}
          sx={(theme) => ({
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            fontSize: 12,
            justifyContent: 'flex-start',
            minHeight: 26,
          })}
          variant="outlined"
        >
          + 新聊天
        </Button>
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 1 }}>
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 0.5,
            mt: 0.25,
          }}
        >
          <Typography
            sx={(theme) => ({
              color: theme.palette.text.secondary,
              fontSize: 10,
            })}
          >
            工作区
          </Typography>
          <IconButton
            aria-label="打开文件夹"
            onClick={handleOpenFolder}
            sx={(theme) => ({
              color: theme.palette.text.secondary,
              fontSize: 12,
              height: 22,
              width: 22,
              '&:hover': {
                color: theme.palette.primary.main,
              },
            })}
          >
            📂
          </IconButton>
        </Stack>

        <Stack spacing={0.25} sx={{ mb: 1 }}>
          {workspaces.map((workspace) => (
            <WorkspaceItem
              key={workspace.id}
              isActive={workspace.id === activeWorkspaceId}
              onSelectWorkspace={handleSelectWorkspace}
              workspace={workspace}
            />
          ))}
        </Stack>

        <Typography
          sx={(theme) => ({
            color: theme.palette.text.secondary,
            fontSize: 10,
            mb: 0.5,
          })}
        >
          最近聊天
        </Typography>
        <List disablePadding>
          {chats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isSelected={selectedChatId === chat.id}
              onSelectChat={handleSelectChat}
            />
          ))}
        </List>
      </Box>
    </Box>
  );
}
