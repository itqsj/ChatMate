import { useCallback, useState } from 'react';
import { streamChat } from '@renderer/api/chat';
import {
  appendChatMessage,
  appendChatMessageChunk,
  createChat,
  selectCodeMateSelectedChatId,
  setChatMessageContent,
} from '@renderer/store/codeMateSlice';
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks';

/**
 * 创建本地聊天消息 ID。
 */
const createChatMessageId = () => {
  return `message-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

/**
 * 创建本地聊天记录 ID。
 */
const createChatId = () => {
  return `chat-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

/**
 * 根据第一条用户消息生成聊天标题。
 */
const createChatTitle = (content: string) => {
  return content.length > 20 ? `${content.slice(0, 20)}...` : content;
};

/**
 * 发送用户消息，并按流式片段更新 AI 回复。
 */
export const useStreamChat = () => {
  const dispatch = useAppDispatch();
  const selectedChatId = useAppSelector(selectCodeMateSelectedChatId);
  const [errorMessage, setErrorMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(
    async (message: string) => {
      const content = message.trim();

      // 空内容和正在输出时不再重复发送，避免生成无效请求。
      if (content === '' || isStreaming) {
        return false;
      }

      const assistantMessageId = createChatMessageId();

      // 如果当前没有聊天记录，先用第一条用户消息创建一个新聊天。
      if (selectedChatId === '') {
        dispatch(
          createChat({
            id: createChatId(),
            time: '刚刚',
            title: createChatTitle(content),
          }),
        );
      }

      // 先把用户消息写入列表，让界面立即展示用户输入。
      dispatch(
        appendChatMessage({
          content,
          id: createChatMessageId(),
          role: 'user',
        }),
      );

      // 再插入一条空的 AI 消息，后续流式分片会持续追加到这条消息上。
      dispatch(
        appendChatMessage({
          content: '',
          id: assistantMessageId,
          role: 'assistant',
        }),
      );

      setErrorMessage('');
      setIsStreaming(true);

      try {
        // 调用统一 API 方法，把后端返回的每个文本分片追加到 AI 消息。
        await streamChat({
          message: content,
          onMessage: (chunk) => {
            dispatch(
              appendChatMessageChunk({
                chunk,
                id: assistantMessageId,
              }),
            );
          },
        });

        return true;
      } catch (error) {
        // 请求失败时保留 AI 占位消息，并把错误转换成用户可见的反馈。
        const nextErrorMessage =
          error instanceof Error ? error.message : '聊天接口请求失败';

        setErrorMessage(nextErrorMessage);
        dispatch(
          setChatMessageContent({
            content: `请求失败：${nextErrorMessage}`,
            id: assistantMessageId,
          }),
        );

        return false;
      } finally {
        // 无论成功还是失败，都要恢复发送按钮状态。
        setIsStreaming(false);
      }
    },
    [dispatch, isStreaming, selectedChatId],
  );

  return {
    errorMessage,
    isStreaming,
    sendMessage,
  };
};
