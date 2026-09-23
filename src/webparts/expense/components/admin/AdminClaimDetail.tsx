import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { IExpenseClaim } from '../../../../models/IExpenseClaim';
import { IExpenseItem } from '../../../../models/IExpenseItem';
import { IUser } from '../../../../models/IUser';
import { formatCurrency, formatDate } from '../../../../utils/Formatters';
import { getStatusColor } from '../../../../utils/StatusBadge';
import TableCard from '../common/TableCard';
import ClaimComments from '../common/ClaimComments';

export interface IAdminClaimDetailProps {
  currentUser: IUser;
  claim: IExpenseClaim;
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
        <DetailsList
          items={claim.Items || []}
          columns={itemColumns}
          layoutMode={DetailsListLayoutMode.justified}
          selectionMode={SelectionMode.none}
        />
      </TableCard>

      <ClaimComments claim={claim} currentUser={props.currentUser} />

      <DefaultButton text="Back" onClick={props.onClose} styles={{ root: { alignSelf: 'flex-start' } }} />
    </Stack>
  );
};

export default AdminClaimDetail;
