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

export interface IExpenseReceiptDto {
  expenseClaimId: number;
  expenseItemId?: number;
  fileName: string;
  filePath: string;
  fileType?: string;
  fileSize?: number;
  uploadedBy?: number;
  createdBy?: number;
}
