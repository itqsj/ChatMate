import { useCallback, useState } from 'react';
import {
  createStreamChatHistory,
  createLocalChat,
  createLocalMessage,
  listChats,
  streamChat,
} from '@renderer/api/chat';
import {
  appendChatMessage,
  appendChatMessageChunk,
  createChat,
  setChatMessageContent,
  setChats,
} from '@renderer/store/codeMateSlice';
import {
  selectCodeMateMessages,
  selectCodeMateSelectedChat,
} from '@renderer/store/selectors';
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks';
import type { CodeMateChat } from '@renderer/types/codeMate';

/**
 * 创建本地聊天消息 ID。
 */
const createChatMessageId = () => {
  return `message-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

/**
 * 根据第一条用户消息生成聊天标题。
 */
const createChatTitle = (content: string) => {
  const chars = Array.from(content);
  return chars.length > 20 ? `${chars.slice(0, 20).join('')}...` : content;
};

/**
 * 创建前端临时消息时间。
 */
const getNow = () => new Date().toISOString();

/**
 * 发送用户消息，写入本地 SQLite，并按流式片段更新 AI 回复。
 */
const useStreamChat = () => {
  const dispatch = useAppDispatch();
  const messages = useAppSelector(selectCodeMateMessages);
  const selectedChat = useAppSelector(selectCodeMateSelectedChat);
  const [errorMessage, setErrorMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  /**
   * 刷新左侧栏任务列表，确保更新时间排序和 SQLite 一致。
   */
  const refreshChats = useCallback(async () => {
    const nextChats = await listChats();
    dispatch(setChats(nextChats));
  }, [dispatch]);

  const sendMessage = useCallback(
    async (message: string) => {
      const content = message.trim();

      // 空内容和正在输出时不重复发送，避免生成无效请求。
      if (content === '' || isStreaming) {
        return false;
      }

      setErrorMessage('');
      setIsStreaming(true);

      const assistantMessageId = createChatMessageId();
      let activeChat: CodeMateChat | null = selectedChat;
      let assistantContent = '';

      try {
        // 没有选中任务时，用第一条消息创建本地任务。
        if (!activeChat) {
          activeChat = await createLocalChat({
            title: createChatTitle(content),
          });
          dispatch(createChat(activeChat));
        }

        // 创建信息
        const userMessage = await createLocalMessage({
          chatId: activeChat.id,
          content,
          role: 'user',
        });

        // 后端无状态调用模型，前端只传当前会话最近 30 条历史消息。
        const history = createStreamChatHistory(messages);

        dispatch(appendChatMessage(userMessage));
        await refreshChats();

        const now = getNow();
        // 追加 AI 信息
        dispatch(
          appendChatMessage({
            chatId: activeChat.id,
            content: '',
            createdAt: now,
            id: assistantMessageId,
            role: 'assistant',
            updatedAt: now,
          }),
        );

        await streamChat({
          history,
          message: content,
          onMessage: (chunk) => {
            assistantContent += chunk;
            // 更新 AI 返回信息
            dispatch(
              appendChatMessageChunk({
                chunk,
                id: assistantMessageId,
              }),
            );
          },
        });

        if (assistantContent !== '') {
          // 创建 AI 信息到数据库
          const assistantMessage = await createLocalMessage({
            chatId: activeChat.id,
            content: assistantContent,
            id: assistantMessageId,
            role: 'assistant',
          });

          // 更新 AI 返回信息
          dispatch(
            setChatMessageContent({
              content: assistantMessage.content,
              id: assistantMessage.id,
              updatedAt: assistantMessage.updatedAt,
            }),
          );
          await refreshChats();
        }

        return true;
      } catch (error) {
        const nextErrorMessage =
          error instanceof Error ? error.message : '聊天接口请求失败';

        setErrorMessage(nextErrorMessage);
        dispatch(
          setChatMessageContent({
            content: `请求失败：${nextErrorMessage}`,
            id: assistantMessageId,
            updatedAt: getNow(),
          }),
        );

        return false;
      } finally {
        setIsStreaming(false);
      }
    },
    [dispatch, isStreaming, messages, refreshChats, selectedChat],
  );

  return {
    errorMessage,
    isStreaming,
    sendMessage,
  };
};

export default useStreamChat;
