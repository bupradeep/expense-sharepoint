import { IUser } from './IUser';

export interface IAuditLogEntry {
  AuditLogId: number;
  UserId: number;
  User?: IUser;
  ExpenseClaimId?: number;
  ExpenseClaim?: { ClaimNumber: string };
  Action: string;
  PreviousStatus?: string;
  NewStatus?: string;
  Comments?: string;
  CreatedAt?: string;
}

export interface IAuditLogFilter {
  fromDate?: string;
  toDate?: string;
  userId?: number;
  expenseClaimId?: number;
  claimNumber?: string;
  action?: string;
}
