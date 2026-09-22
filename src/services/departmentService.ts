import { apiClient } from '../utils/ApiClient';
import { IDepartment, IDepartmentDto } from '../models/IDepartment';

export const departmentService = {
  getAll: (): Promise<IDepartment[]> => apiClient.get<IDepartment[]>('departments'),
  getById: (id: number): Promise<IDepartment> => apiClient.get<IDepartment>(`departments/${id}`),
  create: (dto: IDepartmentDto): Promise<IDepartment> => apiClient.post<IDepartment>('departments', dto),
  update: (id: number, dto: IDepartmentDto): Promise<IDepartment> => apiClient.put<IDepartment>(`departments/${id}`, dto),
  remove: (id: number): Promise<void> => apiClient.delete<void>(`departments/${id}`)
};
