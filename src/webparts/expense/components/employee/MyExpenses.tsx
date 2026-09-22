import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { CommandBar, ICommandBarItemProps } from '@fluentui/react/lib/CommandBar';
import { IconButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { expenseService } from '../../../../services/expenseService';
import { IExpenseClaim } from '../../../../models/IExpenseClaim';
import { IUser } from '../../../../models/IUser';
import { ApiError } from '../../../../models/IApiError';
import { formatCurrency, formatDate } from '../../../../utils/Formatters';
import { getStatusColor } from '../../../../utils/StatusBadge';
import LoadingState from '../common/LoadingState';
import ErrorMessage from '../common/ErrorMessage';
import ConfirmDialog from '../common/ConfirmDialog';
import TableCard from '../common/TableCard';
import ExpenseClaimForm from './ExpenseClaimForm';
import ExpenseClaimDetail from './ExpenseClaimDetail';

export interface IMyExpensesProps {
  currentUser: IUser;
}

type View = 'list' | 'create' | 'edit' | 'detail';

const MyExpenses: React.FC<IMyExpensesProps> = (props) => {
  const [claims, setClaims] = React.useState<IExpenseClaim[] | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [view, setView] = React.useState<View>('list');
  const [selectedClaim, setSelectedClaim] = React.useState<IExpenseClaim | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<IExpenseClaim | undefined>(undefined);

  const load = React.useCallback(() => {
    setError(undefined);
    expenseService.list({ employeeId: props.currentUser.UserId })
      .then(setClaims)
      .catch((err: ApiError) => setError(err.message));
  }, [props.currentUser.UserId]);

  React.useEffect(() => { load(); }, [load]);

  const openDetail = (claim: IExpenseClaim): void => {
    expenseService.getById(claim.ExpenseClaimId)
      .then((full) => {
        setSelectedClaim(full);
        setView('detail');
      })
      .catch((err: ApiError) => setError(err.message));
  };

  const remove = (): void => {
    if (!deleteTarget) {
      return;
    }
    expenseService.remove(deleteTarget.ExpenseClaimId, props.currentUser.UserId)
      .then(() => {
        setDeleteTarget(undefined);
        load();
      })
      .catch((err: ApiError) => {
        setDeleteTarget(undefined);
        setError(err.message);
      });
  };

  if (view === 'create') {
    return (
      <ExpenseClaimForm
        currentUser={props.currentUser}
        onSaved={() => { setView('list'); load(); }}
        onCancel={() => setView('list')}
      />
    );
  }

  if (view === 'edit' && selectedClaim) {
    return (
      <ExpenseClaimForm
        currentUser={props.currentUser}
        existingClaim={selectedClaim}
        onSaved={(claim) => { setSelectedClaim(claim); setView('detail'); load(); }}
        onCancel={() => setView('detail')}
      />
    );
  }

  if (view === 'detail' && selectedClaim) {
    return (
      <ExpenseClaimDetail
        currentUser={props.currentUser}
        claim={selectedClaim}
        onEdit={() => setView('edit')}
        onChanged={() => { openDetail(selectedClaim); load(); }}
        onClose={() => { setView('list'); load(); }}
      />
    );
  }

  const commandBarItems: ICommandBarItemProps[] = [
    { key: 'new', text: 'New Claim', iconProps: { iconName: 'Add' }, onClick: () => setView('create') }
  ];

  const columns: IColumn[] = [
    { key: 'claimNumber', name: 'Claim #', fieldName: 'ClaimNumber', minWidth: 140, isResizable: true },
    {
      key: 'date', name: 'Date', minWidth: 100,
      onRender: (item: IExpenseClaim) => formatDate(item.ClaimDate)
    },
    { key: 'purpose', name: 'Business Purpose', fieldName: 'BusinessPurpose', minWidth: 200, isResizable: true },
    {
      key: 'amount', name: 'Amount', minWidth: 100,
      onRender: (item: IExpenseClaim) => formatCurrency(item.TotalAmount)
    },
    {
      key: 'status', name: 'Status', minWidth: 130,
      onRender: (item: IExpenseClaim) => <Text styles={{ root: { color: getStatusColor(item.Status) } }}>{item.Status}</Text>
    },
    {
      key: 'actions', name: '', minWidth: 90,
      onRender: (item: IExpenseClaim) => (
        <Stack horizontal tokens={{ childrenGap: 4 }}>
          <IconButton iconProps={{ iconName: 'RedEye' }} title="View" ariaLabel="View" onClick={() => openDetail(item)} />
          {item.Status === 'Draft' && (
            <IconButton iconProps={{ iconName: 'Delete' }} title="Delete" ariaLabel="Delete" onClick={() => setDeleteTarget(item)} />
          )}
        </Stack>
      )
    }
  ];

  return (
    <div>
      <CommandBar items={commandBarItems} />
      {error && <ErrorMessage message={error} />}
      <TableCard>
        {!claims ? <LoadingState /> : (
          <DetailsList
            items={claims}
            columns={columns}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
          />
        )}
      </TableCard>

      <ConfirmDialog
        hidden={!deleteTarget}
        title="Delete Claim"
        subText={`Are you sure you want to delete claim "${deleteTarget?.ClaimNumber}"?`}
        confirmButtonText="Delete"
        onConfirm={remove}
        onDismiss={() => setDeleteTarget(undefined)}
      />
    </div>
  );
};

export default MyExpenses;
