import { apiClient } from '../utils/ApiClient';
import { IProject, IProjectDto } from '../models/IProject';
import { IPagedResult } from '../models/IPagedResult';

export const projectService = {
  getAll: (): Promise<IProject[]> => apiClient.get<IProject[]>('projects'),
  getPage: (page: number, pageSize: number): Promise<IPagedResult<IProject>> =>
    apiClient.get<IPagedResult<IProject>>(`projects?page=${page}&pageSize=${pageSize}`),
  getById: (id: number): Promise<IProject> => apiClient.get<IProject>(`projects/${id}`),
  create: (dto: IProjectDto): Promise<IProject> => apiClient.post<IProject>('projects', dto),
  update: (id: number, dto: IProjectDto): Promise<IProject> => apiClient.put<IProject>(`projects/${id}`, dto),
  remove: (id: number): Promise<void> => apiClient.delete<void>(`projects/${id}`)
};
