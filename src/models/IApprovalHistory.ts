import { IUser } from './IUser';

export interface IApprovalHistoryEntry {
  ApprovalHistoryId: number;
  ExpenseClaimId: number;
  ApprovalLevel: number;
  ApproverId: number;
  Approver?: IUser;
  ExpenseClaim?: { ClaimNumber: string };
  Action: string;
  Comments?: string;
  ActionDate: string;
  PreviousStatus?: string;
  NewStatus: string;
}

export interface IApprovalHistoryFilter {
  fromDate?: string;
  toDate?: string;
  status?: string;
  approverId?: number;
  expenseClaimId?: number;
  claimNumber?: string;
}
