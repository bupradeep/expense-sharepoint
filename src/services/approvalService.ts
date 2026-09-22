import { apiClient } from '../utils/ApiClient';
import { IPendingApproval, IApprovalActionDto, IApprovalActionResponse } from '../models/IApproval';
import { IPagedResult } from '../models/IPagedResult';

export const approvalService = {
  getPendingPage: (userId: number, page: number, pageSize: number): Promise<IPagedResult<IPendingApproval>> =>
    apiClient.get<IPagedResult<IPendingApproval>>(
      `approvals/pending?userId=${encodeURIComponent(String(userId))}&page=${page}&pageSize=${pageSize}`
    ),
  approve: (expenseClaimId: number, dto: IApprovalActionDto): Promise<IApprovalActionResponse> =>
    apiClient.post<IApprovalActionResponse>(`approvals/${expenseClaimId}/approve`, dto),
  reject: (expenseClaimId: number, dto: IApprovalActionDto): Promise<IApprovalActionResponse> =>
    apiClient.post<IApprovalActionResponse>(`approvals/${expenseClaimId}/reject`, dto),
  sendBack: (expenseClaimId: number, dto: IApprovalActionDto): Promise<IApprovalActionResponse> =>
    apiClient.post<IApprovalActionResponse>(`approvals/${expenseClaimId}/send-back`, dto)
};
