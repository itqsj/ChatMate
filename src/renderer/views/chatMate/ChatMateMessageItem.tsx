import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import type { CodeMateMessage } from '@renderer/types/codeMate';
import hljs from 'highlight.js';
import { Children, type ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';

type ChatMateMessageItemProps = {
  message: CodeMateMessage;
};

type CodeElementProps = {
  children?: ReactNode;
  className?: string;
};

const CODE_LANGUAGE_CLASS = /language-(\S+)/;

const CODE_LANGUAGE_ALIASES: Record<string, string> = {
  golang: 'go',
  'objective-c': 'objc',
  vue: 'xml',
  vuejs: 'xml',
};

/**
 * 从 Markdown 代码块 className 中读取语言标记。
 */
const getCodeLanguage = (className?: string) => {
  const language = className?.match(CODE_LANGUAGE_CLASS)?.[1];
  return language ? language.toLowerCase() : '';
};

/**
 * 把代码块 children 转成纯文本，交给 highlight.js 处理。
 */
const getCodeText = (children?: ReactNode) => {
  return Children.toArray(children).join('').replace(/\n$/, '');
};

/**
 * 判断没有语言标记的 code 是否来自 Markdown 代码块。
 */
const isCodeBlockText = (children?: ReactNode) => {
  return Children.toArray(children).join('').includes('\n');
};

/**
 * 使用 highlight.js 高亮代码；没有语言时自动识别。
 */
const highlightMarkdownCode = (code: string, rawLanguage: string) => {
  const language = CODE_LANGUAGE_ALIASES[rawLanguage] || rawLanguage;

  if (language && hljs.getLanguage(language)) {
    hljs.highlight(code, {
      ignoreIllegals: true,
      language,
    }).value;
  }

  // 未标注语言或语言不支持时自动识别，尽量让普通代码块也有高亮。
  return hljs.highlightAuto(code).value;
};

/**
 * 自定义 Markdown 代码块渲染，直接控制高亮逻辑。
 */
const markdownComponents = {
  code({ children, className: sourceClassName }: CodeElementProps) {
    const codeText = getCodeText(children);
    const rawLanguage = getCodeLanguage(sourceClassName);

    if (!rawLanguage && !isCodeBlockText(children)) {
      return <code className={sourceClassName}>{children}</code>;
    }

    const highlightedCode = highlightMarkdownCode(codeText, rawLanguage);
    const nextClassName = rawLanguage ? `hljs language-${rawLanguage}` : 'hljs';

    return (
      <code
        className={nextClassName}
        // highlight.js 会转义源码，只保留用于着色的 span 标签。
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
    );
  },
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
          border: `1px solid ${isUser
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
            components={markdownComponents}
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
