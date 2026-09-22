import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { TextField } from '@fluentui/react/lib/TextField';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { reportService } from '../../../../services/reportService';
import { departmentService } from '../../../../services/departmentService';
import { userService } from '../../../../services/userService';
import { IExpenseReportRow } from '../../../../models/IExpenseReport';
import { IDepartment } from '../../../../models/IDepartment';
import { IUser } from '../../../../models/IUser';
import { ApiError } from '../../../../models/IApiError';
import { formatCurrency, formatDate } from '../../../../utils/Formatters';
import LoadingState from '../common/LoadingState';
import ErrorMessage from '../common/ErrorMessage';
import TableCard from '../common/TableCard';

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
  const [rows, setRows] = React.useState<IExpenseReportRow[] | undefined>(undefined);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    departmentService.getAll().then(setDepartments).catch(() => { /* dropdown is best-effort */ });
    userService.getAll().then(setUsers).catch(() => { /* dropdown is best-effort */ });
  }, []);

  const departmentOptions: IDropdownOption[] = departments.map((d) => ({ key: d.DepartmentId, text: d.DepartmentName }));
  const employeeOptions: IDropdownOption[] = users.map((u) => ({ key: u.UserId, text: u.FullName }));

  const runReport = (): void => {
    if (!fromDate || !toDate) {
      setError('From Date and To Date are required.');
      return;
    }
    setLoading(true);
    setError(undefined);
    reportService.getExpenseReport({ fromDate, toDate, departmentId, employeeId })
      .then((data) => {
        setLoading(false);
        setRows(data);
      })
      .catch((err: ApiError) => {
        setLoading(false);
        setError(err.message);
      });
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
      {error && <ErrorMessage message={error} />}
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
        <PrimaryButton text="Run Report" onClick={runReport} disabled={loading || !fromDate || !toDate} />
      </Stack>

      {loading && <LoadingState label="Running report..." />}
      {rows && (
        <TableCard>
          <DetailsList
            items={rows}
            columns={columns}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
          />
        </TableCard>
      )}
    </Stack>
  );
};

export default ReportsAdmin;
