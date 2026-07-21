export type CodeMateWorkspace = {
  createdAt: string;
  id: string;
  name: string;
  path: string;
  updatedAt: string;
};

export type CodeMateChat = {
  createdAt: string;
  id: string;
  time: string;
  title: string;
  updatedAt: string;
  workspaceId?: string;
};

export type CodeMateMessage = {
  chatId: string;
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  updatedAt: string;
  code?: string;
};
