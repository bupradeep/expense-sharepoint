import * as React from 'react';

export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];
export const DEFAULT_PAGE_SIZE = 5;

const PageSizeContext = React.createContext<number>(DEFAULT_PAGE_SIZE);

export const PageSizeProvider = PageSizeContext.Provider;

export function useDefaultPageSize(): number {
  return React.useContext(PageSizeContext);
}
