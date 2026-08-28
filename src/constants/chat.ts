export const CHAT_API_BASE_URL = 'http://localhost:8888';

export const CHAT_STREAM_API_URL = `${CHAT_API_BASE_URL}/api/chat/stream`;

export const CHAT_HISTORY_MESSAGE_LIMIT = 30;

export const CHAT_STREAM_EVENT = {
  DONE: 'done',
  ERROR: 'error',
  MESSAGE: 'message',
  THOUGHT: 'thought',
} as const;

/**
 * 判定消息列表是否吸底的距离阈值（单位：像素）。
 * 当距离底部小于该阈值时，认为用户处于底部，激活流式自动吸底。
 */
export const AUTO_SCROLL_THRESHOLD = 60;
