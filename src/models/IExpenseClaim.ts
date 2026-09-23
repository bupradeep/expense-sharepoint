import { IUser } from './IUser';
import { IDepartment } from './IDepartment';
import { IProject } from './IProject';
import { IExpenseItem, IExpenseItemDto } from './IExpenseItem';
import { IExpenseComment } from './IExpenseComment';

export type ExpenseClaimStatus =
  | 'Draft'
  | 'Submitted'
  | 'Department Head Review'
  | 'Finance Review'
  | 'Approved'
  | 'Rejected'
  | 'Sent Back'
  | 'Deleted'
  | 'Reimbursed';

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
  Comments?: IExpenseComment[];
}

export interface IExpenseClaimCreateDto {
  claimNumber: string;
  employeeId: number;
  departmentId: number;
  projectId: number;
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
