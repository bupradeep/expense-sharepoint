import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { TextField } from '@fluentui/react/lib/TextField';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { reportService } from '../../../../services/reportService';
import { departmentService } from '../../../../services/departmentService';
import { userService } from '../../../../services/userService';
import { IExpenseReportRow, IExpenseReportFilter } from '../../../../models/IExpenseReport';
import { IDepartment } from '../../../../models/IDepartment';
import { IUser } from '../../../../models/IUser';
import { formatCurrency, formatDate } from '../../../../utils/Formatters';
import LoadingState from '../common/LoadingState';
import ErrorMessage from '../common/ErrorMessage';
import TableCard from '../common/TableCard';
import PaginationControls from '../common/PaginationControls';
import { usePagination } from '../common/usePagination';

function defaultFromDate(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}

function defaultToDate(): string {
  return new Date().toISOString().slice(0, 10);
}

const ReportsAdmin: React.FC = () => {
  const [departments, setDepartments] = React.useState<IDepartment[]>([]);
  const [users, setUsers] = React.useState<IUser[]>([]);
  const [fromDate, setFromDate] = React.useState<string>(defaultFromDate());
  const [toDate, setToDate] = React.useState<string>(defaultToDate());
  const [departmentId, setDepartmentId] = React.useState<number | undefined>(undefined);
  const [employeeId, setEmployeeId] = React.useState<number | undefined>(undefined);
  const [validationError, setValidationError] = React.useState<string | undefined>(undefined);
  const [hasRun, setHasRun] = React.useState<boolean>(false);
  const [appliedFilter, setAppliedFilter] = React.useState<IExpenseReportFilter | undefined>(undefined);

  const fetchPage = React.useCallback(
    (page: number, pageSize: number) => {
      // appliedFilter is only undefined before the first "Run Report" click, at which point
      // usePagination is not yet enabled, so this branch never actually executes.
      return reportService.getExpenseReportPage(appliedFilter as IExpenseReportFilter, page, pageSize);
    },
    [appliedFilter]
  );
  const pagination = usePagination(fetchPage, hasRun);

  React.useEffect(() => {
    departmentService.getAll().then(setDepartments).catch(() => { /* dropdown is best-effort */ });
    userService.getAll().then(setUsers).catch(() => { /* dropdown is best-effort */ });
  }, []);

  const departmentOptions: IDropdownOption[] = departments.map((d) => ({ key: d.DepartmentId, text: d.DepartmentName }));
  const employeeOptions: IDropdownOption[] = users.map((u) => ({ key: u.UserId, text: u.FullName }));

  const runReport = (): void => {
    if (!fromDate || !toDate) {
      setValidationError('From Date and To Date are required.');
      return;
    }
    setValidationError(undefined);
    setAppliedFilter({ fromDate, toDate, departmentId, employeeId });
    setHasRun(true);
    pagination.setPage(1);
  };

  const columns: IColumn[] = [
    { key: 'claimNumber', name: 'Claim #', fieldName: 'ClaimNumber', minWidth: 120, isResizable: true },
    {
      key: 'date', name: 'Date', minWidth: 100,
      onRender: (item: IExpenseReportRow) => formatDate(item.ClaimDate)
    },
    { key: 'employeeCode', name: 'Employee Code', fieldName: 'EmployeeCode', minWidth: 110 },
    { key: 'employeeName', name: 'Employee', fieldName: 'EmployeeName', minWidth: 140, isResizable: true },
    { key: 'department', name: 'Department', fieldName: 'DepartmentName', minWidth: 120, isResizable: true },
    { key: 'project', name: 'Project', fieldName: 'ProjectName', minWidth: 140, isResizable: true },
    { key: 'client', name: 'Client', fieldName: 'ClientName', minWidth: 120 },
    { key: 'costCenter', name: 'Cost Center', fieldName: 'CostCenter', minWidth: 110 },
    {
      key: 'amount', name: 'Amount', minWidth: 100,
      onRender: (item: IExpenseReportRow) => formatCurrency(item.TotalAmount)
    },
    { key: 'status', name: 'Status', fieldName: 'Status', minWidth: 120 }
  ];

  return (
    <Stack tokens={{ childrenGap: 12 }}>
      {(validationError || pagination.error) && <ErrorMessage message={validationError || pagination.error || ''} />}
      <Stack horizontal tokens={{ childrenGap: 12 }} verticalAlign="end" wrap>
        <TextField
          label="From Date"
          type="date"
          required
          value={fromDate}
          onChange={(_e, value) => setFromDate(value || '')}
          styles={{ root: { width: 150 } }}
        />
        <TextField
          label="To Date"
          type="date"
          required
          value={toDate}
          onChange={(_e, value) => setToDate(value || '')}
          styles={{ root: { width: 150 } }}
        />
        <Dropdown
          label="Department"
          selectedKey={departmentId}
          options={departmentOptions}
          onChange={(_e, option) => setDepartmentId(option ? Number(option.key) : undefined)}
          styles={{ root: { width: 180 } }}
        />
        <Dropdown
          label="Employee"
          selectedKey={employeeId}
          options={employeeOptions}
          onChange={(_e, option) => setEmployeeId(option ? Number(option.key) : undefined)}
          styles={{ root: { width: 180 } }}
        />
        <PrimaryButton text="Run Report" onClick={runReport} disabled={pagination.loading || !fromDate || !toDate} />
      </Stack>

      {hasRun && (
        <TableCard>
          {pagination.loading && pagination.pageItems.length === 0 ? <LoadingState label="Running report..." /> : (
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
      )}
    </Stack>
  );
};

export default ReportsAdmin;
