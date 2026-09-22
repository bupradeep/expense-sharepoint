import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { expenseService } from '../../../../services/expenseService';
import { IExpenseClaim } from '../../../../models/IExpenseClaim';
import { IExpenseItem } from '../../../../models/IExpenseItem';
import { IUser } from '../../../../models/IUser';
import { ApiError } from '../../../../models/IApiError';
import { formatCurrency, formatDate } from '../../../../utils/Formatters';
import { getStatusColor } from '../../../../utils/StatusBadge';
import ErrorMessage from '../common/ErrorMessage';
import TableCard from '../common/TableCard';

export interface IExpenseClaimDetailProps {
  currentUser: IUser;
  claim: IExpenseClaim;
  onEdit: () => void;
  onChanged: () => void;
  onClose: () => void;
}

const itemColumns: IColumn[] = [
  {
    key: 'category', name: 'Category', minWidth: 120,
    onRender: (item: IExpenseItem) => item.ExpenseCategory?.CategoryName || ''
  },
  {
    key: 'date', name: 'Date', minWidth: 100,
    onRender: (item: IExpenseItem) => formatDate(item.ExpenseDate)
  },
  {
    key: 'amount', name: 'Amount', minWidth: 100,
    onRender: (item: IExpenseItem) => formatCurrency(item.Amount)
  },
  { key: 'merchant', name: 'Merchant', fieldName: 'MerchantName', minWidth: 140 },
  { key: 'description', name: 'Description', fieldName: 'Description', minWidth: 180 }
];

const ExpenseClaimDetail: React.FC<IExpenseClaimDetailProps> = (props) => {
  const { claim } = props;
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = React.useState<boolean>(false);

  const canEdit = claim.Status === 'Draft' || claim.Status === 'Sent Back';

  const submit = (): void => {
    setSubmitting(true);
    setError(undefined);
    expenseService.submit(claim.ExpenseClaimId, props.currentUser.UserId)
      .then(() => {
        setSubmitting(false);
        props.onChanged();
      })
      .catch((err: ApiError) => {
        setSubmitting(false);
        setError(err.message);
      });
  };

  return (
    <Stack tokens={{ childrenGap: 12 }}>
      {error && <ErrorMessage message={error} />}
      <Stack horizontal tokens={{ childrenGap: 24 }} wrap>
        <Text variant="large">{claim.ClaimNumber}</Text>
        <Text variant="large" styles={{ root: { color: getStatusColor(claim.Status) } }}>{claim.Status}</Text>
      </Stack>
      <Text>Business Purpose: {claim.BusinessPurpose}</Text>
      <Text>Department: {claim.Department?.DepartmentName || ''}</Text>
      <Text>Project: {claim.Project?.ProjectName || ''}</Text>
      <Text>Total Amount: {formatCurrency(claim.TotalAmount)}</Text>
      {claim.Location && <Text>Location: {claim.Location}</Text>}
      {claim.Remarks && <Text>Remarks: {claim.Remarks}</Text>}

      <TableCard title="Expense Items">
        <DetailsList
          items={claim.Items || []}
          columns={itemColumns}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
        />
      </TableCard>

      <Stack horizontal tokens={{ childrenGap: 8 }}>
        {canEdit && <DefaultButton text="Edit" onClick={props.onEdit} />}
        {canEdit && <PrimaryButton text="Submit" onClick={submit} disabled={submitting || !(claim.Items && claim.Items.length)} />}
        <DefaultButton text="Back" onClick={props.onClose} />
      </Stack>
    </Stack>
  );
};

export default ExpenseClaimDetail;
