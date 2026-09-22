import * as React from 'react';
import { TextField } from '@fluentui/react/lib/TextField';
import { Dropdown, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { reportService } from '../../../../services/reportService';
import { departmentService } from '../../../../services/departmentService';
import {
  IDashboardSummary,
  IDashboardStatusBreakdown,
  IDashboardDepartmentBreakdown,
  IDashboardMonthBreakdown
} from '../../../../models/IExpenseReport';
import { IDepartment } from '../../../../models/IDepartment';
import { ApiError } from '../../../../models/IApiError';
import { formatCurrency } from '../../../../utils/Formatters';
import { getStatusColor } from '../../../../utils/StatusBadge';
import LoadingState from '../common/LoadingState';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import TableCard from '../common/TableCard';
import styles from './DashboardAdmin.module.scss';

const ALL_KEY = 'all';

interface IKpiCardProps {
  label: string;
  value: string;
}

const KpiCard: React.FC<IKpiCardProps> = (props) => (
  <div className={styles.kpiCard}>
    <Text className={styles.kpiLabel}>{props.label}</Text>
    <Text className={styles.kpiValue}>{props.value}</Text>
  </div>
);

const StatusBars: React.FC<{ rows: IDashboardStatusBreakdown[] }> = ({ rows }) => {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <Stack tokens={{ childrenGap: 8 }}>
      {rows.map((row) => (
        <div key={row.status}>
          <Stack horizontal horizontalAlign="space-between">
            <Text variant="small">{row.status}</Text>
            <Text variant="small">{row.count} &middot; {formatCurrency(row.amount)}</Text>
          </Stack>
          <div className={styles.barTrack}>
            <div
              className={styles.barFill}
              style={{ width: `${(row.count / max) * 100}%`, backgroundColor: getStatusColor(row.status) }}
            />
          </div>
        </div>
      ))}
    </Stack>
  );
};

const DepartmentBars: React.FC<{ rows: IDashboardDepartmentBreakdown[] }> = ({ rows }) => {
  const max = Math.max(1, ...rows.map((r) => r.amount));
  return (
    <Stack tokens={{ childrenGap: 8 }}>
      {rows.map((row) => (
        <div key={row.departmentName}>
          <Stack horizontal horizontalAlign="space-between">
            <Text variant="small">{row.departmentName}</Text>
            <Text variant="small">{row.count} &middot; {formatCurrency(row.amount)}</Text>
          </Stack>
          <div className={styles.barTrack}>
            <div className={styles.barFillAccent} style={{ width: `${(row.amount / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </Stack>
  );
};

const MonthTrend: React.FC<{ rows: IDashboardMonthBreakdown[] }> = ({ rows }) => {
  const max = Math.max(1, ...rows.map((r) => r.amount));
  return (
    <Stack horizontal tokens={{ childrenGap: 16 }} className={styles.trendRow}>
      {rows.map((row) => (
        <div className={styles.trendColumn} key={row.month}>
          <Text variant="small" className={styles.trendAmount}>{formatCurrency(row.amount)}</Text>
          <div className={styles.trendBarTrack}>
            <div className={styles.trendBarFill} style={{ height: `${(row.amount / max) * 100}%` }} />
          </div>
          <Text variant="small">{row.month}</Text>
        </div>
      ))}
    </Stack>
  );
};

const DashboardAdmin: React.FC = () => {
  const [departments, setDepartments] = React.useState<IDepartment[]>([]);
  const [departmentId, setDepartmentId] = React.useState<number | undefined>(undefined);
  const [fromDate, setFromDate] = React.useState<string>('');
  const [toDate, setToDate] = React.useState<string>('');
  const [summary, setSummary] = React.useState<IDashboardSummary | undefined>(undefined);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    departmentService.getAll().then(setDepartments).catch(() => { /* dropdown is best-effort */ });
  }, []);

  React.useEffect(() => {
    setLoading(true);
    setError(undefined);
    reportService.getDashboardSummary({ fromDate: fromDate || undefined, toDate: toDate || undefined, departmentId })
      .then((result) => {
        setSummary(result);
        setLoading(false);
      })
      .catch((err: ApiError) => {
        setLoading(false);
        setError(err.message);
      });
  }, [fromDate, toDate, departmentId]);

  const departmentOptions: IDropdownOption[] = [
    { key: ALL_KEY, text: '--All--' },
    ...departments.map((d) => ({ key: d.DepartmentId, text: d.DepartmentName }))
  ];

  return (
    <Stack tokens={{ childrenGap: 12 }}>
      {error && <ErrorMessage message={error} />}
      <Stack horizontal tokens={{ childrenGap: 16 }} verticalAlign="end" wrap className={styles.filterRow}>
        <TextField
          label="From Date"
          type="date"
          value={fromDate}
          onChange={(_e, value) => setFromDate(value || '')}
          styles={{ root: { width: 150 }, fieldGroup: { height: 32 } }}
        />
        <TextField
          label="To Date"
          type="date"
          value={toDate}
          onChange={(_e, value) => setToDate(value || '')}
          styles={{ root: { width: 150 }, fieldGroup: { height: 32 } }}
        />
        <Dropdown
          label="Department"
          selectedKey={departmentId === undefined ? ALL_KEY : departmentId}
          options={departmentOptions}
          onChange={(_e, option) => setDepartmentId(option && option.key !== ALL_KEY ? Number(option.key) : undefined)}
          styles={{ root: { width: 180 }, title: { height: 32, lineHeight: '30px' } }}
        />
      </Stack>

      {loading && !summary ? <LoadingState /> : summary && summary.totalClaims === 0 ? (
        <EmptyState message="No expense claims found." />
      ) : summary && (
        <>
          <Stack horizontal wrap tokens={{ childrenGap: 12 }}>
            <KpiCard label="Total Claims" value={String(summary.totalClaims)} />
            <KpiCard label="Total Amount" value={formatCurrency(summary.totalAmount)} />
            <KpiCard label="Pending Approvals" value={String(summary.pendingApprovalsCount)} />
            <KpiCard label="Awaiting Payment" value={formatCurrency(summary.approvedAwaitingPayment)} />
            <KpiCard label="Reimbursed" value={formatCurrency(summary.reimbursedAmount)} />
            <KpiCard label="Avg Claim" value={formatCurrency(summary.averageClaimAmount)} />
          </Stack>

          <Stack horizontal wrap tokens={{ childrenGap: 12 }}>
            <TableCard title="Claims by Status">
              <div className={styles.panel}><StatusBars rows={summary.byStatus} /></div>
            </TableCard>
            <TableCard title="Claims by Department">
              <div className={styles.panel}><DepartmentBars rows={summary.byDepartment} /></div>
            </TableCard>
          </Stack>

          <TableCard title="Monthly Trend">
            <MonthTrend rows={summary.byMonth} />
          </TableCard>
        </>
      )}
    </Stack>
  );
};

export default DashboardAdmin;
