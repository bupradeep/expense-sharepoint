declare interface IExpenseWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
}

declare module 'ExpenseWebPartStrings' {
  const strings: IExpenseWebPartStrings;
  export = strings;
}
