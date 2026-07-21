import { useState, type KeyboardEvent } from 'react';
import SendIcon from '@mui/icons-material/Send';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import useStreamChat from '@renderer/hooks/useStreamChat';
import {
  selectCodeMateChats,
  selectCodeMateSelectedChatId,
  selectCodeMateWorkspaces,
} from '@renderer/store/selectors';
import { useAppSelector } from '@renderer/store/hooks';

/**
 * 渲染底部输入区，并负责发送聊天消息。
 */
export default function ChatMateComposer() {
  const selectedChatId = useAppSelector(selectCodeMateSelectedChatId);
  const chats = useAppSelector(selectCodeMateChats);
  const workspaces = useAppSelector(selectCodeMateWorkspaces);
  const selectedChat = chats.find((chat) => chat.id === selectedChatId);
  const activeWorkspace = workspaces.find(
    (workspace) => workspace.id === selectedChat?.workspaceId,
  );

  const { errorMessage, isStreaming, sendMessage } = useStreamChat();
  const [message, setMessage] = useState('');
  const workspaceName = activeWorkspace?.name || '未选择工作区';

  /**
   * 把当前输入内容发送到后端流式接口，并由 hook 写入本地 SQLite。
   */
  const handleSend = async () => {
    try {
      const sent = await sendMessage(message);
      if (sent) {
        setMessage('');
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

  /**
   * 支持 Ctrl/Command + Enter 快捷发送。
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={(theme) => ({
        borderTop: `1px solid ${theme.palette.divider}`,
        px: 2,
        py: 1,
      })}
    >
      <Box
        sx={(theme) => ({
          bgcolor: alpha(theme.palette.background.paper, 0.72),
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          boxShadow: theme.shadows[8],
          maxWidth: 860,
          mx: 'auto',
          overflow: 'hidden',
          p: 0.75,
        })}
      >
        <TextField
          fullWidth
          disabled={isStreaming}
          maxRows={6}
          minRows={3}
          multiline
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="描述你要完成的任务..."
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'transparent',
              fontSize: 12,
              py: 0,
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: 'transparent',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'transparent',
              },
            },
          }}
          value={message}
        />

        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            gap: 0.75,
            justifyContent: 'space-between',
            pt: 0.4,
          }}
        >
          <Stack
            direction="row"
            spacing={0.5}
            sx={{ alignItems: 'center', flexWrap: 'wrap' }}
          >
            <Tooltip title="上传文件">
              <IconButton
                aria-label="上传文件"
                sx={(theme) => ({
                  color: theme.palette.text.secondary,
                  height: 24,
                  width: 24,
                })}
              >
                <UploadFileIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
            <Chip
              label={`当前工作区：${workspaceName}`}
              size="small"
              sx={(theme) => ({
                bgcolor: alpha(theme.palette.success.main, 0.12),
                color: theme.palette.success.light,
                fontSize: 10,
                height: 20,
              })}
            />
            <Typography
              sx={(theme) => ({
                color: theme.palette.text.secondary,
                fontSize: 10,
              })}
            >
              {activeWorkspace ? '已绑定项目上下文' : '未绑定项目上下文'}
            </Typography>
            {errorMessage && (
              <Typography
                sx={(theme) => ({
                  color: theme.palette.error.main,
                  fontSize: 10,
                })}
              >
                {errorMessage}
              </Typography>
            )}
          </Stack>

          <Button
            disabled={isStreaming || message.trim() === ''}
            onClick={handleSend}
            startIcon={<SendIcon sx={{ fontSize: 15 }} />}
            sx={{ fontSize: 12, minHeight: 28, px: 1.5 }}
            variant="contained"
          >
            {isStreaming ? '发送中' : '发送'}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
