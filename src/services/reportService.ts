import { apiClient } from '../utils/ApiClient';
import { IExpenseReportRow, IExpenseReportFilter, IDashboardSummary, IDashboardFilter } from '../models/IExpenseReport';
import { IPagedResult } from '../models/IPagedResult';

function toDashboardQueryString(filter: IDashboardFilter): string {
  const parts: string[] = [];
  if (filter.fromDate) parts.push(`fromDate=${encodeURIComponent(filter.fromDate)}`);
  if (filter.toDate) parts.push(`toDate=${encodeURIComponent(filter.toDate)}`);
  if (filter.departmentId !== undefined) parts.push(`departmentId=${encodeURIComponent(String(filter.departmentId))}`);
  return parts.length ? `?${parts.join('&')}` : '';
}

function toQueryString(filter: IExpenseReportFilter, page: number, pageSize: number): string {
  const parts: string[] = [
    `fromDate=${encodeURIComponent(filter.fromDate)}`,
    `toDate=${encodeURIComponent(filter.toDate)}`,
    `page=${page}`,
    `pageSize=${pageSize}`
  ];
  if (filter.departmentId !== undefined) {
    parts.push(`departmentId=${encodeURIComponent(String(filter.departmentId))}`);
  }
  if (filter.employeeId !== undefined) {
    parts.push(`employeeId=${encodeURIComponent(String(filter.employeeId))}`);
  }
  return `?${parts.join('&')}`;
}

export const reportService = {
  getExpenseReportPage: (
    filter: IExpenseReportFilter,
    page: number,
    pageSize: number
  ): Promise<IPagedResult<IExpenseReportRow>> =>
    apiClient.get<IPagedResult<IExpenseReportRow>>(`reports/expenses${toQueryString(filter, page, pageSize)}`),
  getDashboardSummary: (filter: IDashboardFilter = {}): Promise<IDashboardSummary> =>
    apiClient.get<IDashboardSummary>(`reports/dashboard${toDashboardQueryString(filter)}`)
};
