import { apiClient } from '../utils/ApiClient';
import { IExpenseCategory } from '../models/IExpenseCategory';

export const expenseCategoryService = {
  getAll: (): Promise<IExpenseCategory[]> => apiClient.get<IExpenseCategory[]>('expense-categories')
};
