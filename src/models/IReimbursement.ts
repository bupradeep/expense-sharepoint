export interface IReimbursement {
  ReimbursementId: number;
  ExpenseClaimId: number;
  ExpenseClaim?: { ClaimNumber: string };
  ProcessedBy: number;
  PaymentReference?: string;
  PaymentDate?: string;
  PaymentAmount?: number;
  PaymentMethod?: string;
  TransactionReference?: string;
  PaymentRemarks?: string;
  Status: string;
}

export interface IPaymentDto {
  processedBy: number;
  paymentReference?: string;
  paymentDate?: string;
  paymentAmount?: number;
  paymentMethod?: string;
  transactionReference?: string;
  paymentRemarks?: string;
}

export interface IReimbursementFilter {
  fromDate?: string;
  toDate?: string;
  claimNumber?: string;
}
