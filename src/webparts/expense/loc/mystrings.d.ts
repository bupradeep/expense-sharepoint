declare interface IExpenseWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  ApiBaseUrlFieldLabel: string;
  ApiResourceIdFieldLabel: string;
  DefaultPageSizeFieldLabel: string;
}

declare module 'ExpenseWebPartStrings' {
  const strings: IExpenseWebPartStrings;
  export = strings;
}
