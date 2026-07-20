// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
  | 'ipc-example'
  | 'dialog:open-folder'
  | 'window:close'
  | 'window:minimize'
  | 'window:open-external'
  | 'window:reload'
  | 'window:toggle-full-screen'
  | 'window:toggle-maximize';

export type OpenFolderResult = {
  canceled: boolean;
  filePaths: string[];
};

const electronHandler = {
  closeWindow(): void {
    ipcRenderer.send('window:close');
  },
  minimizeWindow(): void {
    ipcRenderer.send('window:minimize');
  },
  openFolder(): Promise<OpenFolderResult> {
    return ipcRenderer.invoke('dialog:open-folder');
  },
  openExternal(url: string): Promise<void> {
    return ipcRenderer.invoke('window:open-external', url);
  },
  reloadWindow(): void {
    ipcRenderer.send('window:reload');
  },
  toggleFullScreenWindow(): void {
    ipcRenderer.send('window:toggle-full-screen');
  },
  toggleMaximizeWindow(): void {
    ipcRenderer.send('window:toggle-maximize');
  },
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
};

// 暴露electron app层给到render
contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
