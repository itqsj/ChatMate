import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { CodeMateMessage } from '@renderer/types/codeMate';

type ChatMateMessageItemProps = {
  message: CodeMateMessage;
};

/**
 * 渲染单条聊天消息，区分用户和 AI 的气泡样式。
 */
export default function ChatMateMessageItem({
  message,
}: ChatMateMessageItemProps) {
  const isUser = message.role === 'user';

  /**
   * 复制 AI 消息内容，失败时只记录到控制台，避免打断聊天流程。
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to copy message', error);
    }
  };

  return (
    <Stack
      direction="row"
      sx={{ justifyContent: isUser ? 'flex-end' : 'flex-start' }}
    >
      <Paper
        elevation={0}
        sx={(theme) => ({
          bgcolor: isUser
            ? alpha(theme.palette.primary.main, 0.24)
            : alpha(theme.palette.background.paper, 0.88),
          border: `1px solid ${
            isUser
              ? alpha(theme.palette.primary.main, 0.28)
              : theme.palette.divider
          }`,
          borderRadius: 1,
          maxWidth: '76%',
          p: 1,
        })}
      >
        <Typography sx={{ fontSize: 12, lineHeight: 1.6 }}>
          {message.content}
        </Typography>
        {message.code && (
          <Box
            component="pre"
            sx={(theme) => ({
              bgcolor: alpha(theme.palette.background.paper, 0.84),
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              color: theme.palette.text.primary,
              fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
              fontSize: 11,
              lineHeight: 1.5,
              mt: 0.75,
              overflow: 'auto',
              p: 1,
            })}
          >
            <code>{message.code}</code>
          </Box>
        )}
        {!isUser && (
          <Stack direction="row" spacing={0.25} sx={{ mt: 0.5 }}>
            <Tooltip title="复制">
              <IconButton
                aria-label="复制 AI 消息"
                onClick={handleCopy}
                sx={(theme) => ({
                  color: theme.palette.text.secondary,
                  height: 24,
                  width: 24,
                })}
              >
                <ContentCopyIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
