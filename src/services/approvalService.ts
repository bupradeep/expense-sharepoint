import { apiClient } from '../utils/ApiClient';
import { IPendingApproval, IApprovalActionDto, IApprovalActionResponse } from '../models/IApproval';

export const approvalService = {
  getPending: (userId: number): Promise<IPendingApproval[]> =>
    apiClient.get<IPendingApproval[]>(`approvals/pending?userId=${encodeURIComponent(String(userId))}`),
  approve: (expenseClaimId: number, dto: IApprovalActionDto): Promise<IApprovalActionResponse> =>
    apiClient.post<IApprovalActionResponse>(`approvals/${expenseClaimId}/approve`, dto),
  reject: (expenseClaimId: number, dto: IApprovalActionDto): Promise<IApprovalActionResponse> =>
    apiClient.post<IApprovalActionResponse>(`approvals/${expenseClaimId}/reject`, dto),
  sendBack: (expenseClaimId: number, dto: IApprovalActionDto): Promise<IApprovalActionResponse> =>
    apiClient.post<IApprovalActionResponse>(`approvals/${expenseClaimId}/send-back`, dto)
};
