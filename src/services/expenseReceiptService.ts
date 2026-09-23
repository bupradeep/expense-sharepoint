import { apiClient } from '../utils/ApiClient';
import { IExpenseReceipt, IExpenseReceiptUploadMeta } from '../models/IExpenseReceipt';

export const expenseReceiptService = {
  listByClaim: (expenseClaimId: number): Promise<IExpenseReceipt[]> =>
    apiClient.get<IExpenseReceipt[]>(`expense-receipts?expenseClaimId=${expenseClaimId}`),
  // The file itself is stored on the backend (not SharePoint), so this API works the same way for
  // any client -- SPFx, Teams tab, Teams agent -- with no SharePoint context or permissions needed.
  upload: (file: File, meta: IExpenseReceiptUploadMeta): Promise<IExpenseReceipt> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('expenseClaimId', String(meta.expenseClaimId));
    if (meta.expenseItemId) {
      formData.append('expenseItemId', String(meta.expenseItemId));
    }
    return apiClient.upload<IExpenseReceipt>('expense-receipts', formData);
  },
  download: (receiptId: number): Promise<Blob> => apiClient.downloadBlob(`expense-receipts/${receiptId}/download`),
  remove: (id: number): Promise<void> => apiClient.delete<void>(`expense-receipts/${id}`)
};
