import { memo, useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks';
import {
  addWorkspaceFromPath,
  createChat,
  selectChat,
  selectCodeMateChats,
  selectCodeMateSelectedChatId,
  selectCodeMateWorkspaces,
  setFolderMessage,
} from '@renderer/store/codeMateSlice';
import type { CodeMateChat, CodeMateWorkspace } from '@renderer/types/codeMate';
import { createWorkspace } from '@renderer/api/workspace';

type WorkspaceItemProps = {
  chats: CodeMateChat[];
  isExpanded: boolean;
  onToggleExpand: (workspaceId: string) => void;
  onAddChat: (workspaceId: string) => void;
  onSelectChat: (chatId: string) => void;
  selectedChatId: string;
  workspace: CodeMateWorkspace;
};

type ChatItemProps = {
  chat: CodeMateChat;
  isSelected: boolean;
  onSelectChat: (chatId: string) => void;
};

/**
 * 渲染单个工作区条目，负责展示名称、路径和折叠/展开功能，并在内部渲染其所属的聊天。
 */
const WorkspaceItem = memo(function WorkspaceItem({
  chats,
  isExpanded,
  onToggleExpand,
  onAddChat,
  onSelectChat,
  selectedChatId,
  workspace,
}: WorkspaceItemProps) {
  return (
    <Box>
      <Box
        onClick={() => onToggleExpand(workspace.id)}
        sx={(theme) => ({
          borderRadius: 1.5,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
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
        <IconButton size="small" sx={{ p: 0.25, width: 20, height: 20 }}>
          {isExpanded ? (
            <ExpandMoreIcon sx={{ fontSize: 16 }} />
          ) : (
            <ChevronRightIcon sx={{ fontSize: 16 }} />
          )}
        </IconButton>
        <Typography sx={{ fontSize: 13, mt: 0.1 }}>📁</Typography>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ fontSize: 12, fontWeight: 700 }}>
            {workspace.name}
          </Typography>
        </Box>
        <IconButton
          className="workspace-action"
          onClick={(e) => {
            e.stopPropagation();
            onAddChat(workspace.id);
          }}
          sx={(theme) => ({
            color: theme.palette.text.secondary,
            opacity: 0,
            width: 22,
            height: 22,
            '&:hover': {
              color: theme.palette.primary.main,
            },
          })}
        >
          <CreateOutlinedIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>
      {isExpanded && chats.length > 0 && (
        <List disablePadding sx={{ pl: 3 }}>
          {chats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isSelected={selectedChatId === chat.id}
              onSelectChat={onSelectChat}
            />
          ))}
        </List>
      )}
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
  const chats = useAppSelector(selectCodeMateChats);
  const selectedChatId = useAppSelector(selectCodeMateSelectedChatId);
  const workspaces = useAppSelector(selectCodeMateWorkspaces);

  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(
    new Set(),
  );
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

  /**
   * 处理新建聊天按钮，创建一条空聊天记录。
   */
  const handleCreateChat = useCallback(
    (workspaceId?: string) => {
      dispatch(
        createChat({
          id: `chat-${Date.now()}`,
          time: '刚刚',
          title: '新聊天',
          workspaceId,
        }),
      );
      if (workspaceId) {
        setExpandedWorkspaces((prev) => {
          const next = new Set(prev);
          next.add(workspaceId);
          return next;
        });
      }
    },
    [dispatch],
  );

  /**
   * 处理聊天记录点击，切换当前选中的聊天。
   */
  const handleSelectChat = useCallback(
    (chatId: string) => {
      dispatch(selectChat(chatId));
    },
    [dispatch],
  );

  const handleToggleExpandWorkspace = useCallback((workspaceId: string) => {
    setExpandedWorkspaces((prev) => {
      const next = new Set(prev);
      if (next.has(workspaceId)) {
        next.delete(workspaceId);
      } else {
        next.add(workspaceId);
      }
      return next;
    });
  }, []);

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

      const folderPath = result.filePaths[0];
      const segments = folderPath.split(/[\\/]/).filter(Boolean);
      const name = segments[segments.length - 1] || 'Workspace';

      setIsCreatingWorkspace(true);
      try {
        await createWorkspace({ name, path: folderPath });
        dispatch(addWorkspaceFromPath(folderPath));
      } finally {
        setIsCreatingWorkspace(false);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to open folder dialog or create workspace', error);
      dispatch(setFolderMessage('打开文件夹失败，请稍后重试'));
      setIsCreatingWorkspace(false);
    }
  }, [dispatch]);

  const unassociatedChats = chats.filter((chat) => !chat.workspaceId);

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
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: 1 }}>
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 0.5,
            mt: 1,
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
            disabled={isCreatingWorkspace}
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
            {isCreatingWorkspace ? (
              <CircularProgress size={12} color="inherit" />
            ) : (
              '📂'
            )}
          </IconButton>
        </Stack>

        <Stack spacing={0.25} sx={{ mb: 1 }}>
          {workspaces.length === 0 ? (
            <Typography
              sx={(theme) => ({
                color: theme.palette.text.secondary,
                fontSize: 11,
                px: 0.75,
                py: 0.5,
              })}
            >
              暂未打开工作区
            </Typography>
          ) : (
            workspaces.map((workspace) => (
              <WorkspaceItem
                key={workspace.id}
                chats={chats.filter((c) => c.workspaceId === workspace.id)}
                isExpanded={expandedWorkspaces.has(workspace.id)}
                onAddChat={handleCreateChat}
                onSelectChat={handleSelectChat}
                onToggleExpand={handleToggleExpandWorkspace}
                selectedChatId={selectedChatId}
                workspace={workspace}
              />
            ))
          )}
        </Stack>

        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 0.5,
          }}
        >
          <Typography
            sx={(theme) => ({
              color: theme.palette.text.secondary,
              fontSize: 10,
            })}
          >
            任务
          </Typography>
          <IconButton
            onClick={() => handleCreateChat()}
            sx={(theme) => ({
              color: theme.palette.text.secondary,
              width: 22,
              height: 22,
              '&:hover': {
                color: theme.palette.primary.main,
              },
            })}
          >
            <CreateOutlinedIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Stack>

        <List disablePadding>
          {unassociatedChats.length === 0 ? (
            <Typography
              sx={(theme) => ({
                color: theme.palette.text.secondary,
                fontSize: 11,
                px: 0.75,
                py: 0.5,
              })}
            >
              暂无任务
            </Typography>
          ) : (
            unassociatedChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isSelected={selectedChatId === chat.id}
                onSelectChat={handleSelectChat}
              />
            ))
          )}
        </List>
      </Box>
    </Box>
  );
}
