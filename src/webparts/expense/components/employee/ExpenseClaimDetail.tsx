import * as React from 'react';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { expenseService } from '../../../../services/expenseService';
import { expenseReceiptService } from '../../../../services/expenseReceiptService';
import { IExpenseClaim } from '../../../../models/IExpenseClaim';
import { IExpenseReceipt } from '../../../../models/IExpenseReceipt';
import { IUser } from '../../../../models/IUser';
import { ApiError } from '../../../../models/IApiError';
import { formatCurrency } from '../../../../utils/Formatters';
import { getStatusColor } from '../../../../utils/StatusBadge';
import ErrorMessage from '../common/ErrorMessage';
import TableCard from '../common/TableCard';
import ClaimComments from '../common/ClaimComments';
import BackButton from '../common/BackButton';
import ExpenseItemsView from '../common/ExpenseItemsView';
import ItemReceipts from './ItemReceipts';

export interface IExpenseClaimDetailProps {
  context: WebPartContext;
  currentUser: IUser;
  claim: IExpenseClaim;
  onEdit: () => void;
  onChanged: () => void;
  onClose: () => void;
}

const ExpenseClaimDetail: React.FC<IExpenseClaimDetailProps> = (props) => {
  const { claim } = props;
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [submitting, setSubmitting] = React.useState<boolean>(false);
  const [receipts, setReceipts] = React.useState<IExpenseReceipt[]>([]);

  const canEdit = claim.Status === 'Draft' || claim.Status === 'Sent Back';

  const loadReceipts = React.useCallback(() => {
    expenseReceiptService.listByClaim(claim.ExpenseClaimId)
      .then(setReceipts)
      .catch((err: ApiError) => setError(err.message));
  }, [claim.ExpenseClaimId]);

  React.useEffect(() => { loadReceipts(); }, [loadReceipts]);

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
        <ExpenseItemsView
          items={claim.Items || []}
          renderExtra={(item) => (
            <ItemReceipts
              currentUser={props.currentUser}
              claim={claim}
              item={item}
              receipts={receipts.filter((r) => r.ExpenseItemId === item.ExpenseItemId)}
              canEdit={canEdit}
              onChanged={loadReceipts}
            />
          )}
        />
      </TableCard>

      <ClaimComments claim={claim} currentUser={props.currentUser} />

      {canEdit && (
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          <DefaultButton text="Edit" onClick={props.onEdit} />
          <PrimaryButton text="Submit" onClick={submit} disabled={submitting || !(claim.Items && claim.Items.length)} />
        </Stack>
      )}

      <BackButton onClick={props.onClose} />
    </Stack>
  );
};

export default ExpenseClaimDetail;
