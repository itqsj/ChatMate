import SendIcon from '@mui/icons-material/Send';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { useStreamChat } from '@renderer/hooks/useStreamChat';
import { selectCodeMateActiveWorkspace } from '@renderer/store/codeMateSlice';
import { useAppSelector } from '@renderer/store/hooks';
import { useState, type KeyboardEvent } from 'react';

/**
 * 渲染底部输入区，并负责发送聊天消息。
 */
export default function ChatMateComposer() {
  const activeWorkspace = useAppSelector(selectCodeMateActiveWorkspace);
  const { errorMessage, isStreaming, sendMessage } = useStreamChat();
  const [message, setMessage] = useState('');
  const workspaceName = activeWorkspace?.name || '未选择工作区';

  /**
   * 把当前输入内容发送到后端聊天流式接口。
   */
  const handleSend = async () => {
    try {
      const sent = await sendMessage(message);
      if (sent) {
        setMessage('');
      }
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * 支持 Ctrl/Command + Enter 快捷发送。
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      void handleSend();
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
          mx: 'auto',
          maxWidth: 860,
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
            <Chip
              label={`当前工作区 ${workspaceName}`}
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
            onClick={() => void handleSend()}
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
