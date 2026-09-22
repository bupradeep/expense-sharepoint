import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
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
import TableCard from '../common/TableCard';

export interface IReimbursementsAdminProps {
  currentUser: IUser;
}

const emptyPaymentForm: IPaymentDto = { processedBy: 0, paymentMethod: 'Bank Transfer' };

const ReimbursementsAdmin: React.FC<IReimbursementsAdminProps> = (props) => {
  const [pending, setPending] = React.useState<IExpenseClaim[] | undefined>(undefined);
  const [history, setHistory] = React.useState<IReimbursement[] | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [panelClaim, setPanelClaim] = React.useState<IExpenseClaim | undefined>(undefined);
  const [form, setForm] = React.useState<IPaymentDto>(emptyPaymentForm);
  const [saving, setSaving] = React.useState<boolean>(false);
  const [formError, setFormError] = React.useState<string | undefined>(undefined);

  const load = React.useCallback(() => {
    setError(undefined);
    expenseService.list({ status: 'Approved' })
      .then(setPending)
      .catch((err: ApiError) => setError(err.message));
    reimbursementService.listAll()
      .then(setHistory)
      .catch((err: ApiError) => setError(err.message));
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const openPay = (claim: IExpenseClaim): void => {
    setPanelClaim(claim);
    setForm({ processedBy: props.currentUser.UserId, paymentMethod: 'Bank Transfer', paymentAmount: claim.TotalAmount });
    setFormError(undefined);
  };

  const pay = (): void => {
    if (!panelClaim) {
      return;
    }
    setSaving(true);
    setFormError(undefined);
    reimbursementService.pay(panelClaim.ExpenseClaimId, form)
      .then(() => {
        setSaving(false);
        setPanelClaim(undefined);
        load();
      })
      .catch((err: ApiError) => {
        setSaving(false);
        setFormError(err.message);
      });
  };

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
    { key: 'claimId', name: 'Claim Id', fieldName: 'ExpenseClaimId', minWidth: 80 },
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
      {error && <ErrorMessage message={error} />}
      <Pivot>
        <PivotItem headerText="Awaiting Payment">
          <TableCard>
            {!pending ? <LoadingState /> : (
              <DetailsList
                items={pending}
                columns={pendingColumns}
                layoutMode={DetailsListLayoutMode.justified}
                selectionMode={SelectionMode.none}
              />
            )}
          </TableCard>
        </PivotItem>
        <PivotItem headerText="Payment History">
          <TableCard>
            {!history ? <LoadingState /> : (
              <DetailsList
                items={history}
                columns={historyColumns}
                layoutMode={DetailsListLayoutMode.justified}
                selectionMode={SelectionMode.none}
              />
            )}
          </TableCard>
        </PivotItem>
      </Pivot>

      <Panel
        isOpen={!!panelClaim}
        onDismiss={() => setPanelClaim(undefined)}
        type={PanelType.smallFixedFar}
        headerText={`Mark Claim ${panelClaim?.ClaimNumber || ''} as Paid`}
      >
        <Stack tokens={{ childrenGap: 12 }}>
          {formError && <ErrorMessage message={formError} />}
          <TextField
            label="Payment Amount"
            type="number"
            value={form.paymentAmount !== undefined ? String(form.paymentAmount) : ''}
            onChange={(_e, value) => setForm({ ...form, paymentAmount: value ? Number(value) : undefined })}
          />
          <TextField
            label="Payment Method"
            value={form.paymentMethod}
            onChange={(_e, value) => setForm({ ...form, paymentMethod: value || '' })}
          />
          <TextField
            label="Payment Reference"
            value={form.paymentReference}
            onChange={(_e, value) => setForm({ ...form, paymentReference: value || '' })}
          />
          <TextField
            label="Transaction Reference"
            value={form.transactionReference}
            onChange={(_e, value) => setForm({ ...form, transactionReference: value || '' })}
          />
          <TextField
            label="Remarks"
            multiline
            value={form.paymentRemarks}
            onChange={(_e, value) => setForm({ ...form, paymentRemarks: value || '' })}
          />
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            <PrimaryButton text="Confirm Payment" onClick={pay} disabled={saving} />
            <DefaultButton text="Cancel" onClick={() => setPanelClaim(undefined)} />
          </Stack>
        </Stack>
      </Panel>
    </div>
  );
};

export default ReimbursementsAdmin;
