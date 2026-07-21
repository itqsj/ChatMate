import path from 'path';
import { app } from 'electron';
import Database from 'better-sqlite3';
import { LOCAL_DATABASE_FILE_NAME } from '@/constants/ipc';
import type {
  CreateChatParams,
  CreateMessageParams,
  CreateWorkspaceParams,
  LocalChat,
  LocalMessage,
  LocalWorkspace,
} from '@/types/chatDB';

const DEFAULT_CHAT_TITLE = '新任务';
const DEFAULT_WORKSPACE_NAME = 'Workspace';

let db: Database.Database | null = null;

/**
 * 生成本地 SQLite 主键，避免依赖后端 ID 生成逻辑。
 */
const createLocalId = (prefix: string) => {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

/**
 * 返回当前时间字符串，字段格式和后端 JSON 时间字段保持一致。
 */
const getNow = () => new Date().toISOString();

/**
 * 根据文件夹路径生成工作区名称。
 */
const getWorkspaceNameFromPath = (folderPath: string) => {
  const segments = folderPath.split(/[\\/]/).filter(Boolean);
  return segments[segments.length - 1] || DEFAULT_WORKSPACE_NAME;
};

/**
 * 把 SQLite 读取到的聊天行转换为前端需要的字段。
 */
const normalizeChat = (chat: LocalChat): LocalChat => {
  return {
    ...chat,
    workspaceId: chat.workspaceId || undefined,
  };
};

/**
 * 初始化工作区、聊天窗口、消息三张本地表。
 */
const initTables = (database: Database.Database) => {
  database.exec(`
    CREATE TABLE IF NOT EXISTS workspaces (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      path TEXT NOT NULL UNIQUE,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY,
      workspaceId TEXT,
      title TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (workspaceId) REFERENCES workspaces(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      chatId TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (chatId) REFERENCES chats(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_chats_workspaceId_updatedAt
      ON chats (workspaceId, updatedAt);

    CREATE INDEX IF NOT EXISTS idx_messages_chatId_createdAt
      ON messages (chatId, createdAt);
  `);
};

/**
 * 获取并初始化本地 SQLite 连接。
 */
const getDb = () => {
  if (db) {
    return db;
  }

  const dbPath = path.join(app.getPath('userData'), LOCAL_DATABASE_FILE_NAME);
  db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  initTables(db);

  return db;
};

/**
 * 查询全部本地工作区。
 */
export const listWorkspaces = (): LocalWorkspace[] => {
  return getDb()
    .prepare(
      'SELECT id, name, path, createdAt, updatedAt FROM workspaces ORDER BY updatedAt DESC',
    )
    .all() as LocalWorkspace[];
};

/**
 * 新增工作区；如果路径已存在，直接返回已有工作区。
 */
export const createWorkspace = ({
  name,
  path: folderPath,
}: CreateWorkspaceParams): LocalWorkspace => {
  const workspacePath = folderPath.trim();
  const workspaceName =
    (name || '').trim() || getWorkspaceNameFromPath(workspacePath);
  const database = getDb();
  const existingWorkspace = database
    .prepare(
      'SELECT id, name, path, createdAt, updatedAt FROM workspaces WHERE path = ?',
    )
    .get(workspacePath) as LocalWorkspace | undefined;

  if (existingWorkspace) {
    return existingWorkspace;
  }

  const now = getNow();
  const workspace: LocalWorkspace = {
    createdAt: now,
    id: createLocalId('workspace'),
    name: workspaceName,
    path: workspacePath,
    updatedAt: now,
  };

  database
    .prepare(
      'INSERT INTO workspaces (id, name, path, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
    )
    .run(
      workspace.id,
      workspace.name,
      workspace.path,
      workspace.createdAt,
      workspace.updatedAt,
    );

  return workspace;
};

/**
 * 删除指定工作区，SQLite 会级联删除它下面的任务和消息。
 */
export const deleteWorkspace = (workspaceId: string): string => {
  getDb().prepare('DELETE FROM workspaces WHERE id = ?').run(workspaceId);

  return workspaceId;
};

/**
 * 查询全部本地聊天窗口。
 */
export const listChats = (): LocalChat[] => {
  const chats = getDb()
    .prepare(
      'SELECT id, workspaceId, title, createdAt, updatedAt FROM chats ORDER BY updatedAt DESC',
    )
    .all() as LocalChat[];

  return chats.map(normalizeChat);
};

/**
 * 新增聊天窗口；如果 ID 已存在，直接返回已有聊天。
 */
export const createChat = ({
  id,
  title,
  workspaceId,
}: CreateChatParams): LocalChat => {
  const chatId = id || createLocalId('chat');
  const database = getDb();
  const existingChat = database
    .prepare(
      'SELECT id, workspaceId, title, createdAt, updatedAt FROM chats WHERE id = ?',
    )
    .get(chatId) as LocalChat | undefined;

  if (existingChat) {
    return normalizeChat(existingChat);
  }

  const now = getNow();
  const chat: LocalChat = {
    createdAt: now,
    id: chatId,
    title: (title || '').trim() || DEFAULT_CHAT_TITLE,
    updatedAt: now,
    workspaceId: workspaceId || undefined,
  };

  database
    .prepare(
      'INSERT INTO chats (id, workspaceId, title, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
    )
    .run(
      chat.id,
      chat.workspaceId || null,
      chat.title,
      chat.createdAt,
      chat.updatedAt,
    );

  return chat;
};

/**
 * 删除指定聊天窗口，SQLite 会级联删除它下面的消息。
 */
export const deleteChat = (chatId: string): string => {
  getDb().prepare('DELETE FROM chats WHERE id = ?').run(chatId);

  return chatId;
};

/**
 * 查询指定聊天窗口下的消息列表。
 */
export const listMessages = (chatId: string): LocalMessage[] => {
  return getDb()
    .prepare(
      'SELECT id, chatId, role, content, createdAt, updatedAt FROM messages WHERE chatId = ? ORDER BY createdAt ASC',
    )
    .all(chatId) as LocalMessage[];
};

/**
 * 新增一条聊天消息，并同步更新聊天窗口的更新时间。
 */
export const createMessage = ({
  chatId,
  content,
  id,
  role,
}: CreateMessageParams): LocalMessage => {
  const now = getNow();
  const message: LocalMessage = {
    chatId,
    content,
    createdAt: now,
    id: id || createLocalId('message'),
    role,
    updatedAt: now,
  };
  const database = getDb();

  const transaction = database.transaction(() => {
    database
      .prepare(
        'INSERT INTO messages (id, chatId, role, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      )
      .run(
        message.id,
        message.chatId,
        message.role,
        message.content,
        message.createdAt,
        message.updatedAt,
      );

    // 聊天窗口更新时间用于左侧栏排序。
    database
      .prepare('UPDATE chats SET updatedAt = ? WHERE id = ?')
      .run(now, message.chatId);
  });

  transaction();

  return message;
};
