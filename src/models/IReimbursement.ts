export interface IReimbursement {
  ReimbursementId: number;
  ExpenseClaimId: number;
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
