import { ipcMain } from 'electron';
import log from 'electron-log';
import { IPC_CHANNELS } from '@/constants/ipc';
import {
  createChat,
  createMessage,
  createWorkspace,
  deleteChat,
  deleteWorkspace,
  listChats,
  listMessages,
  listWorkspaces,
} from '@/main/db/chatDB';

/**
 * 注册本地 SQLite 数据操作事件，renderer 通过 preload 暴露的方法调用。
 */
const registerChatDBEvents = () => {
  ipcMain.handle(IPC_CHANNELS.LIST_WORKSPACES, () => {
    try {
      return listWorkspaces();
    } catch (error) {
      log.error('Failed to list local workspaces', error);
      throw error;
    }
  });

  ipcMain.handle(IPC_CHANNELS.CREATE_WORKSPACE, (_event, payload) => {
    try {
      return createWorkspace(payload);
    } catch (error) {
      log.error('Failed to create local workspace', error);
      throw error;
    }
  });

  ipcMain.handle(
    IPC_CHANNELS.DELETE_WORKSPACE,
    (_event, workspaceId: string) => {
      try {
        return deleteWorkspace(workspaceId);
      } catch (error) {
        log.error('Failed to delete local workspace', error);
        throw error;
      }
    },
  );

  ipcMain.handle(IPC_CHANNELS.LIST_CHATS, () => {
    try {
      return listChats();
    } catch (error) {
      log.error('Failed to list local chats', error);
      throw error;
    }
  });

  ipcMain.handle(IPC_CHANNELS.CREATE_CHAT, (_event, payload) => {
    try {
      return createChat(payload);
    } catch (error) {
      log.error('Failed to create local chat', error);
      throw error;
    }
  });

  ipcMain.handle(IPC_CHANNELS.DELETE_CHAT, (_event, chatId: string) => {
    try {
      return deleteChat(chatId);
    } catch (error) {
      log.error('Failed to delete local chat', error);
      throw error;
    }
  });

  ipcMain.handle(IPC_CHANNELS.LIST_MESSAGES, (_event, chatId: string) => {
    try {
      return listMessages(chatId);
    } catch (error) {
      log.error('Failed to list local messages', error);
      throw error;
    }
  });

  ipcMain.handle(IPC_CHANNELS.CREATE_MESSAGE, (_event, payload) => {
    try {
      return createMessage(payload);
    } catch (error) {
      log.error('Failed to create local message', error);
      throw error;
    }
  });
};

export default registerChatDBEvents;
