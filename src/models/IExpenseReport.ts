export interface IExpenseReportRow {
  ExpenseClaimId: number;
  ClaimNumber: string;
  ClaimDate?: string;
  EmployeeCode: string;
  EmployeeName: string;
  DepartmentName: string;
  ProjectName?: string;
  ClientName?: string;
  CostCenter?: string;
  TotalAmount: number;
  Status: string;
}

export interface IExpenseReportFilter {
  fromDate: string;
  toDate: string;
  departmentId?: number;
  employeeId?: number;
}

export interface IDashboardStatusBreakdown {
  status: string;
  count: number;
  amount: number;
}

export interface IDashboardDepartmentBreakdown {
  departmentName: string;
  count: number;
  amount: number;
}

export interface IDashboardMonthBreakdown {
  month: string;
  count: number;
  amount: number;
}

export interface IDashboardSummary {
  totalClaims: number;
  totalAmount: number;
  pendingApprovalsCount: number;
  reimbursedAmount: number;
  approvedAwaitingPayment: number;
  averageClaimAmount: number;
  byStatus: IDashboardStatusBreakdown[];
  byDepartment: IDashboardDepartmentBreakdown[];
  byMonth: IDashboardMonthBreakdown[];
}

export interface IDashboardFilter {
  fromDate?: string;
  toDate?: string;
  departmentId?: number;
}
