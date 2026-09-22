import { apiClient } from '../utils/ApiClient';
import { IExpenseReceipt, IExpenseReceiptDto } from '../models/IExpenseReceipt';

export const expenseReceiptService = {
  listByClaim: (expenseClaimId: number): Promise<IExpenseReceipt[]> =>
    apiClient.get<IExpenseReceipt[]>(`expense-receipts?expenseClaimId=${expenseClaimId}`),
  create: (dto: IExpenseReceiptDto): Promise<IExpenseReceipt> =>
    apiClient.post<IExpenseReceipt>('expense-receipts', dto),
  remove: (id: number): Promise<void> => apiClient.delete<void>(`expense-receipts/${id}`)
};
