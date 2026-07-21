import { useCallback, useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import { createLocalChat, listChats, listMessages } from '@renderer/api/chat';
import { createWorkspace, listWorkspaces } from '@renderer/api/workspace';
import {
  createChat,
  selectChat,
  setChats,
  setFolderMessage,
  setMessages,
  setWorkspaces,
  upsertWorkspace,
} from '@renderer/store/codeMateSlice';
import {
  selectCodeMateChats,
  selectCodeMateSelectedChatId,
  selectCodeMateWorkspaces,
} from '@renderer/store/selectors';
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks';
import type { CodeMateChat, CodeMateWorkspace } from '@renderer/types/codeMate';
import ChatItem from './ChatItem';
import DeleteConfirmDialog, {
  type DeleteConfirmTarget,
} from './DeleteConfirmDialog';
import WorkspaceItem from './WorkspaceItem';

/**
 * 根据文件夹路径生成工作区名称。
 */
const getFolderName = (folderPath: string) => {
  const segments = folderPath.split(/[\\/]/).filter(Boolean);
  return segments[segments.length - 1] || 'Workspace';
};

/**
 * 渲染左侧栏，并把工作区、任务和消息列表接入本地 SQLite。
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
  const [deleteTarget, setDeleteTarget] = useState<DeleteConfirmTarget | null>(
    null,
  );

  useEffect(() => {
    let canceled = false;

    /**
     * 应用启动时从本地 SQLite 回填侧边栏数据。
     */
    const loadLocalData = async () => {
      try {
        // 获取所有工作区和聊天记录
        const [workspaceList, chatList] = await Promise.all([
          listWorkspaces(),
          listChats(),
        ]);

        if (canceled) {
          return;
        }

        dispatch(setWorkspaces(workspaceList));
        dispatch(setChats(chatList));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load local data', error);
        dispatch(setFolderMessage('加载本地数据失败，请稍后重试'));
      }
    };

    loadLocalData();

    return () => {
      canceled = true;
    };
  }, [dispatch]);

  /**
   * 新建任务并写入本地 SQLite。
   */
  const handleCreateChat = useCallback(
    async (workspaceId?: string) => {
      try {
        const chat = await createLocalChat({
          title: '新任务',
          workspaceId,
        });

        dispatch(createChat(chat));

        if (workspaceId) {
          setExpandedWorkspaces((prev) => {
            const next = new Set(prev);
            next.add(workspaceId);
            return next;
          });
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to create local chat', error);
        dispatch(setFolderMessage('创建任务失败，请稍后重试'));
      }
    },
    [dispatch],
  );

  /**
   * 切换任务，并从本地 SQLite 查询该任务下的消息。
   */
  const handleSelectChat = useCallback(
    async (chatId: string) => {
      dispatch(selectChat(chatId));

      try {
        const nextMessages = await listMessages(chatId);
        dispatch(setMessages(nextMessages));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to load local messages', error);
        dispatch(setFolderMessage('加载消息失败，请稍后重试'));
      }
    },
    [dispatch],
  );

  /**
   * 展开或收起工作区。
   */
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
   * 打开删除会话确认弹窗。
   */
  const handleOpenDeleteChatDialog = useCallback((chat: CodeMateChat) => {
    setDeleteTarget({ item: chat, type: 'chat' });
  }, []);

  /**
   * 打开删除工作区确认弹窗。
   */
  const handleOpenDeleteWorkspaceDialog = useCallback(
    (workspace: CodeMateWorkspace) => {
      setDeleteTarget({ item: workspace, type: 'workspace' });
    },
    [],
  );

  /**
   * 关闭删除确认弹窗。
   */
  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  /**
   * 删除工作区后同步清理展开状态。
   */
  const handleDeleted = useCallback((target: DeleteConfirmTarget) => {
    if (target.type === 'workspace') {
      setExpandedWorkspaces((prev) => {
        const next = new Set(prev);
        next.delete(target.item.id);
        return next;
      });
    }
  }, []);

  /**
   * 打开系统文件夹选择器，并把选中的文件夹写入本地 SQLite。
   */
  const handleOpenFolder = useCallback(async () => {
    try {
      const result = await window.electron.openFolder();

      if (result.canceled || result.filePaths.length === 0) {
        dispatch(setFolderMessage('已取消选择文件夹'));
        return;
      }

      const folderPath = result.filePaths[0];
      const name = getFolderName(folderPath);

      setIsCreatingWorkspace(true);
      try {
        const workspace = await createWorkspace({ name, path: folderPath });
        dispatch(upsertWorkspace(workspace));
        dispatch(setFolderMessage(`已打开文件夹：${folderPath}`));
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

  const unassociatedChats = useMemo(
    () => chats.filter((chat) => !chat.workspaceId),
    [chats],
  );

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
          <Tooltip title="打开文件夹">
            <IconButton
              aria-label="打开文件夹"
              disabled={isCreatingWorkspace}
              onClick={handleOpenFolder}
              sx={(theme) => ({
                color: theme.palette.text.secondary,
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
                <FolderOpenOutlinedIcon sx={{ fontSize: 15 }} />
              )}
            </IconButton>
          </Tooltip>
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
                chats={chats.filter(
                  (chat) => chat.workspaceId === workspace.id,
                )}
                isExpanded={expandedWorkspaces.has(workspace.id)}
                onAddChat={handleCreateChat}
                onDeleteChatClick={handleOpenDeleteChatDialog}
                onDeleteWorkspaceClick={handleOpenDeleteWorkspaceDialog}
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
          <Tooltip title="新建任务">
            <IconButton
              aria-label="新建任务"
              onClick={() => {
                handleCreateChat();
              }}
              sx={(theme) => ({
                color: theme.palette.text.secondary,
                height: 22,
                width: 22,
                '&:hover': {
                  color: theme.palette.primary.main,
                },
              })}
            >
              <CreateOutlinedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
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
                onDeleteChatClick={handleOpenDeleteChatDialog}
                onSelectChat={handleSelectChat}
              />
            ))
          )}
        </List>
      </Box>
      <DeleteConfirmDialog
        target={deleteTarget}
        onClose={handleCloseDeleteDialog}
        onDeleted={handleDeleted}
      />
    </Box>
  );
}
