import { apiClient } from '../utils/ApiClient';
import { IPendingApproval, IApprovalActionDto, IApprovalActionResponse } from '../models/IApproval';
import { IApprovalHistoryEntry, IApprovalHistoryFilter } from '../models/IApprovalHistory';
import { IPagedResult } from '../models/IPagedResult';

function toHistoryQueryString(filter: IApprovalHistoryFilter, page: number, pageSize: number): string {
  const parts: string[] = [`page=${page}`, `pageSize=${pageSize}`];
  if (filter.fromDate !== undefined) parts.push(`fromDate=${encodeURIComponent(filter.fromDate)}`);
  if (filter.toDate !== undefined) parts.push(`toDate=${encodeURIComponent(filter.toDate)}`);
  if (filter.status !== undefined) parts.push(`status=${encodeURIComponent(filter.status)}`);
  if (filter.approverId !== undefined) parts.push(`approverId=${encodeURIComponent(String(filter.approverId))}`);
  if (filter.expenseClaimId !== undefined) parts.push(`expenseClaimId=${encodeURIComponent(String(filter.expenseClaimId))}`);
  if (filter.claimNumber !== undefined) parts.push(`claimNumber=${encodeURIComponent(filter.claimNumber)}`);
  return `?${parts.join('&')}`;
}

export const approvalService = {
  getPendingPage: (userId: number, page: number, pageSize: number): Promise<IPagedResult<IPendingApproval>> =>
    apiClient.get<IPagedResult<IPendingApproval>>(
      `approvals/pending?userId=${encodeURIComponent(String(userId))}&page=${page}&pageSize=${pageSize}`
    ),
  getHistoryPage: (
    filter: IApprovalHistoryFilter,
    page: number,
    pageSize: number
  ): Promise<IPagedResult<IApprovalHistoryEntry>> =>
    apiClient.get<IPagedResult<IApprovalHistoryEntry>>(`approvals/history${toHistoryQueryString(filter, page, pageSize)}`),
  approve: (expenseClaimId: number, dto: IApprovalActionDto): Promise<IApprovalActionResponse> =>
    apiClient.post<IApprovalActionResponse>(`approvals/${expenseClaimId}/approve`, dto),
  reject: (expenseClaimId: number, dto: IApprovalActionDto): Promise<IApprovalActionResponse> =>
    apiClient.post<IApprovalActionResponse>(`approvals/${expenseClaimId}/reject`, dto),
  sendBack: (expenseClaimId: number, dto: IApprovalActionDto): Promise<IApprovalActionResponse> =>
    apiClient.post<IApprovalActionResponse>(`approvals/${expenseClaimId}/send-back`, dto)
};
