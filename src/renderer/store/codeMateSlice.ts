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
  // 左侧栏展示的聊天窗口列表，真实数据来自本地 SQLite。
  chats: [],
  // 文件夹选择器操作反馈，空字符串表示不展示提示。
  folderMessage: '',
  // 主聊天区域展示的消息列表，切换聊天时从本地 SQLite 回填。
  messages: [],
  // 当前选中的聊天 ID，空字符串表示还没有选中聊天。
  selectedChatId: '',
  // 左侧栏展示的工作区列表，真实数据来自本地 SQLite。
  workspaces: [],
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
     * 创建聊天并选中，用于兼容现有测试和简单页面操作。
     */
    createChat(state, action: PayloadAction<CodeMateChat>) {
      const existingChat = state.chats.find(
        (chat) => chat.id === action.payload.id,
      );

      if (existingChat) {
        Object.assign(existingChat, action.payload);
      } else {
        state.chats.unshift(action.payload);
      }

      state.selectedChatId = action.payload.id;
      state.messages = [];
    },
    /**
     * 切换当前聊天 ID。
     */
    selectChat(state, action: PayloadAction<string>) {
      state.selectedChatId = action.payload;
      state.messages = [];
    },
    /**
     * 覆盖左侧栏聊天窗口列表，通常用于从 SQLite 初始化或刷新排序。
     */
    setChats(state, action: PayloadAction<CodeMateChat[]>) {
      state.chats = action.payload;
    },
    /**
     * 覆盖指定消息内容。
     */
    setChatMessageContent(
      state,
      action: PayloadAction<{
        content: string;
        id: string;
        updatedAt?: string;
      }>,
    ) {
      const message = state.messages.find(
        (item) => item.id === action.payload.id,
      );

      if (message) {
        message.content = action.payload.content;
        if (action.payload.updatedAt) {
          message.updatedAt = action.payload.updatedAt;
        }
      }
    },
    /**
     * 写入文件夹选择器反馈文案。
     */
    setFolderMessage(state, action: PayloadAction<string>) {
      state.folderMessage = action.payload;
    },
    /**
     * 覆盖当前聊天窗口的消息列表。
     */
    setMessages(state, action: PayloadAction<CodeMateMessage[]>) {
      state.messages = action.payload;
    },
    /**
     * 覆盖工作区列表。
     */
    setWorkspaces(state, action: PayloadAction<CodeMateWorkspace[]>) {
      state.workspaces = action.payload;
    },
    /**
     * 新增或更新单条聊天窗口，并让它回到列表顶部。
     */
    upsertChat(state, action: PayloadAction<CodeMateChat>) {
      state.chats = state.chats.filter((chat) => chat.id !== action.payload.id);
      state.chats.unshift(action.payload);
    },
    /**
     * 新增或更新单个工作区。
     */
    upsertWorkspace(state, action: PayloadAction<CodeMateWorkspace>) {
      const existingWorkspace = state.workspaces.find(
        (workspace) => workspace.id === action.payload.id,
      );

      if (existingWorkspace) {
        Object.assign(existingWorkspace, action.payload);
        return;
      }

      state.workspaces.unshift(action.payload);
    },
  },
});

export type CodeMateRootState = {
  codeMate: CodeMateState;
};

export const {
  appendChatMessage,
  appendChatMessageChunk,
  createChat,
  selectChat,
  setChats,
  setChatMessageContent,
  setFolderMessage,
  setMessages,
  setWorkspaces,
  upsertChat,
  upsertWorkspace,
} = codeMateSlice.actions;

export default codeMateSlice.reducer;
