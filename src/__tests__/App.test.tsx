import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { COLOR_MODE, COLOR_MODE_STORAGE_KEY } from '@/constants/theme';
import App from '@renderer/App';
import { createAppStore } from '@renderer/store';

describe('App', () => {
  const originalMatchMedia = window.matchMedia;
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
    openFolderMock.mockReset();
    openFolderMock.mockResolvedValue({ canceled: true, filePaths: [] });
    Object.defineProperty(window, 'electron', {
      configurable: true,
      writable: true,
      value: {
        closeWindow: jest.fn(),
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

  it('should render ChatMate desktop page at root path', () => {
    renderApp();

    expect(screen.getByText('File')).toBeInTheDocument();
    expect(screen.getByText('View')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
    expect(screen.getByText('工作区')).toBeInTheDocument();
    expect(screen.getByText('最近聊天')).toBeInTheDocument();
    expect(screen.queryByText('Bug 修复')).not.toBeInTheDocument();
    expect(screen.queryByText('独立聊天')).not.toBeInTheDocument();
  });

  it('should add selected folder from Electron folder picker', async () => {
    openFolderMock.mockResolvedValue({
      canceled: false,
      filePaths: ['C:\\Work\\demo-app'],
    });

    renderApp();

    fireEvent.click(screen.getByRole('button', { name: /打开文件夹/ }));

    expect(await screen.findAllByText('demo-app')).not.toHaveLength(0);
    expect(screen.getByText('C:\\Work\\demo-app')).toBeInTheDocument();
  });

  it('should keep page stable when Electron folder picker fails', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    openFolderMock.mockRejectedValue(new Error('dialog failed'));

    renderApp();

    fireEvent.click(screen.getByRole('button', { name: /打开文件夹/ }));

    expect(screen.getByText('工作区')).toBeInTheDocument();
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should open system settings drawer and change theme', () => {
    renderApp();

    fireEvent.click(screen.getByRole('button', { name: '打开系统设置' }));

    expect(screen.getByText('系统设置')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '切换到简约白' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '切换到商务黑' }));

    expect(localStorage.getItem(COLOR_MODE_STORAGE_KEY)).toBe(COLOR_MODE.DARK);
  });
});
