import { WebPartContext } from '@microsoft/sp-webpart-base';

export interface IExpenseProps {
  context: WebPartContext;
  apiBaseUrl: string;
  defaultPageSize: number;
}
