import * as React from 'react';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { IExpenseClaim } from '../../../../models/IExpenseClaim';
import { IUser } from '../../../../models/IUser';
import { formatCurrency } from '../../../../utils/Formatters';
import { getStatusColor } from '../../../../utils/StatusBadge';
import TableCard from '../common/TableCard';
import ClaimComments from '../common/ClaimComments';
import BackButton from '../common/BackButton';
import ExpenseItemsView from '../common/ExpenseItemsView';

export interface IAdminClaimDetailProps {
  currentUser: IUser;
  claim: IExpenseClaim;
  onClose: () => void;
}

const AdminClaimDetail: React.FC<IAdminClaimDetailProps> = (props) => {
  const { claim } = props;

  return (
    <Stack tokens={{ childrenGap: 12 }}>
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
        <ExpenseItemsView items={claim.Items || []} />
      </TableCard>

      <ClaimComments claim={claim} currentUser={props.currentUser} />

      <BackButton onClick={props.onClose} />
    </Stack>
  );
};

export default AdminClaimDetail;
