import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { IconButton } from '@fluentui/react/lib/Button';
import { Text } from '@fluentui/react/lib/Text';
import { expenseService } from '../../../../services/expenseService';
import { approvalService } from '../../../../services/approvalService';
import { IExpenseClaim } from '../../../../models/IExpenseClaim';
import { IPendingApproval } from '../../../../models/IApproval';
import { IUser } from '../../../../models/IUser';
import { ApiError } from '../../../../models/IApiError';
import { formatCurrency } from '../../../../utils/Formatters';
import { getStatusColor } from '../../../../utils/StatusBadge';
import LoadingState from '../common/LoadingState';
import ErrorMessage from '../common/ErrorMessage';
import EmptyState from '../common/EmptyState';
import TableCard from '../common/TableCard';
import PaginationControls from '../common/PaginationControls';
import { usePagination } from '../common/usePagination';
import ApprovalClaimDetail from './ApprovalClaimDetail';

export interface IMyApprovalsProps {
  currentUser: IUser;
}

const MyApprovals: React.FC<IMyApprovalsProps> = (props) => {
  const [selectedSummary, setSelectedSummary] = React.useState<IPendingApproval | undefined>(undefined);
  const [selectedClaim, setSelectedClaim] = React.useState<IExpenseClaim | undefined>(undefined);
  const [actionError, setActionError] = React.useState<string | undefined>(undefined);

  const fetchPage = React.useCallback(
    (page: number, pageSize: number) => approvalService.getPendingPage(props.currentUser.UserId, page, pageSize),
    [props.currentUser.UserId]
  );
  const pagination = usePagination(fetchPage);

  const openView = (item: IPendingApproval): void => {
    setActionError(undefined);
    expenseService.getById(item.ExpenseClaimId)
      .then((full) => {
        setSelectedSummary(item);
        setSelectedClaim(full);
      })
      .catch((err: ApiError) => setActionError(err.message));
  };

  const closeView = (): void => {
    setSelectedSummary(undefined);
    setSelectedClaim(undefined);
  };

  if (selectedSummary && selectedClaim) {
    return (
      <ApprovalClaimDetail
        currentUser={props.currentUser}
        claim={selectedClaim}
        approvalSummary={selectedSummary}
        onActionComplete={() => { closeView(); pagination.reload(); }}
        onClose={closeView}
      />
    );
  }

  const columns: IColumn[] = [
    { key: 'claimNumber', name: 'Claim #', fieldName: 'ClaimNumber', minWidth: 130, isResizable: true },
    { key: 'employee', name: 'Employee', fieldName: 'EmployeeName', minWidth: 150, isResizable: true },
    { key: 'department', name: 'Department', fieldName: 'DepartmentName', minWidth: 130, isResizable: true },
    {
      key: 'amount', name: 'Amount', minWidth: 100,
      onRender: (item: IPendingApproval) => formatCurrency(item.TotalAmount)
    },
    {
      key: 'status', name: 'Status', minWidth: 150,
      onRender: (item: IPendingApproval) => <Text styles={{ root: { color: getStatusColor(item.Status) } }}>{item.Status}</Text>
    },
    {
      key: 'actions', name: '', minWidth: 60,
      onRender: (item: IPendingApproval) => (
        <IconButton iconProps={{ iconName: 'RedEye' }} title="View" ariaLabel="View" onClick={() => openView(item)} />
      )
    }
  ];

  return (
    <div>
      {(pagination.error || actionError) && <ErrorMessage message={pagination.error || actionError || ''} />}
      <TableCard>
        {pagination.loading && pagination.pageItems.length === 0 ? <LoadingState /> : pagination.totalCount === 0 ? (
          <EmptyState message="No claims found" />
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
    </div>
  );
};

export default MyApprovals;
