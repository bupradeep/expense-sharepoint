import { ExpenseClaimStatus } from '../models/IExpenseClaim';

export function getStatusColor(status: ExpenseClaimStatus | string): string {
  switch (status) {
    case 'Draft':
      return '#605e5c';
    case 'Submitted':
    case 'Department Head Review':
    case 'Finance Review':
      return '#0078d4';
    case 'Approved':
      return '#107c10';
    case 'Reimbursed':
      return '#498205';
    case 'Rejected':
    case 'Deleted':
      return '#a4262c';
    case 'Sent Back':
      return '#ca5010';
    default:
      return '#605e5c';
  }
}
