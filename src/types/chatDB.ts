export type LocalWorkspace = {
  createdAt: string;
  id: string;
  name: string;
  path: string;
  updatedAt: string;
};

export type LocalChat = {
  createdAt: string;
  id: string;
  title: string;
  updatedAt: string;
  workspaceId?: string;
};

export type LocalMessage = {
  chatId: string;
  content: string;
  createdAt: string;
  id: string;
  role: 'user' | 'assistant';
  updatedAt: string;
};

export type CreateWorkspaceParams = {
  name?: string;
  path: string;
};

export type CreateChatParams = {
  id?: string;
  title?: string;
  workspaceId?: string;
};

export type CreateMessageParams = {
  chatId: string;
  content: string;
  id?: string;
  role: LocalMessage['role'];
};
