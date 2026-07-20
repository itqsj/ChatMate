import { http } from './request';

export type CreateWorkspaceRequest = {
  name: string;
  path: string;
};

export const createWorkspace = (data: CreateWorkspaceRequest) => {
  return http<any>({
    url: '/api/workspace',
    method: 'post',
    data,
  });
};
