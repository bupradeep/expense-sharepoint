export interface IPendingApproval {
  ExpenseClaimId: number;
  ClaimNumber: string;
  EmployeeId: number;
  EmployeeName: string;
  DepartmentId: number;
  DepartmentName: string;
  TotalAmount: number;
  BusinessPurpose: string;
  Status: string;
  SubmittedAt?: string;
  ApprovalLevel?: number;
  LastApprovalDate?: string;
}

export interface IApprovalActionDto {
  approverId: number;
  approvalLevel?: number;
  comments?: string;
}

export interface IApprovalActionResponse {
  message: string;
  status: string;
}
