import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { CodeMateMessage } from '@renderer/types/codeMate';

type ChatMateMessageItemProps = {
  message: CodeMateMessage;
};

/**
 * 渲染单条聊天消息，负责区分用户和 AI 的气泡样式。
 */
export default function ChatMateMessageItem({
  message,
}: ChatMateMessageItemProps) {
  const isUser = message.role === 'user';

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
          borderRadius: 1.5,
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
              borderRadius: 1.5,
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
            <IconButton
              aria-label="AI 消息操作 复制"
              sx={(theme) => ({
                color: theme.palette.text.secondary,
                fontSize: 12,
                height: 24,
                width: 24,
              })}
            >
              📋
            </IconButton>
          </Stack>
        )}
      </Paper>
    </Stack>
  );
}
