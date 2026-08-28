import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { CodeMateMessage } from '@renderer/types/codeMate';
import hljs from 'highlight.js';
import { Children, useEffect, useRef, useState, type ReactNode } from 'react';
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
    return hljs.highlight(code, {
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
 * 仿 DeepSeek / Kimi 风格的深度思考展示组件（支持折叠/展开、左侧引导线）。
 */

function DeepSeekThoughtView({
  thought,
  isFinished,
}: {
  thought: string;
  isFinished: boolean;
}) {
  const [expanded, setExpanded] = useState(true);

  if (!thought) return null;

  return (
    <Box sx={{ mb: 1.5, mt: 0.25 }}>
      {/* 头部：已思考 / 思考中... 切换条 */}
      <Stack
        direction="row"
        onClick={() => setExpanded((prev) => !prev)}
        spacing={0.5}
        sx={(theme) => ({
          alignItems: 'center',
          borderRadius: 0.75,
          color: theme.palette.text.secondary,
          cursor: 'pointer',
          display: 'inline-flex',
          px: 0.5,
          py: 0.25,
          transition: 'all 0.15s ease',
          userSelect: 'none',
          '&:hover': {
            bgcolor: alpha(theme.palette.text.primary, 0.06),
            color: theme.palette.text.primary,
          },
        })}
      >
        <PsychologyOutlinedIcon
          sx={(theme) => ({
            fontSize: 16,
            color: isFinished
              ? theme.palette.text.secondary
              : theme.palette.primary.main,
          })}
        />
        <Typography
          sx={{
            color: 'inherit',
            fontSize: 12,
            fontWeight: 500,
          }}
        >
          {isFinished ? '已思考' : '思考中...'}
        </Typography>
        {expanded ? (
          <KeyboardArrowUpIcon sx={{ color: 'inherit', fontSize: 16 }} />
        ) : (
          <KeyboardArrowDownIcon sx={{ color: 'inherit', fontSize: 16 }} />
        )}
      </Stack>

      {/* 思考内容主体：左侧带引导线，缩进排版 */}
      <Collapse in={expanded}>
        <Box
          sx={(theme) => ({
            borderLeft: `2px solid ${alpha(theme.palette.text.primary, 0.14)}`,
            color: alpha(theme.palette.text.primary, 0.65),
            fontSize: 12,
            lineHeight: 1.65,
            maxHeight: 380,
            ml: 0.75,
            mt: 0.75,
            overflowY: 'auto',
            pl: 1.5,
            wordBreak: 'break-word',
            '& ul, & ol': {
              my: 0.5,
              pl: 2,
            },
            '& p': {
              my: 0.5,
            },
            '& blockquote': {
              borderLeft: `2px solid ${theme.palette.primary.main}`,
              my: 0.5,
              opacity: 0.85,
              pl: 1,
            },
          })}
        >
          <ReactMarkdown
            components={markdownComponents}
            remarkPlugins={[remarkGfm]}
          >
            {thought}
          </ReactMarkdown>
        </Box>
      </Collapse>
    </Box>
  );
}

/**
 * 判断消息元素是否已经滚动到达顶部并进入吸顶状态。
 * @param elementTop 元素当前相对视口的顶边坐标
 * @param containerTop 滚动容器当前相对视口的顶边坐标
 * @param tolerance 容差范围（默认 12px，覆盖渲染亚像素与微小内边距偏移）
 */
export const checkIsElementStuck = (
  elementTop: number,
  containerTop: number,
  tolerance = 12,
): boolean => {
  return elementTop <= containerTop + tolerance;
};

/**
 * 渲染单条聊天消息，区分用户和 AI 的气泡样式。
 * 在每个问答轮次中，用户提问独占一行通栏吸顶（Sticky Top）并支持毛玻璃平滑过渡效果。
 */
export default function ChatMateMessageItem({
  message,
}: ChatMateMessageItemProps) {
  const isUser = message.role === 'user';
  const itemRef = useRef<HTMLDivElement | null>(null);
  const [isStuck, setIsStuck] = useState(false);

  /**
   * 监听父级滚动容器的滚动，检测用户提问是否到达顶部吸顶位置，并触发平滑过渡动效。
   */
  useEffect(() => {
    if (!isUser) {
      return undefined;
    }
    const element = itemRef.current;
    if (!element) {
      return undefined;
    }

    const scrollContainer = element.closest('.chatmate-message-scroll-box');
    if (!scrollContainer) {
      return undefined;
    }

    const checkSticky = () => {
      const containerRect = scrollContainer.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const stuck = checkIsElementStuck(elementRect.top, containerRect.top, 12);
      setIsStuck((prev) => (prev !== stuck ? stuck : prev));
    };

    scrollContainer.addEventListener('scroll', checkSticky, { passive: true });
    checkSticky();

    return () => {
      scrollContainer.removeEventListener('scroll', checkSticky);
    };
  }, [isUser]);

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

  // 用户消息渲染：吸顶时一体化浮现靠左标题顶栏，未吸顶时常规靠右气泡，杜绝先白后宽的脱节拉伸
  if (isUser) {
    return (
      <Box
        ref={itemRef}
        sx={(theme) => ({
          backdropFilter: isStuck ? 'blur(16px)' : 'none',
          bgcolor: isStuck
            ? alpha(theme.palette.background.paper, 0.72)
            : 'transparent',
          borderBottom: isStuck
            ? `1px solid ${alpha(theme.palette.divider, 0.5)}`
            : '1px solid transparent',
          boxShadow: isStuck
            ? `0 4px 16px ${alpha(theme.palette.common.black, 0.06)}`
            : 'none',
          boxSizing: 'border-box',
          position: 'sticky',
          py: isStuck ? 0.75 : 0.25,
          top: 0,
          transition:
            'background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1), backdrop-filter 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1), padding 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          width: '100%',
          zIndex: 10,
        })}
      >
        <Box
          sx={{
            boxSizing: 'border-box',
            maxWidth: 860,
            mx: 'auto',
            px: 3,
            width: '100%',
          }}
        >
          {isStuck ? (
            /* 吸顶状态：一体化全宽顶栏，文本靠左，直接呈现标题字阶，背景与内容同步就位 */
            <Box
              sx={{
                animation: 'chatmateFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                textAlign: 'left',
                width: '100%',
                '@keyframes chatmateFadeIn': {
                  from: { opacity: 0, transform: 'translateY(-2px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              {message.content && (
                <Box
                  className="chatmate-message-content"
                  sx={(theme) => ({
                    color: theme.palette.text.primary,
                    fontSize: 13,
                    fontWeight: 600,
                    lineHeight: 1.65,
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                    '& > :first-child': { mt: 0 },
                    '& > :last-child': { mb: 0 },
                  })}
                >
                  <ReactMarkdown
                    components={markdownComponents}
                    remarkPlugins={[remarkGfm]}
                  >
                    {message.content}
                  </ReactMarkdown>
                </Box>
              )}
            </Box>
          ) : (
            /* 未吸顶状态：常规靠右独立蓝色气泡 */
            <Stack
              direction="row"
              sx={{ justifyContent: 'flex-end', width: '100%' }}
            >
              <Paper
                elevation={0}
                sx={(theme) => ({
                  bgcolor: alpha(theme.palette.primary.main, 0.24),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.28)}`,
                  borderRadius: 1,
                  boxSizing: 'border-box',
                  maxWidth: '76%',
                  p: 1,
                })}
              >
                {message.content && (
                  <Box
                    className="chatmate-message-content"
                    sx={(theme) => ({
                      color: theme.palette.text.primary,
                      fontSize: 12,
                      lineHeight: 1.65,
                      overflowWrap: 'anywhere',
                      wordBreak: 'break-word',
                      '& > :first-child': { mt: 0 },
                      '& > :last-child': { mb: 0 },
                    })}
                  >
                    <ReactMarkdown
                      components={markdownComponents}
                      remarkPlugins={[remarkGfm]}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </Box>
                )}
              </Paper>
            </Stack>
          )}
        </Box>
      </Box>
    );
  }

  // AI 回复消息渲染：外层 100% 确保与用户消息、输入框在中央 860px 主列严格对齐，内层气泡保持 82% 宽度并在右侧留出呼吸距离
  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          boxSizing: 'border-box',
          maxWidth: 860,
          mx: 'auto',
          px: 3,
          width: '100%',
        }}
      >
        <Stack
          direction="row"
          sx={{ justifyContent: 'flex-start', width: '100%' }}
        >
          <Paper
            elevation={0}
            sx={(theme) => ({
              bgcolor: alpha(theme.palette.background.paper, 0.88),
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
              boxSizing: 'border-box',
              maxWidth: '82%',
              p: 1.25,
            })}
          >
            {!isUser && message.thought && (
              <DeepSeekThoughtView
                isFinished={Boolean(message.content)}
                thought={message.thought}
              />
            )}

            {message.content && (
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
            )}
            {message.code && (
              <Box
                component="pre"
                sx={(theme) => ({
                  bgcolor: alpha(theme.palette.background.paper, 0.84),
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  color: theme.palette.text.primary,
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Consolas, monospace',
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
            {!isUser && message.content && (
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
      </Box>
    </Box>
  );
}
