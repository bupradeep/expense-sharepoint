import { apiClient } from '../utils/ApiClient';
import { IApprovalRule, IApprovalRuleDto } from '../models/IApprovalRule';
import { IPagedResult } from '../models/IPagedResult';

export const approvalRuleService = {
  getPage: (page: number, pageSize: number): Promise<IPagedResult<IApprovalRule>> =>
    apiClient.get<IPagedResult<IApprovalRule>>(`approval-rules?page=${page}&pageSize=${pageSize}`),
  getById: (id: number): Promise<IApprovalRule> => apiClient.get<IApprovalRule>(`approval-rules/${id}`),
  create: (dto: IApprovalRuleDto): Promise<IApprovalRule> => apiClient.post<IApprovalRule>('approval-rules', dto),
  update: (id: number, dto: IApprovalRuleDto): Promise<IApprovalRule> =>
    apiClient.put<IApprovalRule>(`approval-rules/${id}`, dto),
  remove: (id: number): Promise<void> => apiClient.delete<void>(`approval-rules/${id}`)
};
