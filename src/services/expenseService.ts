import { apiClient } from '../utils/ApiClient';
import {
  IExpenseClaim,
  IExpenseClaimCreateDto,
  IExpenseClaimUpdateDto,
  ISubmitResponse
} from '../models/IExpenseClaim';

export interface IExpenseListFilter {
  employeeId?: number;
  status?: string;
  departmentId?: number;
}

function toQueryString(filter?: IExpenseListFilter): string {
  if (!filter) {
    return '';
  }
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
  return parts.length ? `?${parts.join('&')}` : '';
}

export const expenseService = {
  list: (filter?: IExpenseListFilter): Promise<IExpenseClaim[]> =>
    apiClient.get<IExpenseClaim[]>(`expenses${toQueryString(filter)}`),
  getById: (id: number): Promise<IExpenseClaim> => apiClient.get<IExpenseClaim>(`expenses/${id}`),
  create: (dto: IExpenseClaimCreateDto): Promise<IExpenseClaim> => apiClient.post<IExpenseClaim>('expenses', dto),
  update: (id: number, dto: IExpenseClaimUpdateDto): Promise<IExpenseClaim> =>
    apiClient.put<IExpenseClaim>(`expenses/${id}`, dto),
  remove: (id: number, updatedBy: number): Promise<void> =>
    apiClient.delete<void>(`expenses/${id}`, { updatedBy }),
  submit: (id: number, userId: number): Promise<ISubmitResponse> =>
    apiClient.post<ISubmitResponse>(`expenses/${id}/submit`, { userId })
};
