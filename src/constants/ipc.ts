export const IPC_CHANNELS = {
  CREATE_CHAT: 'local-data:create-chat',
  CREATE_MESSAGE: 'local-data:create-message',
  CREATE_WORKSPACE: 'local-data:create-workspace',
  LIST_CHATS: 'local-data:list-chats',
  LIST_MESSAGES: 'local-data:list-messages',
  LIST_WORKSPACES: 'local-data:list-workspaces',
} as const;

export const LOCAL_DATABASE_FILE_NAME = 'chatmate.db';
