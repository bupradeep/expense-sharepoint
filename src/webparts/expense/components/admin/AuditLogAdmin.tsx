import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { TextField } from '@fluentui/react/lib/TextField';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { Stack } from '@fluentui/react/lib/Stack';
import { auditLogService } from '../../../../services/auditLogService';
import { userService } from '../../../../services/userService';
import { IAuditLogEntry } from '../../../../models/IAuditLog';
import { IUser } from '../../../../models/IUser';
import { formatDateTime } from '../../../../utils/Formatters';
import LoadingState from '../common/LoadingState';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import TableCard from '../common/TableCard';
import PaginationControls from '../common/PaginationControls';
import { usePagination } from '../common/usePagination';

const ALL_KEY = 'all';

const actionOptions: IDropdownOption[] = [
  { key: ALL_KEY, text: '--All--' },
  ...[
    'CREATE_CLAIM', 'UPDATE_CLAIM', 'DELETE_CLAIM', 'ADD_COMMENT',
    'CLAIM_SUBMITTED', 'CLAIM_APPROVED', 'CLAIM_REJECTED', 'CLAIM_SENT_BACK',
    'PAYMENT_PROCESSED'
  ].map((a) => ({ key: a, text: a }))
];

const AuditLogAdmin: React.FC = () => {
  const [users, setUsers] = React.useState<IUser[]>([]);
  const [fromDate, setFromDate] = React.useState<string>('');
  const [toDate, setToDate] = React.useState<string>('');
  const [userId, setUserId] = React.useState<number | undefined>(undefined);
  const [action, setAction] = React.useState<string | undefined>(undefined);
  const [claimNumber, setClaimNumber] = React.useState<string>('');

  const fetchPage = React.useCallback(
    (page: number, pageSize: number) =>
      auditLogService.getPage(
        { fromDate: fromDate || undefined, toDate: toDate || undefined, userId, action, claimNumber: claimNumber || undefined },
        page,
        pageSize
      ),
    [fromDate, toDate, userId, action, claimNumber]
  );
  const pagination = usePagination(fetchPage);

  React.useEffect(() => {
    userService.getAll().then(setUsers).catch(() => { /* dropdown is best-effort */ });
  }, []);

  const userOptions: IDropdownOption[] = [
    { key: ALL_KEY, text: '--All--' },
    ...users.map((u) => ({ key: u.UserId, text: u.FullName }))
  ];

  const resetPage = (): void => pagination.setPage(1);

  const columns: IColumn[] = [
    {
      key: 'date', name: 'Date', minWidth: 140,
      onRender: (item: IAuditLogEntry) => formatDateTime(item.CreatedAt)
    },
    {
      key: 'user', name: 'User', minWidth: 140,
      onRender: (item: IAuditLogEntry) => item.User?.FullName || ''
    },
    { key: 'action', name: 'Action', fieldName: 'Action', minWidth: 130 },
    {
      key: 'claimNumber', name: 'Claim #', minWidth: 120,
      onRender: (item: IAuditLogEntry) => item.ExpenseClaim?.ClaimNumber || ''
    },
    { key: 'previousStatus', name: 'Previous Status', fieldName: 'PreviousStatus', minWidth: 140 },
    { key: 'newStatus', name: 'New Status', fieldName: 'NewStatus', minWidth: 140 },
    { key: 'comments', name: 'Comments', fieldName: 'Comments', minWidth: 220, isResizable: true }
  ];

  return (
    <div>
      {pagination.error && <ErrorMessage message={pagination.error} />}
      <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="end" wrap>
        <TextField
          label="From Date"
          type="date"
          value={fromDate}
          onChange={(_e, value) => { setFromDate(value || ''); resetPage(); }}
          styles={{ root: { width: 150 }, fieldGroup: { height: 32 } }}
        />
        <TextField
          label="To Date"
          type="date"
          value={toDate}
          onChange={(_e, value) => { setToDate(value || ''); resetPage(); }}
          styles={{ root: { width: 150 }, fieldGroup: { height: 32 } }}
        />
        <Dropdown
          label="Action"
          selectedKey={action === undefined ? ALL_KEY : action}
          options={actionOptions}
          onChange={(_e, option) => { setAction(option && option.key !== ALL_KEY ? String(option.key) : undefined); resetPage(); }}
          styles={{ root: { width: 180 }, title: { height: 32, lineHeight: '30px' } }}
        />
        <Dropdown
          label="User"
          selectedKey={userId === undefined ? ALL_KEY : userId}
          options={userOptions}
          onChange={(_e, option) => { setUserId(option && option.key !== ALL_KEY ? Number(option.key) : undefined); resetPage(); }}
          styles={{ root: { width: 180 }, title: { height: 32, lineHeight: '30px' } }}
        />
        <TextField
          label="Claim Number"
          placeholder="Search claim #"
          value={claimNumber}
          onChange={(_e, value) => { setClaimNumber(value || ''); resetPage(); }}
          styles={{ root: { width: 180 }, fieldGroup: { height: 32 } }}
        />
      </Stack>

      <TableCard>
        {pagination.loading && pagination.pageItems.length === 0 ? <LoadingState /> : pagination.totalCount === 0 ? (
          <EmptyState message="No audit log entries found for the selected filters." />
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

export default AuditLogAdmin;
