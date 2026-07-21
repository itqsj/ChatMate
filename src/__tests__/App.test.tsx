import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { COLOR_MODE, COLOR_MODE_STORAGE_KEY } from '@/constants/theme';
import App from '@renderer/App';
import { createAppStore } from '@renderer/store';

const now = '2026-07-20T00:00:00.000Z';

describe('App', () => {
  const originalMatchMedia = window.matchMedia;
  const createWorkspaceMock = jest.fn();
  const listChatsMock = jest.fn();
  const listMessagesMock = jest.fn();
  const listWorkspacesMock = jest.fn();
  const openFolderMock = jest.fn();

  const renderApp = () => {
    return render(
      <Provider store={createAppStore()}>
        <App />
      </Provider>,
    );
  };

  beforeEach(() => {
    localStorage.clear();
    createWorkspaceMock.mockReset();
    listChatsMock.mockReset();
    listMessagesMock.mockReset();
    listWorkspacesMock.mockReset();
    openFolderMock.mockReset();

    createWorkspaceMock.mockImplementation((data) =>
      Promise.resolve({
        createdAt: now,
        id: 'workspace-1',
        name: data.name,
        path: data.path,
        updatedAt: now,
      }),
    );
    listChatsMock.mockResolvedValue([]);
    listMessagesMock.mockResolvedValue([]);
    listWorkspacesMock.mockResolvedValue([]);
    openFolderMock.mockResolvedValue({ canceled: true, filePaths: [] });

    Object.defineProperty(window, 'electron', {
      configurable: true,
      writable: true,
      value: {
        closeWindow: jest.fn(),
        chatDB: {
          createChat: jest.fn(),
          createMessage: jest.fn(),
          createWorkspace: createWorkspaceMock,
          listChats: listChatsMock,
          listMessages: listMessagesMock,
          listWorkspaces: listWorkspacesMock,
        },
        minimizeWindow: jest.fn(),
        openFolder: openFolderMock,
        openExternal: jest.fn(),
        reloadWindow: jest.fn(),
        toggleFullScreenWindow: jest.fn(),
        toggleMaximizeWindow: jest.fn(),
        ipcRenderer: {
          on: jest.fn(),
          once: jest.fn(),
          sendMessage: jest.fn(),
        },
      },
    });
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    });
  });

  it('should render ChatMate desktop page at root path', async () => {
    renderApp();

    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
    await waitFor(() => {
      expect(listWorkspacesMock).toHaveBeenCalled();
    });
    expect(screen.getByText('工作区')).toBeInTheDocument();
    expect(screen.getByText('任务')).toBeInTheDocument();
    expect(screen.getByText('暂无任务')).toBeInTheDocument();
  });

  it('should load local workspaces from SQLite API', async () => {
    listWorkspacesMock.mockResolvedValue([
      {
        createdAt: now,
        id: 'workspace-1',
        name: 'demo-app',
        path: 'C:\\Work\\demo-app',
        updatedAt: now,
      },
    ]);

    renderApp();

    expect(await screen.findByText('demo-app')).toBeInTheDocument();
  });

  it('should add selected folder from Electron folder picker', async () => {
    openFolderMock.mockResolvedValue({
      canceled: false,
      filePaths: ['C:\\Work\\demo-app'],
    });

    renderApp();

    fireEvent.click(screen.getByRole('button', { name: '打开文件夹' }));

    await waitFor(() => {
      expect(createWorkspaceMock).toHaveBeenCalledWith({
        name: 'demo-app',
        path: 'C:\\Work\\demo-app',
      });
    });
    expect(await screen.findByText('demo-app')).toBeInTheDocument();
  });

  it('should keep page stable when Electron folder picker fails', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    openFolderMock.mockRejectedValue(new Error('dialog failed'));

    renderApp();

    fireEvent.click(screen.getByRole('button', { name: '打开文件夹' }));

    expect(await screen.findByText('工作区')).toBeInTheDocument();
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should open system settings drawer and change theme', async () => {
    renderApp();

    await waitFor(() => {
      expect(listWorkspacesMock).toHaveBeenCalled();
    });

    fireEvent.click(screen.getByRole('button', { name: '打开系统设置' }));

    expect(screen.getByText('系统设置')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '切换到简约白' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '切换到商务黑' }));

    expect(localStorage.getItem(COLOR_MODE_STORAGE_KEY)).toBe(COLOR_MODE.DARK);
  });
});
