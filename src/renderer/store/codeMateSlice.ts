import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  CODEMATE_CHATS,
  CODEMATE_MESSAGES,
  CODEMATE_WORKSPACES,
} from '@renderer/mocks/codeMate';
import type {
  CodeMateChat,
  CodeMateMessage,
  CodeMateWorkspace,
} from '@renderer/types/codeMate';

export type CodeMateState = {
  activeWorkspaceId: string;
  chats: CodeMateChat[];
  folderMessage: string;
  messages: CodeMateMessage[];
  selectedChatId: string;
  workspaces: CodeMateWorkspace[];
};

const initialState: CodeMateState = {
  // 当前绑定的工作区 ID，默认使用第一条 mock 工作区。
  activeWorkspaceId: CODEMATE_WORKSPACES[0].id,
  // 左侧栏展示的聊天记录列表。
  chats: CODEMATE_CHATS,
  // 文件夹选择器操作反馈，空字符串表示不展示提示。
  folderMessage: '',
  // 主聊天区域展示的消息流。
  messages: CODEMATE_MESSAGES,
  // 当前选中的聊天 ID，默认选中第一条聊天。
  selectedChatId: CODEMATE_CHATS[0].id,
  // 左侧栏展示的工作区列表。
  workspaces: CODEMATE_WORKSPACES,
};

/**
 * 根据真实文件夹路径生成工作区名称，优先使用路径最后一级。
 */
const getFolderAlias = (folderPath: string) => {
  const segments = folderPath.split(/[\\/]/).filter(Boolean);
  return segments[segments.length - 1] || 'Workspace';
};

/**
 * 把真实文件夹路径转换成 Redux 中的工作区数据。
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
     * 根据 Electron 文件夹选择器返回的路径新增工作区，并切换为当前工作区。
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

      state.activeWorkspaceId = nextWorkspace.id;
      state.folderMessage = `已打开文件夹: ${folderPath}`;
    },
    /**
     * 新建聊天的模拟行为：当前没有真实创建逻辑，先回到第一条聊天。
     */
    resetToFirstChat(state) {
      state.selectedChatId = state.chats[0].id;
    },
    /**
     * 切换当前选中的聊天记录。
     */
    selectChat(state, action: PayloadAction<string>) {
      state.selectedChatId = action.payload;
    },
    /**
     * 切换当前绑定的工作区上下文。
     */
    selectWorkspace(state, action: PayloadAction<string>) {
      state.activeWorkspaceId = action.payload;
    },
    /**
     * 写入文件夹选择器相关提示，用于展示取消、成功或失败反馈。
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
  addWorkspaceFromPath,
  resetToFirstChat,
  selectChat,
  selectWorkspace,
  setFolderMessage,
} = codeMateSlice.actions;

/**
 * 获取左侧栏工作区列表。
 */
export const selectCodeMateWorkspaces = (state: CodeMateRootState) =>
  state.codeMate.workspaces;

/**
 * 获取左侧栏聊天列表。
 */
export const selectCodeMateChats = (state: CodeMateRootState) =>
  state.codeMate.chats;

/**
 * 获取主聊天区域消息流。
 */
export const selectCodeMateMessages = (state: CodeMateRootState) =>
  state.codeMate.messages;

/**
 * 获取文件夹选择器反馈提示。
 */
export const selectCodeMateFolderMessage = (state: CodeMateRootState) =>
  state.codeMate.folderMessage;

/**
 * 获取当前选中的聊天 ID。
 */
export const selectCodeMateSelectedChatId = (state: CodeMateRootState) =>
  state.codeMate.selectedChatId;

/**
 * 获取当前激活的工作区 ID。
 */
export const selectCodeMateActiveWorkspaceId = (state: CodeMateRootState) =>
  state.codeMate.activeWorkspaceId;

/**
 * 获取当前激活的工作区，异常情况下回退到第一个工作区。
 */
export const selectCodeMateActiveWorkspace = (state: CodeMateRootState) => {
  return (
    state.codeMate.workspaces.find(
      (workspace) => workspace.id === state.codeMate.activeWorkspaceId,
    ) || state.codeMate.workspaces[0]
  );
};

/**
 * 获取当前选中的聊天，异常情况下回退到第一条聊天。
 */
export const selectCodeMateSelectedChat = (state: CodeMateRootState) => {
  return (
    state.codeMate.chats.find(
      (chat) => chat.id === state.codeMate.selectedChatId,
    ) || state.codeMate.chats[0]
  );
};

export default codeMateSlice.reducer;
