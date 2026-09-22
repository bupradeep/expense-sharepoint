import * as React from 'react';
import { useDefaultPageSize } from './PageSizeContext';
import { IPagedResult } from '../../../../models/IPagedResult';
import { ApiError } from '../../../../models/IApiError';

export type FetchPageFn<T> = (page: number, pageSize: number) => Promise<IPagedResult<T>>;

export interface IPaginationState<T> {
  pageItems: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  loading: boolean;
  error: string | undefined;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  reload: () => void;
}

/**
 * Server-driven pagination: calls fetchPage(page, pageSize) whenever the page, page size, or
 * fetchPage identity itself changes (so callers memoize fetchPage with useCallback and include
 * their own filters in its dependency list to refetch page 1 when a filter changes).
 * Pass enabled=false to defer fetching entirely (e.g. a report that only runs on demand).
 */
export function usePagination<T>(fetchPage: FetchPageFn<T>, enabled: boolean = true): IPaginationState<T> {
  const defaultPageSize = useDefaultPageSize();
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSizeInternal] = React.useState<number>(defaultPageSize);
  const [pageItems, setPageItems] = React.useState<T[]>([]);
  const [totalCount, setTotalCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [reloadToken, setReloadToken] = React.useState<number>(0);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  React.useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    setError(undefined);

    fetchPage(page, pageSize)
      .then((result) => {
        if (cancelled) {
          return;
        }
        setPageItems(result.items);
        setTotalCount(result.totalCount);
        setLoading(false);
      })
      .catch((err: ApiError) => {
        if (cancelled) {
          return;
        }
        setLoading(false);
        setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchPage, page, pageSize, reloadToken, enabled]);

  const setPageSize = (newSize: number): void => {
    setPageSizeInternal(newSize);
    setPage(1);
  };

  const reload = (): void => {
    setReloadToken((t) => t + 1);
  };

  return { pageItems, page, pageSize, totalPages, totalCount, loading, error, setPage, setPageSize, reload };
}
