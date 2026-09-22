declare interface IExpenseWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  ApiBaseUrlFieldLabel: string;
}

declare module 'ExpenseWebPartStrings' {
  const strings: IExpenseWebPartStrings;
  export = strings;
}
