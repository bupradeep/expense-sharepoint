import { apiClient } from '../utils/ApiClient';
import { IUser, IUserDto } from '../models/IUser';

export const userService = {
  getAll: (): Promise<IUser[]> => apiClient.get<IUser[]>('users'),
  getById: (id: number): Promise<IUser> => apiClient.get<IUser>(`users/${id}`),
  getByEmployeeObjectId: (employeeObjectId: string): Promise<IUser> =>
    apiClient.get<IUser>(`users/by-employee-object-id/${employeeObjectId}`),
  create: (dto: IUserDto): Promise<IUser> => apiClient.post<IUser>('users', dto),
  update: (id: number, dto: IUserDto): Promise<IUser> => apiClient.put<IUser>(`users/${id}`, dto),
  remove: (id: number): Promise<void> => apiClient.delete<void>(`users/${id}`)
};
