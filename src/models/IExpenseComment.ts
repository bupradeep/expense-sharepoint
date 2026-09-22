import { IUser } from './IUser';

export interface IExpenseComment {
  ExpenseClaimCommentId: number;
  ExpenseClaimId: number;
  UserId: number;
  User?: IUser;
  CommentText: string;
  CreatedAt?: string;
}

export interface IExpenseCommentDto {
  userId: number;
  commentText: string;
}
