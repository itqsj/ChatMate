import { CodeMateRootState } from './codeMateSlice';
import type { ThemeState } from './themeSlice';

export type RootState = {
  theme: ThemeState;
  codeMate: CodeMateRootState['codeMate'];
};

/**
 * 获取全局主题模式。
 */
export const selectThemeMode = (state: RootState) => state.theme.mode;

/**
 * 获取左侧工作区列表。
 */
export const selectCodeMateWorkspaces = (state: RootState) =>
  state.codeMate.workspaces;

/**
 * 获取左侧聊天列表。
 */
export const selectCodeMateChats = (state: RootState) => state.codeMate.chats;

/**
 * 获取当前聊天消息列表。
 */
export const selectCodeMateMessages = (state: RootState) =>
  state.codeMate.messages;

/**
 * 获取文件夹选择器反馈文案。
 */
export const selectCodeMateFolderMessage = (state: RootState) =>
  state.codeMate.folderMessage;

/**
 * 获取当前选中的聊天 ID。
 */
export const selectCodeMateSelectedChatId = (state: RootState) =>
  state.codeMate.selectedChatId;

/**
 * 获取当前选中的聊天。
 */
export const selectCodeMateSelectedChat = (state: RootState) => {
  return (
    state.codeMate.chats.find(
      (chat) => chat.id === state.codeMate.selectedChatId,
    ) || null
  );
};
