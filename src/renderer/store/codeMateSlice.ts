import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  CodeMateChat,
  CodeMateMessage,
  CodeMateWorkspace,
} from '@renderer/types/codeMate';

export type CodeMateState = {
  chats: CodeMateChat[];
  folderMessage: string;
  messages: CodeMateMessage[];
  selectedChatId: string;
  workspaces: CodeMateWorkspace[];
};

const initialState: CodeMateState = {
  // 左侧栏展示的聊天记录列表。
  chats: [],
  // 文件夹选择器操作反馈，空字符串表示不展示提示。
  folderMessage: '',
  // 主聊天区域展示的消息流。
  messages: [],
  // 当前选中的聊天 ID，默认选中第一条聊天。
  selectedChatId: '',
  // 左侧栏展示的工作区列表。
  workspaces: [],
};

/**
 * 根据文件夹路径最后一段生成工作区名称。
 */
const getFolderAlias = (folderPath: string) => {
  const segments = folderPath.split(/[\\/]/).filter(Boolean);
  return segments[segments.length - 1] || 'Workspace';
};

/**
 * 把真实文件夹路径转换成工作区状态数据。
 */
const createWorkspaceFromPath = (folderPath: string): CodeMateWorkspace => {
  return {
    id: `local-${folderPath}`,
    name: getFolderAlias(folderPath),
    path: folderPath,
  };
};

const codeMateSlice = createSlice({
  name: 'codeMate',
  initialState,
  reducers: {
    /**
     * 追加一条用户或 AI 聊天消息。
     */
    appendChatMessage(state, action: PayloadAction<CodeMateMessage>) {
      state.messages.push(action.payload);
    },
    /**
     * 追加 AI 流式返回的文本片段。
     */
    appendChatMessageChunk(
      state,
      action: PayloadAction<{ chunk: string; id: string }>,
    ) {
      const message = state.messages.find(
        (item) => item.id === action.payload.id,
      );

      if (message) {
        message.content += action.payload.chunk;
      }
    },
    /**
     * 创建一条真实聊天记录，并清空当前聊天窗口。
     */
    createChat(state, action: PayloadAction<CodeMateChat>) {
      const existingChat = state.chats.find(
        (chat) => chat.id === action.payload.id,
      );

      if (!existingChat) {
        state.chats.unshift(action.payload);
      }

      state.selectedChatId = action.payload.id;
      state.messages = [];
    },
    /**
     * 根据选择的文件夹新增工作区。
     */
    addWorkspaceFromPath(state, action: PayloadAction<string>) {
      const folderPath = action.payload;
      const existingWorkspace = state.workspaces.find(
        (workspace) => workspace.path === folderPath,
      );
      const nextWorkspace =
        existingWorkspace || createWorkspaceFromPath(folderPath);

      if (!existingWorkspace) {
        state.workspaces.push(nextWorkspace);
      }

      state.folderMessage = `已打开文件夹: ${folderPath}`;
    },
    /**
     * 切换当前聊天 ID。
     */
    selectChat(state, action: PayloadAction<string>) {
      state.selectedChatId = action.payload;
      state.messages = [];
    },
    /**
     * 覆盖指定消息内容。
     */
    setChatMessageContent(
      state,
      action: PayloadAction<{ content: string; id: string }>,
    ) {
      const message = state.messages.find(
        (item) => item.id === action.payload.id,
      );

      if (message) {
        message.content = action.payload.content;
      }
    },
    /**
     * 写入文件夹选择器反馈文案。
     */
    setFolderMessage(state, action: PayloadAction<string>) {
      state.folderMessage = action.payload;
    },
  },
});

type CodeMateRootState = {
  codeMate: CodeMateState;
};

export const {
  appendChatMessage,
  appendChatMessageChunk,
  addWorkspaceFromPath,
  createChat,
  selectChat,
  setChatMessageContent,
  setFolderMessage,
} = codeMateSlice.actions;

/**
 * 获取左侧工作区列表。
 */
export const selectCodeMateWorkspaces = (state: CodeMateRootState) =>
  state.codeMate.workspaces;

/**
 * 获取左侧聊天列表。
 */
export const selectCodeMateChats = (state: CodeMateRootState) =>
  state.codeMate.chats;

/**
 * 获取当前聊天消息列表。
 */
export const selectCodeMateMessages = (state: CodeMateRootState) =>
  state.codeMate.messages;

/**
 * 获取文件夹选择器反馈文案。
 */
export const selectCodeMateFolderMessage = (state: CodeMateRootState) =>
  state.codeMate.folderMessage;

/**
 * 获取当前选中的聊天 ID。
 */
export const selectCodeMateSelectedChatId = (state: CodeMateRootState) =>
  state.codeMate.selectedChatId;

/**
 * 获取当前选中的聊天。
 */
export const selectCodeMateSelectedChat = (state: CodeMateRootState) => {
  return (
    state.codeMate.chats.find(
      (chat) => chat.id === state.codeMate.selectedChatId,
    ) || null
  );
};

export default codeMateSlice.reducer;
