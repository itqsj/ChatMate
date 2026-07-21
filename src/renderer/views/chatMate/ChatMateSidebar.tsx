/* eslint-disable no-use-before-define */
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {
  createLocalChat,
  deleteLocalChat,
  listChats,
  listMessages,
} from '@renderer/api/chat';
import {
  createWorkspace,
  deleteWorkspace,
  listWorkspaces,
} from '@renderer/api/workspace';
import {
  createChat,
  removeChat,
  removeWorkspace,
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

type ChatItemProps = {
  chat: CodeMateChat;
  isSelected: boolean;
  onDeleteChatClick: (chat: CodeMateChat) => void;
  onSelectChat: (chatId: string) => Promise<void>;
};

/**
 * 根据文件夹路径生成工作区名称。
 */
const getFolderName = (folderPath: string) => {
  const segments = folderPath.split(/[\\/]/).filter(Boolean);
  return segments[segments.length - 1] || 'Workspace';
};

/**
 * 渲染单个工作区条目，并在展开后展示它下面的任务。
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

/**
 * 渲染单条任务记录。
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
  const [isDeletingChat, setIsDeletingChat] = useState(false);
  const [isDeletingWorkspace, setIsDeletingWorkspace] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<CodeMateChat | null>(null);
  const [workspaceToDelete, setWorkspaceToDelete] =
    useState<CodeMateWorkspace | null>(null);

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
   * 打开删除工作区确认弹窗。
   */
  const handleOpenDeleteWorkspaceDialog = useCallback(
    (workspace: CodeMateWorkspace) => {
      setWorkspaceToDelete(workspace);
    },
    [],
  );

  /**
   * 打开删除会话确认弹窗。
   */
  const handleOpenDeleteChatDialog = useCallback((chat: CodeMateChat) => {
    setChatToDelete(chat);
  }, []);

  /**
   * 关闭删除工作区确认弹窗。
   */
  const handleCloseDeleteWorkspaceDialog = useCallback(() => {
    if (!isDeletingWorkspace) {
      setWorkspaceToDelete(null);
    }
  }, [isDeletingWorkspace]);

  /**
   * 关闭删除会话确认弹窗。
   */
  const handleCloseDeleteChatDialog = useCallback(() => {
    if (!isDeletingChat) {
      setChatToDelete(null);
    }
  }, [isDeletingChat]);

  /**
   * 确认删除工作区，只删除本地 SQLite 记录，不删除真实文件夹。
   */
  const handleConfirmDeleteWorkspace = useCallback(async () => {
    if (!workspaceToDelete) {
      return;
    }

    setIsDeletingWorkspace(true);

    try {
      await deleteWorkspace(workspaceToDelete.id);
      dispatch(removeWorkspace(workspaceToDelete.id));
      dispatch(setFolderMessage(`已删除工作区：${workspaceToDelete.name}`));
      setExpandedWorkspaces((prev) => {
        const next = new Set(prev);
        next.delete(workspaceToDelete.id);
        return next;
      });
      setWorkspaceToDelete(null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete local workspace', error);
      dispatch(setFolderMessage('删除工作区失败，请稍后重试'));
    } finally {
      setIsDeletingWorkspace(false);
    }
  }, [dispatch, workspaceToDelete]);

  /**
   * 确认删除会话，关联消息由本地 SQLite 级联删除。
   */
  const handleConfirmDeleteChat = useCallback(async () => {
    if (!chatToDelete) {
      return;
    }

    setIsDeletingChat(true);

    try {
      await deleteLocalChat(chatToDelete.id);
      dispatch(removeChat(chatToDelete.id));
      dispatch(setFolderMessage(`已删除会话：${chatToDelete.title}`));
      setChatToDelete(null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete local chat', error);
      dispatch(setFolderMessage('删除会话失败，请稍后重试'));
    } finally {
      setIsDeletingChat(false);
    }
  }, [chatToDelete, dispatch]);

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
      <Dialog
        open={Boolean(chatToDelete)}
        onClose={handleCloseDeleteChatDialog}
        aria-labelledby="delete-chat-dialog-title"
      >
        <DialogTitle id="delete-chat-dialog-title">确认删除会话</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: 13 }}>
            删除后会移除“{chatToDelete?.title}”及其消息记录。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={isDeletingChat}
            onClick={handleCloseDeleteChatDialog}
          >
            取消
          </Button>
          <Button
            color="error"
            disabled={isDeletingChat}
            onClick={handleConfirmDeleteChat}
          >
            {isDeletingChat ? '删除中...' : '确认删除'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={Boolean(workspaceToDelete)}
        onClose={handleCloseDeleteWorkspaceDialog}
        aria-labelledby="delete-workspace-dialog-title"
      >
        <DialogTitle id="delete-workspace-dialog-title">
          确认删除工作区
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: 13 }}>
            {`删除后会移除“${workspaceToDelete?.name || ''}”及其下面的任务和消息记录，不会删除电脑上的真实文件夹。`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={isDeletingWorkspace}
            onClick={handleCloseDeleteWorkspaceDialog}
          >
            取消
          </Button>
          <Button
            color="error"
            disabled={isDeletingWorkspace}
            onClick={handleConfirmDeleteWorkspace}
          >
            {isDeletingWorkspace ? '删除中...' : '确认删除'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
