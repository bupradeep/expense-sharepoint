import { apiClient } from '../utils/ApiClient';
import { IAuditLogEntry, IAuditLogFilter } from '../models/IAuditLog';
import { IPagedResult } from '../models/IPagedResult';

function toQueryString(filter: IAuditLogFilter, page: number, pageSize: number): string {
  const parts: string[] = [`page=${page}`, `pageSize=${pageSize}`];
  if (filter.fromDate !== undefined) parts.push(`fromDate=${encodeURIComponent(filter.fromDate)}`);
  if (filter.toDate !== undefined) parts.push(`toDate=${encodeURIComponent(filter.toDate)}`);
  if (filter.userId !== undefined) parts.push(`userId=${encodeURIComponent(String(filter.userId))}`);
  if (filter.expenseClaimId !== undefined) parts.push(`expenseClaimId=${encodeURIComponent(String(filter.expenseClaimId))}`);
  if (filter.claimNumber !== undefined) parts.push(`claimNumber=${encodeURIComponent(filter.claimNumber)}`);
  if (filter.action !== undefined) parts.push(`action=${encodeURIComponent(filter.action)}`);
  return `?${parts.join('&')}`;
}

export const auditLogService = {
  getPage: (filter: IAuditLogFilter, page: number, pageSize: number): Promise<IPagedResult<IAuditLogEntry>> =>
    apiClient.get<IPagedResult<IAuditLogEntry>>(`audit-logs${toQueryString(filter, page, pageSize)}`)
};
