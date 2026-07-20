import { CHAT_STREAM_API_URL, CHAT_STREAM_EVENT } from '@/constants/chat';

type StreamChatParams = {
  message: string;
  onMessage: (content: string) => void;
};

type ServerSentEvent = {
  data: string;
  event: string;
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
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() || '';

      events.forEach((eventText) => {
        if (eventText.trim() !== '') {
          handleSseEvent(eventText, onMessage);
        }
      });
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
 * 请求后端聊天流式接口，并把返回的文本片段交给回调处理。
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
