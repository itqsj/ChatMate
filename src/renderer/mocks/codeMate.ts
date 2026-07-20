import type {
  CodeMateChat,
  CodeMateMessage,
  CodeMateWorkspace,
} from '@renderer/types/codeMate';

export const CODEMATE_WORKSPACES: CodeMateWorkspace[] = [
  {
    id: 'my-project',
    name: 'My-Project',
    path: '/Users/name/projects/my-project',
  },
  {
    id: 'electron-lab',
    name: 'Electron-Lab',
    path: 'E:/codeApp/electron-react-boilerplate',
  },
  {
    id: 'api-service',
    name: 'API-Service',
    path: '/Users/name/work/api-service',
  },
  {
    id: 'design-kit',
    name: 'Design-Kit',
    path: '/Users/name/projects/design-kit',
  },
];

export const CODEMATE_CHATS: CodeMateChat[] = [
  { id: 'chat-1', title: '解释这个函数逻辑', time: '2 小时前' },
  { id: 'chat-2', title: '重构登录状态流转', time: '昨天' },
  { id: 'chat-3', title: '生成单元测试用例', time: '周二' },
  { id: 'chat-4', title: '梳理 renderer 目录', time: '周一' },
  { id: 'chat-5', title: '优化列表滚动性能', time: '6月28日' },
];

export const CODEMATE_MESSAGES: CodeMateMessage[] = [
  {
    id: 'm1',
    role: 'user',
    content: '帮我解释一下这个函数为什么要先判断缓存。',
  },
  {
    id: 'm2',
    role: 'assistant',
    content:
      '这里先判断缓存是为了避免重复计算。命中缓存时直接返回，未命中时再走完整解析逻辑。',
    code: `function getResult(key) {
  if (cache.has(key)) {
    return cache.get(key);
  }

  const result = parseSource(key);
  cache.set(key, result);
  return result;
}`,
  },
  {
    id: 'm3',
    role: 'user',
    content: '如果 parseSource 抛错，缓存会不会写入脏数据？',
  },
  {
    id: 'm4',
    role: 'assistant',
    content:
      '不会。当前代码是在 parseSource 成功返回之后才写缓存，异常会直接跳出函数，不会执行 cache.set。',
  },
  {
    id: 'm5',
    role: 'user',
    content: '那我想加一个错误提示，应该放在哪里？',
  },
  {
    id: 'm6',
    role: 'assistant',
    content:
      '建议放在调用层处理。这个函数保持纯计算和缓存职责，UI 层或命令执行层负责把错误转换成用户能理解的提示。',
  },
];
