import * as React from 'react';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
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
import ItemReceipts from '../employee/ItemReceipts';

export interface IAdminClaimDetailProps {
  currentUser: IUser;
  claim: IExpenseClaim;
  onClose: () => void;
}

const AdminClaimDetail: React.FC<IAdminClaimDetailProps> = (props) => {
  const { claim } = props;
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [receipts, setReceipts] = React.useState<IExpenseReceipt[]>([]);

  React.useEffect(() => {
    expenseReceiptService.listByClaim(claim.ExpenseClaimId)
      .then(setReceipts)
      .catch((err: ApiError) => setError(err.message));
  }, [claim.ExpenseClaimId]);

  return (
    <Stack tokens={{ childrenGap: 12 }}>
      {error && <ErrorMessage message={error} />}
      <Stack horizontal tokens={{ childrenGap: 24 }} wrap>
        <Text variant="large">{claim.ClaimNumber}</Text>
        <Text variant="large" styles={{ root: { color: getStatusColor(claim.Status) } }}>{claim.Status}</Text>
      </Stack>
      <Text>Employee: {claim.Employee?.FullName || ''}</Text>
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
              canEdit={false}
              onChanged={() => { /* read-only here -- Admin views receipts, editing stays with the claim owner */ }}
            />
          )}
        />
      </TableCard>

      <ClaimComments claim={claim} currentUser={props.currentUser} />

      <BackButton onClick={props.onClose} />
    </Stack>
  );
};

export default AdminClaimDetail;
