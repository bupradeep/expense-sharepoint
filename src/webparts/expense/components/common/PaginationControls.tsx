import * as React from 'react';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { IconButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { PAGE_SIZE_OPTIONS } from './PageSizeContext';

export interface IPaginationControlsProps {
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

const pageSizeOptions: IDropdownOption[] = PAGE_SIZE_OPTIONS.map((n) => ({ key: n, text: String(n) }));

const PaginationControls: React.FC<IPaginationControlsProps> = (props) => {
  if (props.totalCount === 0) {
    return null;
  }

  const start = (props.page - 1) * props.pageSize + 1;
  const end = Math.min(props.page * props.pageSize, props.totalCount);

  return (
    <Stack
      horizontal
      verticalAlign="center"
      horizontalAlign="space-between"
      tokens={{ childrenGap: 12 }}
      styles={{ root: { marginTop: 12 } }}
    >
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }}>
        <Text>Rows per page:</Text>
        <Dropdown
          selectedKey={props.pageSize}
          options={pageSizeOptions}
          disabled={props.loading}
          onChange={(_e, option) => option && props.onPageSizeChange(Number(option.key))}
          styles={{ root: { width: 70 } }}
        />
      </Stack>
      <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 4 }}>
        <Text>{`${start}-${end} of ${props.totalCount}`}</Text>
        <IconButton
          iconProps={{ iconName: 'ChevronLeft' }}
          disabled={props.loading || props.page <= 1}
          onClick={() => props.onPageChange(props.page - 1)}
          ariaLabel="Previous page"
          title="Previous page"
        />
        <IconButton
          iconProps={{ iconName: 'ChevronRight' }}
          disabled={props.loading || props.page >= props.totalPages}
          onClick={() => props.onPageChange(props.page + 1)}
          ariaLabel="Next page"
          title="Next page"
        />
      </Stack>
    </Stack>
  );
};

export default PaginationControls;
