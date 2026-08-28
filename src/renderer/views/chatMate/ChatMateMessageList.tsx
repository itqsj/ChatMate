import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AUTO_SCROLL_THRESHOLD } from '@/constants/chat';
import {
  selectCodeMateMessages,
  selectCodeMateSelectedChat,
} from '@renderer/store/selectors';
import { useAppSelector } from '@renderer/store/hooks';
import ChatMateMessageItem from '@renderer/views/chatMate/ChatMateMessageItem';

/**
 * 判断当前滚动位置是否处于吸底阈值范围内。
 * 滚动到底部的距离 = 容器内容总高 - 当前滚动偏移 - 容器视口可视高度。
 */
export const checkIsAtBottom = (
  scrollHeight: number,
  scrollTop: number,
  clientHeight: number,
  threshold: number = AUTO_SCROLL_THRESHOLD,
): boolean => {
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
  return distanceFromBottom <= threshold;
};

/**
 * 对话轮次结构，包含用户提问与该轮产生的 AI 回复。
 */
export type ChatTurn<T = { id: string; role: string }> = {
  assistantMessages: T[];
  id: string;
  userMessage: T | null;
};

/**
 * 将离散的消息序列按问答轮次（Turn）聚合。
 * 每一轮以用户提问（userMessage）为头部，包含其后产生的所有 AI 回复（assistantMessages）。
 * 每个 Turn 作为独立的 CSS sticky 作用域，天然实现“当前显示哪条回复，顶部就吸附哪条提问”。
 */
export const groupMessagesIntoTurns = <T extends { id: string; role: string }>(
  messages: readonly T[],
): ChatTurn<T>[] => {
  const turns: ChatTurn<T>[] = [];
  let currentTurn: ChatTurn<T> | null = null;

  for (let i = 0; i < messages.length; i += 1) {
    const msg = messages[i];
    if (msg.role === 'user') {
      currentTurn = {
        assistantMessages: [],
        id: msg.id,
        userMessage: msg,
      };
      turns.push(currentTurn);
    } else if (currentTurn) {
      currentTurn.assistantMessages.push(msg);
    } else {
      // 初始无用户提问时的消息（例如欢迎语）
      currentTurn = {
        assistantMessages: [msg],
        id: msg.id,
        userMessage: null,
      };
      turns.push(currentTurn);
    }
  }

  return turns;
};

/**
 * 展示当前聊天标题和消息列表。

 * 支持用户按 Enter 发送时自动平滑滚到底部，以及持续输出流内容时实时吸底显示。
 */
export default function ChatMateMessageList() {
  const messages = useAppSelector(selectCodeMateMessages);
  const selectedChat = useAppSelector(selectCodeMateSelectedChat);
  const turns = groupMessagesIntoTurns(messages);

  // 滚动容器的 DOM 引用
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  // 是否处于吸底模式：在底部时为 true，向上滚动翻阅历史时为 false
  const isAtBottomRef = useRef(true);
  // 记录上一轮消息数量，用于区分是新消息追加还是流式片段吐字
  const prevMessageCountRef = useRef(messages.length);

  /**
   * 控制滚动容器滚动到最底部。
   * @param smooth 是否使用平滑滚动动画
   */
  const scrollToBottom = (smooth = false) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    if (smooth) {
      container.scrollTo({
        behavior: 'smooth',
        top: container.scrollHeight,
      });
    } else {
      container.scrollTop = container.scrollHeight;
    }
  };

  /**
   * 监听容器滚动事件。
   * 当用户向上滚动查看历史时暂停吸底；滑回底部时恢复吸底。
   */
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    isAtBottomRef.current = checkIsAtBottom(
      container.scrollHeight,
      container.scrollTop,
      container.clientHeight,
      AUTO_SCROLL_THRESHOLD,
    );
  };

  // 记录上一轮选中的会话 ID，用于检测是否切换了聊天
  const prevChatIdRef = useRef(selectedChat?.id);

  /**
   * 监听会话切换与消息变化：
   * 1. 切换会话时：重置吸底状态与消息计数，瞬时定位到底部。
   * 2. 新增消息时（用户按 Enter 发送或新消息入列）：平滑滚到底部并恢复吸底。
   * 3. 流式输出内容追加时：若处于吸底模式，瞬时贴底跟随。
   */
  useEffect(() => {
    const isChatChanged = selectedChat?.id !== prevChatIdRef.current;
    prevChatIdRef.current = selectedChat?.id;

    if (isChatChanged) {
      isAtBottomRef.current = true;
      prevMessageCountRef.current = messages.length;
      scrollToBottom(false);
      return;
    }

    const isNewMessage = messages.length > prevMessageCountRef.current;
    prevMessageCountRef.current = messages.length;

    if (isNewMessage) {
      isAtBottomRef.current = true;
      scrollToBottom(true);
      return;
    }

    if (isAtBottomRef.current) {
      scrollToBottom(false);
    }
  }, [messages, selectedChat?.id]);

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <Stack
        direction="row"
        sx={(theme) => ({
          alignItems: 'center',
          backdropFilter: 'blur(12px)',
          bgcolor: 'transparent',
          borderBottom: `1px solid ${theme.palette.divider}`,
          gap: 0.75,
          minHeight: 42,
          px: 2,
        })}
      >
        <Typography noWrap sx={{ fontSize: 13, fontWeight: 800 }}>
          {selectedChat?.title || '新聊天'}
        </Typography>
      </Stack>

      <Box
        className="chatmate-message-scroll-box"
        onScroll={handleScroll}
        ref={scrollContainerRef}
        sx={{ flex: 1, overflow: 'auto' }}
      >
        <Stack spacing={2} sx={{ pb: 2, pt: 1.5, width: '100%' }}>
          {turns.length === 0 ? (
            <Typography
              sx={(theme) => ({
                color: theme.palette.text.secondary,
                fontSize: 12,
                maxWidth: 860,
                mx: 'auto',
                px: 3,
              })}
            >
              暂无消息
            </Typography>
          ) : (
            turns.map((turn) => (
              <Box
                className="chatmate-turn-container"
                key={turn.id}
                sx={{ position: 'relative', width: '100%' }}
              >
                {turn.userMessage && (
                  <ChatMateMessageItem
                    key={turn.userMessage.id}
                    message={turn.userMessage}
                  />
                )}
                {turn.assistantMessages.length > 0 && (
                  <Stack
                    spacing={1.25}
                    sx={{ pt: turn.userMessage ? 1 : 0, width: '100%' }}
                  >
                    {turn.assistantMessages.map((assistantMsg) => (
                      <ChatMateMessageItem
                        key={assistantMsg.id}
                        message={assistantMsg}
                      />
                    ))}
                  </Stack>
                )}
              </Box>
            ))
          )}
        </Stack>
      </Box>
    </Box>
  );
}
