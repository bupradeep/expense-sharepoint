import { apiClient } from '../utils/ApiClient';
import { IReimbursement, IPaymentDto, IReimbursementFilter } from '../models/IReimbursement';
import { IExpenseClaim } from '../models/IExpenseClaim';
import { IPagedResult } from '../models/IPagedResult';

function toQueryString(filter: IReimbursementFilter, page: number, pageSize: number): string {
  const parts: string[] = [`page=${page}`, `pageSize=${pageSize}`];
  if (filter.fromDate !== undefined) parts.push(`fromDate=${encodeURIComponent(filter.fromDate)}`);
  if (filter.toDate !== undefined) parts.push(`toDate=${encodeURIComponent(filter.toDate)}`);
  if (filter.claimNumber !== undefined) parts.push(`claimNumber=${encodeURIComponent(filter.claimNumber)}`);
  return `?${parts.join('&')}`;
}

export const reimbursementService = {
  listPage: (filter: IReimbursementFilter, page: number, pageSize: number): Promise<IPagedResult<IReimbursement>> =>
    apiClient.get<IPagedResult<IReimbursement>>(`reimbursements${toQueryString(filter, page, pageSize)}`),
  pay: (expenseClaimId: number, dto: IPaymentDto): Promise<IExpenseClaim> =>
    apiClient.post<IExpenseClaim>(`expenses/${expenseClaimId}/payment`, dto)
};
