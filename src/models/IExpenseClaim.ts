import { IUser } from './IUser';
import { IDepartment } from './IDepartment';
import { IProject } from './IProject';
import { IExpenseItem, IExpenseItemDto } from './IExpenseItem';

export type ExpenseClaimStatus =
  | 'Draft'
  | 'Submitted'
  | 'Manager Approved'
  | 'Department Head Review'
  | 'Finance Review'
  | 'Finance Head Review'
  | 'Approved'
  | 'Rejected'
  | 'Sent Back'
  | 'Deleted'
  | 'Reimbursed'
  | 'Pending Approval';

export interface IExpenseClaim {
  ExpenseClaimId: number;
  ClaimNumber: string;
  EmployeeId: number;
  Employee?: IUser;
  DepartmentId: number;
  Department?: IDepartment;
  ProjectId?: number;
  Project?: IProject;
  ClaimDate?: string;
  TotalAmount: number;
  BusinessPurpose: string;
  Location?: string;
  PaymentMethod?: string;
  Remarks?: string;
  Status: ExpenseClaimStatus;
  SubmittedAt?: string;
  Items?: IExpenseItem[];
  Receipts?: unknown[];
}

export interface IExpenseClaimCreateDto {
  claimNumber: string;
  employeeId: number;
  departmentId: number;
  projectId?: number;
  claimDate?: string;
  businessPurpose: string;
  location?: string;
  paymentMethod?: string;
  remarks?: string;
  createdBy: number;
  items: IExpenseItemDto[];
}

export interface IExpenseClaimUpdateDto {
  businessPurpose: string;
  location?: string;
  paymentMethod?: string;
  remarks?: string;
  updatedBy: number;
  items?: IExpenseItemDto[];
}

export interface ISubmitResponse {
  message: string;
  policyValidation: {
    hasException: boolean;
    violations: unknown[];
  };
  status: string;
}
