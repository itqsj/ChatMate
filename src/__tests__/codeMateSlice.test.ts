import codeMateReducer, {
  addWorkspaceFromPath,
  selectChat,
} from '@renderer/store/codeMateSlice';

describe('codeMateSlice', () => {
  it('should create initial CodeMate state', () => {
    const state = codeMateReducer(undefined, { type: 'unknown' });

    expect(state.workspaces[0].name).toBe('My-Project');
    expect(state.selectedChatId).toBe('chat-1');
    expect(state.chats.some((chat) => chat.title === 'Bug 修复')).toBe(false);
  });

  it('should select chat', () => {
    const state = codeMateReducer(undefined, selectChat('chat-2'));

    expect(state.selectedChatId).toBe('chat-2');
  });

  it('should add selected folder as workspace', () => {
    const state = codeMateReducer(
      undefined,
      addWorkspaceFromPath('C:\\Work\\demo-app'),
    );

    expect(state.folderMessage).toBe('已打开文件夹: C:\\Work\\demo-app');
    expect(
      state.workspaces.some((workspace) => workspace.name === 'demo-app'),
    ).toBe(true);
  });
});
