import { apiClient } from '../utils/ApiClient';
import { IProject, IProjectDto } from '../models/IProject';

export const projectService = {
  getAll: (): Promise<IProject[]> => apiClient.get<IProject[]>('projects'),
  getById: (id: number): Promise<IProject> => apiClient.get<IProject>(`projects/${id}`),
  create: (dto: IProjectDto): Promise<IProject> => apiClient.post<IProject>('projects', dto),
  update: (id: number, dto: IProjectDto): Promise<IProject> => apiClient.put<IProject>(`projects/${id}`, dto),
  remove: (id: number): Promise<void> => apiClient.delete<void>(`projects/${id}`)
};
