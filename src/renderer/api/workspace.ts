import type { CreateWorkspaceParams } from '@/types/chatDB';
import type { CodeMateWorkspace } from '@renderer/types/codeMate';

/**
 * 从本地 SQLite 查询工作区列表。
 */
export const listWorkspaces = async (): Promise<CodeMateWorkspace[]> => {
  try {
    return await window.electron.chatDB.listWorkspaces();
  } catch (error) {
    const message = error instanceof Error ? error.message : '查询工作区失败';
    throw new Error(message);
  }
};

/**
 * 写入本地 SQLite 工作区；路径已存在时返回已有记录。
 */
export const createWorkspace = async (
  data: CreateWorkspaceParams,
): Promise<CodeMateWorkspace> => {
  try {
    return await window.electron.chatDB.createWorkspace(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : '创建工作区失败';
    throw new Error(message);
  }
};

/**
 * 删除本地 SQLite 工作区；关联任务和消息由数据库级联删除。
 */
export const deleteWorkspace = async (workspaceId: string): Promise<string> => {
  try {
    return await window.electron.chatDB.deleteWorkspace(workspaceId);
  } catch (error) {
    const message = error instanceof Error ? error.message : '删除工作区失败';
    throw new Error(message);
  }
};
