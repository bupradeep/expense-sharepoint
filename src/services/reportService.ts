import { apiClient } from '../utils/ApiClient';
import { IExpenseReportRow, IExpenseReportFilter } from '../models/IExpenseReport';

function toQueryString(filter: IExpenseReportFilter): string {
  const parts: string[] = [
    `fromDate=${encodeURIComponent(filter.fromDate)}`,
    `toDate=${encodeURIComponent(filter.toDate)}`
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
  getExpenseReport: (filter: IExpenseReportFilter): Promise<IExpenseReportRow[]> =>
    apiClient.get<IExpenseReportRow[]>(`reports/expenses${toQueryString(filter)}`)
};
