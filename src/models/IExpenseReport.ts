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
