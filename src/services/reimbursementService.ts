import { apiClient } from '../utils/ApiClient';
import { IReimbursement, IPaymentDto } from '../models/IReimbursement';
import { IExpenseClaim } from '../models/IExpenseClaim';
import { IPagedResult } from '../models/IPagedResult';

export const reimbursementService = {
  listPage: (page: number, pageSize: number): Promise<IPagedResult<IReimbursement>> =>
    apiClient.get<IPagedResult<IReimbursement>>(`reimbursements?page=${page}&pageSize=${pageSize}`),
  pay: (expenseClaimId: number, dto: IPaymentDto): Promise<IExpenseClaim> =>
    apiClient.post<IExpenseClaim>(`expenses/${expenseClaimId}/payment`, dto)
};
