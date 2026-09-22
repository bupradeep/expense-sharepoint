import { apiClient } from '../utils/ApiClient';
import { IExpenseCategory, IExpenseCategoryDto } from '../models/IExpenseCategory';
import { IPagedResult } from '../models/IPagedResult';

export const expenseCategoryService = {
  getAll: (): Promise<IExpenseCategory[]> => apiClient.get<IExpenseCategory[]>('expense-categories'),
  getPage: (page: number, pageSize: number): Promise<IPagedResult<IExpenseCategory>> =>
    apiClient.get<IPagedResult<IExpenseCategory>>(`expense-categories?page=${page}&pageSize=${pageSize}`),
  getById: (id: number): Promise<IExpenseCategory> => apiClient.get<IExpenseCategory>(`expense-categories/${id}`),
  create: (dto: IExpenseCategoryDto): Promise<IExpenseCategory> =>
    apiClient.post<IExpenseCategory>('expense-categories', dto),
  update: (id: number, dto: IExpenseCategoryDto): Promise<IExpenseCategory> =>
    apiClient.put<IExpenseCategory>(`expense-categories/${id}`, dto),
  remove: (id: number): Promise<void> => apiClient.delete<void>(`expense-categories/${id}`)
};
