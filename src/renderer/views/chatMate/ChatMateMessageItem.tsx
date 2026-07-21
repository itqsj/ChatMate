import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import type { CodeMateMessage } from '@renderer/types/codeMate';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';

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
        <Box
          className="chatmate-message-content"
          sx={(theme) => ({
            color: theme.palette.text.primary,
            fontSize: 12,
            lineHeight: 1.65,
            overflowWrap: 'anywhere',
            wordBreak: 'break-word',
            '& > :first-child': {
              mt: 0,
            },
            '& > :last-child': {
              mb: 0,
            },
            '& a': {
              color: theme.palette.primary.main,
              textDecoration: 'none',
            },
            '& a:hover': {
              textDecoration: 'underline',
            },
            '& blockquote': {
              borderLeft: `3px solid ${theme.palette.divider}`,
              color: theme.palette.text.secondary,
              m: 0,
              pl: 1,
            },
            '& code': {
              bgcolor: alpha(theme.palette.text.primary, 0.08),
              borderRadius: 0.5,
              fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
              fontSize: 11,
              px: 0.4,
              py: 0.1,
            },
            '& img': {
              borderRadius: 0.5,
              display: 'block',
              height: 'auto',
              maxWidth: '100%',
            },
            '& li': {
              my: 0.25,
            },
            '& ol, & ul': {
              mb: 0.75,
              mt: 0.75,
              pl: 2,
            },
            '& p': {
              mb: 0.75,
              mt: 0,
            },
            '& pre': {
              bgcolor: '#0d1117',
              border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
              borderRadius: 1,
              color: '#c9d1d9',
              fontFamily: 'ui-monospace, SFMono-Regular, Consolas, monospace',
              fontSize: 11,
              lineHeight: 1.55,
              my: 0.75,
              overflow: 'auto',
              p: 1,
            },
            '& pre code': {
              bgcolor: 'transparent',
              borderRadius: 0,
              color: 'inherit',
              display: 'block',
              fontSize: 'inherit',
              overflowWrap: 'normal',
              p: 0,
              whiteSpace: 'pre',
              wordBreak: 'normal',
            },
            '& table': {
              borderCollapse: 'collapse',
              display: 'block',
              maxWidth: '100%',
              overflow: 'auto',
            },
            '& td, & th': {
              border: `1px solid ${theme.palette.divider}`,
              px: 0.75,
              py: 0.5,
            },
            '& th': {
              bgcolor: alpha(theme.palette.text.primary, 0.06),
              fontWeight: 700,
            },
          })}
        >
          <ReactMarkdown
            rehypePlugins={[rehypeHighlight]}
            remarkPlugins={[remarkGfm]}
          >
            {message.content}
          </ReactMarkdown>
        </Box>
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
