import { CHAT_STREAM_API_URL, CHAT_STREAM_EVENT } from '@/constants/chat';
import type { CreateChatParams, CreateMessageParams } from '@/types/chatDB';
import type { CodeMateChat, CodeMateMessage } from '@renderer/types/codeMate';

type StreamChatParams = {
  message: string;
  onMessage: (content: string) => void;
};

type ServerSentEvent = {
  data: string;
  event: string;
};

/**
 * 把更新时间转换为左侧栏展示时间，SQLite 不单独存展示字段。
 */
const formatChatTime = (updatedAt: string) => {
  const date = new Date(updatedAt);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('zh-CN', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  });
};

/**
 * 把 SQLite 聊天记录转换为页面使用的数据结构。
 */
const mapChat = (chat: Omit<CodeMateChat, 'time'>): CodeMateChat => {
  return {
    ...chat,
    time: formatChatTime(chat.updatedAt),
  };
};

/**
 * 从本地 SQLite 查询聊天窗口列表。
 */
export const listChats = async (): Promise<CodeMateChat[]> => {
  try {
    const chats = await window.electron.chatDB.listChats();
    return chats.map(mapChat);
  } catch (error) {
    const message = error instanceof Error ? error.message : '查询任务失败';
    throw new Error(message);
  }
};

/**
 * 写入本地 SQLite 聊天窗口。
 */
export const createLocalChat = async (
  data: CreateChatParams,
): Promise<CodeMateChat> => {
  try {
    const chat = await window.electron.chatDB.createChat(data);
    return mapChat(chat);
  } catch (error) {
    const message = error instanceof Error ? error.message : '创建任务失败';
    throw new Error(message);
  }
};

/**
 * 从本地 SQLite 查询指定聊天窗口的消息。
 */
export const listMessages = async (
  chatId: string,
): Promise<CodeMateMessage[]> => {
  try {
    return await window.electron.chatDB.listMessages(chatId);
  } catch (error) {
    const message = error instanceof Error ? error.message : '查询消息失败';
    throw new Error(message);
  }
};

/**
 * 写入本地 SQLite 聊天消息。
 */
export const createLocalMessage = async (
  data: CreateMessageParams,
): Promise<CodeMateMessage> => {
  try {
    return await window.electron.chatDB.createMessage(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : '保存消息失败';
    throw new Error(message);
  }
};

/**
 * 解析后端流式接口返回的一段 SSE 内容。
 */
const parseSseEvent = (rawEvent: string): ServerSentEvent => {
  const dataLines: string[] = [];
  let eventName: string = CHAT_STREAM_EVENT.MESSAGE;

  rawEvent.split(/\r?\n/).forEach((line) => {
    if (line.startsWith('event:')) {
      eventName = line.slice('event:'.length).trim();
    }

    if (line.startsWith('data:')) {
      let data = line.slice('data:'.length);
      if (data.startsWith(' ')) {
        data = data.slice(1);
      }
      dataLines.push(data);
    }
  });

  return {
    data: dataLines.join('\n'),
    event: eventName,
  };
};

/**
 * 根据 SSE 事件类型处理消息、错误或结束信号。
 */
const handleSseEvent = (
  rawEvent: string,
  onMessage: (content: string) => void,
) => {
  const parsedEvent = parseSseEvent(rawEvent);

  if (parsedEvent.event === CHAT_STREAM_EVENT.ERROR) {
    throw new Error(parsedEvent.data || '聊天接口返回错误');
  }

  if (
    parsedEvent.event === CHAT_STREAM_EVENT.MESSAGE &&
    parsedEvent.data !== ''
  ) {
    onMessage(parsedEvent.data);
  }
};

/**
 * 读取流式响应，并用 buffer 暂存未接收完整的 SSE 片段。
 */
const readStream = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onMessage: (content: string) => void,
) => {
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    let isReading = true;

    while (isReading) {
      // 流式读取必须按顺序等待每个分片，避免消息乱序。
      // eslint-disable-next-line no-await-in-loop
      const { done, value } = await reader.read();

      if (done) {
        isReading = false;
      } else {
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() || '';

        events.forEach((eventText) => {
          if (eventText.trim() !== '') {
            handleSseEvent(eventText, onMessage);
          }
        });
      }
    }

    buffer += decoder.decode();
    if (buffer.trim() !== '') {
      handleSseEvent(buffer, onMessage);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '读取聊天流失败';
    throw new Error(message);
  }
};

/**
 * 请求后端 DeepSeek 流式接口；聊天记录保存由本地 SQLite 负责。
 */
export const streamChat = async ({ message, onMessage }: StreamChatParams) => {
  try {
    const response = await fetch(CHAT_STREAM_API_URL, {
      body: JSON.stringify({ message }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`聊天接口请求失败：${response.status}`);
    }

    if (!response.body) {
      throw new Error('聊天接口没有返回流式内容');
    }

    const reader = response.body.getReader();

    try {
      await readStream(reader, onMessage);
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    const nextErrorMessage =
      error instanceof Error ? error.message : '聊天接口请求失败';

    throw new Error(nextErrorMessage);
  }
};
