export type CodeMateWorkspace = {
  id: string;
  name: string;
  path: string;
};

export type CodeMateChat = {
  id: string;
  title: string;
  time: string;
  workspaceId?: string;
};

export type CodeMateMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  code?: string;
};
