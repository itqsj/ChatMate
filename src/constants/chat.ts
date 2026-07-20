export const CHAT_API_BASE_URL = 'http://localhost:8888';

export const CHAT_STREAM_API_URL = `${CHAT_API_BASE_URL}/api/chat/stream`;

export const CHAT_STREAM_EVENT = {
  DONE: 'done',
  ERROR: 'error',
  MESSAGE: 'message',
} as const;
