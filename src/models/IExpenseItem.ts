import { IExpenseCategory } from './IExpenseCategory';

export interface IExpenseItem {
  ExpenseItemId?: number;
  ExpenseClaimId?: number;
  CategoryId: number;
  ExpenseCategory?: IExpenseCategory;
  ExpenseDate: string;
  Amount: number;
  MerchantName?: string;
  Description?: string;
  BusinessPurpose?: string;
  PaymentMethod?: string;
  IsPolicyException?: boolean;
  PolicyExceptionReason?: string;
}

export interface IExpenseItemDto {
  categoryId: number;
  expenseDate: string;
  amount: number;
  merchantName?: string;
  description?: string;
  businessPurpose?: string;
  paymentMethod?: string;
  isPolicyException?: boolean;
  policyExceptionReason?: string;
}
