import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { TextField } from '@fluentui/react/lib/TextField';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { Stack } from '@fluentui/react/lib/Stack';
import { approvalService } from '../../../../services/approvalService';
import { userService } from '../../../../services/userService';
import { IApprovalHistoryEntry } from '../../../../models/IApprovalHistory';
import { IUser } from '../../../../models/IUser';
import { formatDate } from '../../../../utils/Formatters';
import LoadingState from '../common/LoadingState';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import TableCard from '../common/TableCard';
import PaginationControls from '../common/PaginationControls';
import { usePagination } from '../common/usePagination';

const ALL_KEY = 'all';

const statusOptions: IDropdownOption[] = [
  { key: ALL_KEY, text: '--All--' },
  ...[
    'Department Head Review', 'Finance Review',
    'Approved', 'Rejected', 'Sent Back'
  ].map((s) => ({ key: s, text: s }))
];

const ApprovalHistoryAdmin: React.FC = () => {
  const [approvers, setApprovers] = React.useState<IUser[]>([]);
  const [fromDate, setFromDate] = React.useState<string>('');
  const [toDate, setToDate] = React.useState<string>('');
  const [status, setStatus] = React.useState<string | undefined>(undefined);
  const [approverId, setApproverId] = React.useState<number | undefined>(undefined);
  const [claimNumber, setClaimNumber] = React.useState<string>('');

  const fetchPage = React.useCallback(
    (page: number, pageSize: number) =>
      approvalService.getHistoryPage(
        { fromDate: fromDate || undefined, toDate: toDate || undefined, status, approverId, claimNumber: claimNumber || undefined },
        page,
        pageSize
      ),
    [fromDate, toDate, status, approverId, claimNumber]
  );
  const pagination = usePagination(fetchPage);

  React.useEffect(() => {
    userService.getAll().then(setApprovers).catch(() => { /* dropdown is best-effort */ });
  }, []);

  const approverOptions: IDropdownOption[] = [
    { key: ALL_KEY, text: '--All--' },
    ...approvers.map((u) => ({ key: u.UserId, text: u.FullName }))
  ];

  const resetPage = (): void => pagination.setPage(1);

  const columns: IColumn[] = [
    {
      key: 'claimNumber', name: 'Claim #', minWidth: 120,
      onRender: (item: IApprovalHistoryEntry) => item.ExpenseClaim?.ClaimNumber || ''
    },
    {
      key: 'approver', name: 'Approver', minWidth: 140,
      onRender: (item: IApprovalHistoryEntry) => item.Approver?.FullName || ''
    },
    { key: 'action', name: 'Action', fieldName: 'Action', minWidth: 100 },
    { key: 'previousStatus', name: 'Previous Status', fieldName: 'PreviousStatus', minWidth: 150 },
    { key: 'newStatus', name: 'New Status', fieldName: 'NewStatus', minWidth: 150 },
    { key: 'comments', name: 'Comments', fieldName: 'Comments', minWidth: 180, isResizable: true },
    {
      key: 'date', name: 'Action Date', minWidth: 130,
      onRender: (item: IApprovalHistoryEntry) => formatDate(item.ActionDate)
    }
  ];

  return (
    <div>
      {pagination.error && <ErrorMessage message={pagination.error} />}
      <Stack horizontal tokens={{ childrenGap: 12 }} verticalAlign="end" wrap>
        <TextField
          label="From Date"
          type="date"
          value={fromDate}
          onChange={(_e, value) => { setFromDate(value || ''); resetPage(); }}
          styles={{ root: { width: 150, marginTop: 6 } }}
        />
        <TextField
          label="To Date"
          type="date"
          value={toDate}
          onChange={(_e, value) => { setToDate(value || ''); resetPage(); }}
          styles={{ root: { width: 150, marginTop: 6 } }}
        />
        <Dropdown
          label="Status"
          selectedKey={status === undefined ? ALL_KEY : status}
          options={statusOptions}
          onChange={(_e, option) => { setStatus(option && option.key !== ALL_KEY ? String(option.key) : undefined); resetPage(); }}
          styles={{ root: { width: 180 } }}
        />
        <Dropdown
          label="Approver"
          selectedKey={approverId === undefined ? ALL_KEY : approverId}
          options={approverOptions}
          onChange={(_e, option) => { setApproverId(option && option.key !== ALL_KEY ? Number(option.key) : undefined); resetPage(); }}
          styles={{ root: { width: 180 } }}
        />
        <TextField
          label="Claim Number"
          placeholder="Search claim #"
          value={claimNumber}
          onChange={(_e, value) => { setClaimNumber(value || ''); resetPage(); }}
          styles={{ root: { width: 180 } }}
        />
      </Stack>

      <TableCard>
        {pagination.loading && pagination.pageItems.length === 0 ? <LoadingState /> : pagination.totalCount === 0 ? (
          <EmptyState message="No approval history found for the selected filters." />
        ) : (
          <>
            <DetailsList
              items={pagination.pageItems}
              columns={columns}
              layoutMode={DetailsListLayoutMode.justified}
              selectionMode={SelectionMode.none}
            />
            <PaginationControls
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalPages={pagination.totalPages}
              totalCount={pagination.totalCount}
              loading={pagination.loading}
              onPageChange={pagination.setPage}
              onPageSizeChange={pagination.setPageSize}
            />
          </>
        )}
      </TableCard>
    </div>
  );
};

export default ApprovalHistoryAdmin;
