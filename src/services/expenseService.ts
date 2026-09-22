import { apiClient } from '../utils/ApiClient';
import {
  IExpenseClaim,
  IExpenseClaimCreateDto,
  IExpenseClaimUpdateDto,
  ISubmitResponse
} from '../models/IExpenseClaim';
import { IPagedResult } from '../models/IPagedResult';

export interface IExpenseListFilter {
  employeeId?: number;
  status?: string;
  departmentId?: number;
}

function toQueryString(filter: IExpenseListFilter, page?: number, pageSize?: number): string {
  const parts: string[] = [];
  if (filter.employeeId !== undefined) {
    parts.push(`employeeId=${encodeURIComponent(String(filter.employeeId))}`);
  }
  if (filter.status !== undefined) {
    parts.push(`status=${encodeURIComponent(filter.status)}`);
  }
  if (filter.departmentId !== undefined) {
    parts.push(`departmentId=${encodeURIComponent(String(filter.departmentId))}`);
  }
  if (page !== undefined) {
    parts.push(`page=${page}`);
  }
  if (pageSize !== undefined) {
    parts.push(`pageSize=${pageSize}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

export const expenseService = {
  listPage: (filter: IExpenseListFilter, page: number, pageSize: number): Promise<IPagedResult<IExpenseClaim>> =>
    apiClient.get<IPagedResult<IExpenseClaim>>(`expenses${toQueryString(filter, page, pageSize)}`),
  getById: (id: number): Promise<IExpenseClaim> => apiClient.get<IExpenseClaim>(`expenses/${id}`),
  create: (dto: IExpenseClaimCreateDto): Promise<IExpenseClaim> => apiClient.post<IExpenseClaim>('expenses', dto),
  update: (id: number, dto: IExpenseClaimUpdateDto): Promise<IExpenseClaim> =>
    apiClient.put<IExpenseClaim>(`expenses/${id}`, dto),
  remove: (id: number, updatedBy: number): Promise<void> =>
    apiClient.delete<void>(`expenses/${id}`, { updatedBy }),
  submit: (id: number, userId: number): Promise<ISubmitResponse> =>
    apiClient.post<ISubmitResponse>(`expenses/${id}/submit`, { userId })
};
