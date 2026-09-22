export interface IExpenseCategory {
  CategoryId: number;
  CategoryName: string;
  IsActive: boolean;
}

export interface IExpenseCategoryDto {
  categoryName: string;
  isActive?: boolean;
}
