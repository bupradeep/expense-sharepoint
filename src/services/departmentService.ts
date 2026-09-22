import { apiClient } from '../utils/ApiClient';
import { IDepartment, IDepartmentDto } from '../models/IDepartment';
import { IPagedResult } from '../models/IPagedResult';

export const departmentService = {
  getAll: (): Promise<IDepartment[]> => apiClient.get<IDepartment[]>('departments'),
  getPage: (page: number, pageSize: number): Promise<IPagedResult<IDepartment>> =>
    apiClient.get<IPagedResult<IDepartment>>(`departments?page=${page}&pageSize=${pageSize}`),
  getById: (id: number): Promise<IDepartment> => apiClient.get<IDepartment>(`departments/${id}`),
  create: (dto: IDepartmentDto): Promise<IDepartment> => apiClient.post<IDepartment>('departments', dto),
  update: (id: number, dto: IDepartmentDto): Promise<IDepartment> => apiClient.put<IDepartment>(`departments/${id}`, dto),
  remove: (id: number): Promise<void> => apiClient.delete<void>(`departments/${id}`)
};
