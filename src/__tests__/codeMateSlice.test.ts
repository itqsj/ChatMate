import codeMateReducer, {
  createChat,
  selectChat,
  setWorkspaces,
} from '@renderer/store/codeMateSlice';

const now = '2026-07-20T00:00:00.000Z';

describe('codeMateSlice', () => {
  it('should create initial CodeMate state', () => {
    const state = codeMateReducer(undefined, { type: 'unknown' });

    expect(state.workspaces).toEqual([]);
    expect(state.chats).toEqual([]);
    expect(state.messages).toEqual([]);
    expect(state.selectedChatId).toBe('');
  });

  it('should create and select chat', () => {
    const state = codeMateReducer(
      undefined,
      createChat({
        createdAt: now,
        id: 'chat-1',
        time: '刚刚',
        title: 'Bug 修复',
        updatedAt: now,
      }),
    );

    expect(state.chats[0].title).toBe('Bug 修复');
    expect(state.selectedChatId).toBe('chat-1');
  });

  it('should select chat', () => {
    const state = codeMateReducer(undefined, selectChat('chat-2'));

    expect(state.selectedChatId).toBe('chat-2');
  });

  it('should set workspaces from local SQLite data', () => {
    const state = codeMateReducer(
      undefined,
      setWorkspaces([
        {
          createdAt: now,
          id: 'workspace-1',
          name: 'demo-app',
          path: 'C:\\Work\\demo-app',
          updatedAt: now,
        },
      ]),
    );

    expect(state.workspaces[0].name).toBe('demo-app');
  });
});
