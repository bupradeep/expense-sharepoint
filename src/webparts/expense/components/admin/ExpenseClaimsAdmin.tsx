import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { TextField } from '@fluentui/react/lib/TextField';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { IconButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { expenseService } from '../../../../services/expenseService';
import { departmentService } from '../../../../services/departmentService';
import { userService } from '../../../../services/userService';
import { IExpenseClaim, ExpenseClaimStatus } from '../../../../models/IExpenseClaim';
import { IDepartment } from '../../../../models/IDepartment';
import { IUser } from '../../../../models/IUser';
import { ApiError } from '../../../../models/IApiError';
import { formatCurrency, formatDate } from '../../../../utils/Formatters';
import { getStatusColor } from '../../../../utils/StatusBadge';
import LoadingState from '../common/LoadingState';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import TableCard from '../common/TableCard';
import PaginationControls from '../common/PaginationControls';
import { usePagination } from '../common/usePagination';
import AdminClaimDetail from './AdminClaimDetail';

const ALL_KEY = 'all';

const statusValues: ExpenseClaimStatus[] = [
  'Draft', 'Submitted', 'Manager Approved', 'Department Head Review', 'Finance Review',
  'Finance Head Review', 'Approved', 'Rejected', 'Sent Back', 'Deleted', 'Reimbursed', 'Pending Approval'
];
const statusOptions: IDropdownOption[] = [
  { key: ALL_KEY, text: '--All--' },
  ...statusValues.map((s) => ({ key: s, text: s }))
];

export interface IExpenseClaimsAdminProps {
  currentUser: IUser;
}

const ExpenseClaimsAdmin: React.FC<IExpenseClaimsAdminProps> = (props) => {
  const [departments, setDepartments] = React.useState<IDepartment[]>([]);
  const [employees, setEmployees] = React.useState<IUser[]>([]);
  const [status, setStatus] = React.useState<string | undefined>(undefined);
  const [departmentId, setDepartmentId] = React.useState<number | undefined>(undefined);
  const [employeeId, setEmployeeId] = React.useState<number | undefined>(undefined);
  const [fromDate, setFromDate] = React.useState<string>('');
  const [toDate, setToDate] = React.useState<string>('');
  const [viewing, setViewing] = React.useState<IExpenseClaim | undefined>(undefined);
  const [actionError, setActionError] = React.useState<string | undefined>(undefined);

  const fetchPage = React.useCallback(
    (page: number, pageSize: number) =>
      expenseService.listPage(
        {
          status,
          departmentId,
          employeeId,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined
        },
        page,
        pageSize
      ),
    [status, departmentId, employeeId, fromDate, toDate]
  );
  const pagination = usePagination(fetchPage);

  React.useEffect(() => {
    departmentService.getAll().then(setDepartments).catch(() => { /* dropdown is best-effort */ });
    userService.getAll().then(setEmployees).catch(() => { /* dropdown is best-effort */ });
  }, []);

  const departmentOptions: IDropdownOption[] = [
    { key: ALL_KEY, text: '--All--' },
    ...departments.map((d) => ({ key: d.DepartmentId, text: d.DepartmentName }))
  ];
  const employeeOptions: IDropdownOption[] = [
    { key: ALL_KEY, text: '--All--' },
    ...employees.map((u) => ({ key: u.UserId, text: u.FullName }))
  ];

  const resetPage = (): void => pagination.setPage(1);

  const openView = (item: IExpenseClaim): void => {
    expenseService.getById(item.ExpenseClaimId)
      .then(setViewing)
      .catch((err: ApiError) => setActionError(err.message));
  };

  if (viewing) {
    return <AdminClaimDetail currentUser={props.currentUser} claim={viewing} onClose={() => setViewing(undefined)} />;
  }

  const columns: IColumn[] = [
    { key: 'claimNumber', name: 'Claim #', fieldName: 'ClaimNumber', minWidth: 120, isResizable: true },
    {
      key: 'employee', name: 'Employee', minWidth: 140,
      onRender: (item: IExpenseClaim) => item.Employee?.FullName || ''
    },
    {
      key: 'department', name: 'Department', minWidth: 120,
      onRender: (item: IExpenseClaim) => item.Department?.DepartmentName || ''
    },
    {
      key: 'amount', name: 'Amount', minWidth: 100,
      onRender: (item: IExpenseClaim) => formatCurrency(item.TotalAmount)
    },
    {
      key: 'status', name: 'Status', minWidth: 140,
      onRender: (item: IExpenseClaim) => <Text styles={{ root: { color: getStatusColor(item.Status) } }}>{item.Status}</Text>
    },
    {
      key: 'date', name: 'Date', minWidth: 100,
      onRender: (item: IExpenseClaim) => formatDate(item.ClaimDate)
    },
    {
      key: 'actions', name: '', minWidth: 60,
      onRender: (item: IExpenseClaim) => (
        <IconButton iconProps={{ iconName: 'RedEye' }} title="View" ariaLabel="View" onClick={() => openView(item)} />
      )
    }
  ];

  return (
    <div>
      {(pagination.error || actionError) && <ErrorMessage message={pagination.error || actionError || ''} />}
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
          label="Department"
          selectedKey={departmentId === undefined ? ALL_KEY : departmentId}
          options={departmentOptions}
          onChange={(_e, option) => { setDepartmentId(option && option.key !== ALL_KEY ? Number(option.key) : undefined); resetPage(); }}
          styles={{ root: { width: 180 } }}
        />
        <Dropdown
          label="Employee"
          selectedKey={employeeId === undefined ? ALL_KEY : employeeId}
          options={employeeOptions}
          onChange={(_e, option) => { setEmployeeId(option && option.key !== ALL_KEY ? Number(option.key) : undefined); resetPage(); }}
          styles={{ root: { width: 180 } }}
        />
      </Stack>

      <TableCard>
        {pagination.loading && pagination.pageItems.length === 0 ? <LoadingState /> : pagination.totalCount === 0 ? (
          <EmptyState message="No expense claims found for the selected filters." />
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

export default ExpenseClaimsAdmin;
