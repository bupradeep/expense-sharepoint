export interface IExpenseReceipt {
  ReceiptId: number;
  ExpenseClaimId: number;
  ExpenseItemId?: number;
  FileName: string;
  FilePath: string;
  FileType?: string;
  FileSize?: number;
  UploadedBy?: number;
  UploadedAt?: string;
}

export interface IExpenseReceiptUploadMeta {
  expenseClaimId: number;
  expenseItemId?: number;
}
