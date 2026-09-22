import { apiClient } from '../utils/ApiClient';
import { IReimbursement, IPaymentDto } from '../models/IReimbursement';
import { IExpenseClaim } from '../models/IExpenseClaim';

export const reimbursementService = {
  listAll: (): Promise<IReimbursement[]> => apiClient.get<IReimbursement[]>('reimbursements'),
  pay: (expenseClaimId: number, dto: IPaymentDto): Promise<IExpenseClaim> =>
    apiClient.post<IExpenseClaim>(`expenses/${expenseClaimId}/payment`, dto)
};
