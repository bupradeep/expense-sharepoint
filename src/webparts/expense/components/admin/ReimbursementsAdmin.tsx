import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { TextField } from '@fluentui/react/lib/TextField';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { Pivot, PivotItem } from '@fluentui/react/lib/Pivot';
import { expenseService } from '../../../../services/expenseService';
import { reimbursementService } from '../../../../services/reimbursementService';
import { IExpenseClaim } from '../../../../models/IExpenseClaim';
import { IReimbursement, IPaymentDto } from '../../../../models/IReimbursement';
import { IUser } from '../../../../models/IUser';
import { ApiError } from '../../../../models/IApiError';
import { formatCurrency, formatDate } from '../../../../utils/Formatters';
import LoadingState from '../common/LoadingState';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import TableCard from '../common/TableCard';
import FormRow from '../common/FormRow';
import PaginationControls from '../common/PaginationControls';
import { usePagination } from '../common/usePagination';

export interface IReimbursementsAdminProps {
  currentUser: IUser;
}

const emptyPaymentForm: IPaymentDto = { processedBy: 0, paymentMethod: 'Bank Transfer' };

const ReimbursementsAdmin: React.FC<IReimbursementsAdminProps> = (props) => {
  const [payingClaim, setPayingClaim] = React.useState<IExpenseClaim | undefined>(undefined);
  const [form, setForm] = React.useState<IPaymentDto>(emptyPaymentForm);
  const [saving, setSaving] = React.useState<boolean>(false);
  const [formError, setFormError] = React.useState<string | undefined>(undefined);

  const [historyFromDate, setHistoryFromDate] = React.useState<string>('');
  const [historyToDate, setHistoryToDate] = React.useState<string>('');
  const [historyClaimNumber, setHistoryClaimNumber] = React.useState<string>('');

  const fetchPending = React.useCallback(
    (page: number, pageSize: number) => expenseService.listPage({ status: 'Approved' }, page, pageSize),
    []
  );
  const pendingPagination = usePagination(fetchPending);

  const fetchHistory = React.useCallback(
    (page: number, pageSize: number) =>
      reimbursementService.listPage(
        {
          fromDate: historyFromDate || undefined,
          toDate: historyToDate || undefined,
          claimNumber: historyClaimNumber || undefined
        },
        page,
        pageSize
      ),
    [historyFromDate, historyToDate, historyClaimNumber]
  );
  const historyPagination = usePagination(fetchHistory);

  const openPay = (claim: IExpenseClaim): void => {
    setPayingClaim(claim);
    setForm({ processedBy: props.currentUser.UserId, paymentMethod: 'Bank Transfer', paymentAmount: claim.TotalAmount });
    setFormError(undefined);
  };

  const pay = (): void => {
    if (!payingClaim) {
      return;
    }
    setSaving(true);
    setFormError(undefined);
    reimbursementService.pay(payingClaim.ExpenseClaimId, form)
      .then(() => {
        setSaving(false);
        setPayingClaim(undefined);
        pendingPagination.reload();
        historyPagination.reload();
      })
      .catch((err: ApiError) => {
        setSaving(false);
        setFormError(err.message);
      });
  };

  if (payingClaim) {
    return (
      <TableCard title={`Mark Claim ${payingClaim.ClaimNumber} as Paid`}>
        <Stack tokens={{ childrenGap: 12 }}>
          {formError && <ErrorMessage message={formError} />}
          <FormRow label="Payment Amount">
            <TextField
              type="number"
              value={form.paymentAmount !== undefined ? String(form.paymentAmount) : ''}
              onChange={(_e, value) => setForm({ ...form, paymentAmount: value ? Number(value) : undefined })}
            />
          </FormRow>
          <FormRow label="Payment Method">
            <TextField
              value={form.paymentMethod}
              onChange={(_e, value) => setForm({ ...form, paymentMethod: value || '' })}
            />
          </FormRow>
          <FormRow label="Payment Reference">
            <TextField
              value={form.paymentReference}
              onChange={(_e, value) => setForm({ ...form, paymentReference: value || '' })}
            />
          </FormRow>
          <FormRow label="Transaction Reference">
            <TextField
              value={form.transactionReference}
              onChange={(_e, value) => setForm({ ...form, transactionReference: value || '' })}
            />
          </FormRow>
          <FormRow label="Remarks">
            <TextField
              multiline
              value={form.paymentRemarks}
              onChange={(_e, value) => setForm({ ...form, paymentRemarks: value || '' })}
            />
          </FormRow>
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            <PrimaryButton text="Confirm Payment" onClick={pay} disabled={saving} />
            <DefaultButton text="Cancel" onClick={() => setPayingClaim(undefined)} />
          </Stack>
        </Stack>
      </TableCard>
    );
  }

  const pendingColumns: IColumn[] = [
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
      key: 'actions', name: '', minWidth: 140,
      onRender: (item: IExpenseClaim) => <DefaultButton text="Mark as Paid" onClick={() => openPay(item)} />
    }
  ];

  const historyColumns: IColumn[] = [
    {
      key: 'claimNumber', name: 'Claim #', minWidth: 120,
      onRender: (item: IReimbursement) => item.ExpenseClaim?.ClaimNumber || ''
    },
    {
      key: 'amount', name: 'Amount Paid', minWidth: 100,
      onRender: (item: IReimbursement) => formatCurrency(item.PaymentAmount)
    },
    { key: 'method', name: 'Method', fieldName: 'PaymentMethod', minWidth: 120 },
    { key: 'reference', name: 'Reference', fieldName: 'PaymentReference', minWidth: 140 },
    {
      key: 'date', name: 'Payment Date', minWidth: 110,
      onRender: (item: IReimbursement) => formatDate(item.PaymentDate)
    },
    { key: 'status', name: 'Status', fieldName: 'Status', minWidth: 100 }
  ];

  return (
    <div>
      <Pivot>
        <PivotItem headerText="Awaiting Payment">
          {pendingPagination.error && <ErrorMessage message={pendingPagination.error} />}
          <TableCard>
            {pendingPagination.loading && pendingPagination.pageItems.length === 0 ? <LoadingState /> : pendingPagination.totalCount === 0 ? (
              <EmptyState message="No claims awaiting payment." />
            ) : (
              <>
                <DetailsList
                  items={pendingPagination.pageItems}
                  columns={pendingColumns}
                  layoutMode={DetailsListLayoutMode.justified}
                  selectionMode={SelectionMode.none}
                />
                <PaginationControls
                  page={pendingPagination.page}
                  pageSize={pendingPagination.pageSize}
                  totalPages={pendingPagination.totalPages}
                  totalCount={pendingPagination.totalCount}
                  loading={pendingPagination.loading}
                  onPageChange={pendingPagination.setPage}
                  onPageSizeChange={pendingPagination.setPageSize}
                />
              </>
            )}
          </TableCard>
        </PivotItem>
        <PivotItem headerText="Payment History">
          {historyPagination.error && <ErrorMessage message={historyPagination.error} />}
          <Stack horizontal tokens={{ childrenGap: 12 }} verticalAlign="end" wrap styles={{ root: { marginTop: 12 } }}>
            <TextField
              label="From Date"
              type="date"
              value={historyFromDate}
              onChange={(_e, value) => { setHistoryFromDate(value || ''); historyPagination.setPage(1); }}
              styles={{ root: { width: 150, marginTop: 6 } }}
            />
            <TextField
              label="To Date"
              type="date"
              value={historyToDate}
              onChange={(_e, value) => { setHistoryToDate(value || ''); historyPagination.setPage(1); }}
              styles={{ root: { width: 150, marginTop: 6 } }}
            />
            <TextField
              label="Claim Number"
              placeholder="Search claim #"
              value={historyClaimNumber}
              onChange={(_e, value) => { setHistoryClaimNumber(value || ''); historyPagination.setPage(1); }}
              styles={{ root: { width: 180 } }}
            />
          </Stack>
          <TableCard>
            {historyPagination.loading && historyPagination.pageItems.length === 0 ? <LoadingState /> : historyPagination.totalCount === 0 ? (
              <EmptyState message="No payment history found." />
            ) : (
              <>
                <DetailsList
                  items={historyPagination.pageItems}
                  columns={historyColumns}
                  layoutMode={DetailsListLayoutMode.justified}
                  selectionMode={SelectionMode.none}
                />
                <PaginationControls
                  page={historyPagination.page}
                  pageSize={historyPagination.pageSize}
                  totalPages={historyPagination.totalPages}
                  totalCount={historyPagination.totalCount}
                  loading={historyPagination.loading}
                  onPageChange={historyPagination.setPage}
                  onPageSizeChange={historyPagination.setPageSize}
                />
              </>
            )}
          </TableCard>
        </PivotItem>
      </Pivot>
    </div>
  );
};

export default ReimbursementsAdmin;
