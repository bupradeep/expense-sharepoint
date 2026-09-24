import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { IconButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { expenseService } from '../../../../services/expenseService';
import { IExpenseClaim } from '../../../../models/IExpenseClaim';
import { IUser } from '../../../../models/IUser';
import { ApiError } from '../../../../models/IApiError';
import { formatCurrency, formatDate } from '../../../../utils/Formatters';
import { getStatusColor } from '../../../../utils/StatusBadge';
import LoadingState from '../common/LoadingState';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import ConfirmDialog from '../common/ConfirmDialog';
import TableCard from '../common/TableCard';
import ActiveToggle from '../common/ActiveToggle';
import ListToolbar from '../common/ListToolbar';
import PaginationControls from '../common/PaginationControls';
import { usePagination } from '../common/usePagination';
import ExpenseClaimForm from './ExpenseClaimForm';
import ExpenseClaimDetail from './ExpenseClaimDetail';

export interface IMyExpensesProps {
  context: WebPartContext;
  currentUser: IUser;
}

type View = 'list' | 'create' | 'edit' | 'detail';

const MyExpenses: React.FC<IMyExpensesProps> = (props) => {
  const [view, setView] = React.useState<View>('list');
  const [selectedClaim, setSelectedClaim] = React.useState<IExpenseClaim | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = React.useState<IExpenseClaim | undefined>(undefined);
  const [actionError, setActionError] = React.useState<string | undefined>(undefined);
  const [showDeleted, setShowDeleted] = React.useState<boolean>(false);

  const fetchPage = React.useCallback(
    (page: number, pageSize: number) =>
      expenseService.listPage(
        { employeeId: props.currentUser.UserId, excludeDeleted: !showDeleted },
        page,
        pageSize
      ),
    [props.currentUser.UserId, showDeleted]
  );
  const pagination = usePagination(fetchPage);

  const openDetail = (claim: IExpenseClaim): void => {
    expenseService.getById(claim.ExpenseClaimId)
      .then((full) => {
        setSelectedClaim(full);
        setView('detail');
      })
      .catch((err: ApiError) => setActionError(err.message));
  };

  const openEdit = (claim: IExpenseClaim): void => {
    expenseService.getById(claim.ExpenseClaimId)
      .then((full) => {
        setSelectedClaim(full);
        setView('edit');
      })
      .catch((err: ApiError) => setActionError(err.message));
  };

  const remove = (): void => {
    if (!deleteTarget) {
      return;
    }
    expenseService.remove(deleteTarget.ExpenseClaimId, props.currentUser.UserId)
      .then(() => {
        setDeleteTarget(undefined);
        pagination.reload();
      })
      .catch((err: ApiError) => {
        setDeleteTarget(undefined);
        setActionError(err.message);
      });
  };

  if (view === 'create') {
    return (
      <ExpenseClaimForm
        context={props.context}
        currentUser={props.currentUser}
        onSaved={() => { setView('list'); pagination.reload(); }}
        onCancel={() => setView('list')}
      />
    );
  }

  if (view === 'edit' && selectedClaim) {
    return (
      <ExpenseClaimForm
        context={props.context}
        currentUser={props.currentUser}
        existingClaim={selectedClaim}
        onSaved={(claim) => { setSelectedClaim(claim); setView('detail'); pagination.reload(); }}
        onCancel={() => setView('detail')}
      />
    );
  }

  if (view === 'detail' && selectedClaim) {
    return (
      <ExpenseClaimDetail
        context={props.context}
        currentUser={props.currentUser}
        claim={selectedClaim}
        onEdit={() => setView('edit')}
        onChanged={() => { openDetail(selectedClaim); pagination.reload(); }}
        onClose={() => { setView('list'); pagination.reload(); }}
      />
    );
  }

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
      key: 'actions', name: '', minWidth: 130,
      onRender: (item: IExpenseClaim) => (
        <Stack horizontal tokens={{ childrenGap: 4 }}>
          <IconButton iconProps={{ iconName: 'RedEye' }} title="View" ariaLabel="View" onClick={() => openDetail(item)} />
          {item.Status === 'Draft' && (
            <>
              <IconButton iconProps={{ iconName: 'Edit' }} title="Edit" ariaLabel="Edit" onClick={() => openEdit(item)} />
              <IconButton iconProps={{ iconName: 'Delete' }} title="Delete" ariaLabel="Delete" onClick={() => setDeleteTarget(item)} />
            </>
          )}
        </Stack>
      )
    }
  ];

  return (
    <div>
      <ListToolbar
        buttonText="New Claim"
        onButtonClick={() => setView('create')}
        endContent={(
          <ActiveToggle
            inlineLabel
            label="Show deleted"
            checked={showDeleted}
            onChange={(_e, checked) => { setShowDeleted(!!checked); pagination.setPage(1); }}
          />
        )}
      />
      {(pagination.error || actionError) && <ErrorMessage message={pagination.error || actionError || ''} />}
      <TableCard>
        {pagination.loading && pagination.pageItems.length === 0 ? <LoadingState /> : pagination.totalCount === 0 ? (
          <EmptyState message="No expense claims found." />
        ) : (
          <>
            <DetailsList
              items={pagination.pageItems}
              columns={columns}
              layoutMode={DetailsListLayoutMode.justified}
              selectionMode={SelectionMode.none}
            />
            <PaginationControls
              page={pagination.page}
              pageSize={pagination.pageSize}
              totalPages={pagination.totalPages}
              totalCount={pagination.totalCount}
              loading={pagination.loading}
              onPageChange={pagination.setPage}
              onPageSizeChange={pagination.setPageSize}
            />
          </>
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
