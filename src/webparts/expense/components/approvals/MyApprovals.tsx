import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { TextField } from '@fluentui/react/lib/TextField';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { approvalService } from '../../../../services/approvalService';
import { IPendingApproval } from '../../../../models/IApproval';
import { IUser } from '../../../../models/IUser';
import { ApiError } from '../../../../models/IApiError';
import { formatCurrency, formatDate } from '../../../../utils/Formatters';
import LoadingState from '../common/LoadingState';
import ErrorMessage from '../common/ErrorMessage';
import TableCard from '../common/TableCard';
import FormRow from '../common/FormRow';
import PaginationControls from '../common/PaginationControls';
import { usePagination } from '../common/usePagination';

export interface IMyApprovalsProps {
  currentUser: IUser;
}

type ActionType = 'approve' | 'reject' | 'sendBack';

interface IPendingAction {
  claim: IPendingApproval;
  action: ActionType;
}

const actionLabels: { [K in ActionType]: string } = {
  approve: 'Approve',
  reject: 'Reject',
  sendBack: 'Send Back'
};

const actionRequests: { [K in ActionType]: typeof approvalService.approve } = {
  approve: approvalService.approve,
  reject: approvalService.reject,
  sendBack: approvalService.sendBack
};

const MyApprovals: React.FC<IMyApprovalsProps> = (props) => {
  const [pendingAction, setPendingAction] = React.useState<IPendingAction | undefined>(undefined);
  const [comments, setComments] = React.useState<string>('');
  const [saving, setSaving] = React.useState<boolean>(false);
  const [formError, setFormError] = React.useState<string | undefined>(undefined);

  const fetchPage = React.useCallback(
    (page: number, pageSize: number) => approvalService.getPendingPage(props.currentUser.UserId, page, pageSize),
    [props.currentUser.UserId]
  );
  const pagination = usePagination(fetchPage);

  const openAction = (claim: IPendingApproval, action: ActionType): void => {
    setPendingAction({ claim, action });
    setComments('');
    setFormError(undefined);
  };

  const commentsRequired = pendingAction?.action === 'reject' || pendingAction?.action === 'sendBack';

  const confirmAction = (): void => {
    if (!pendingAction) {
      return;
    }
    if (commentsRequired && !comments) {
      setFormError('Comments are required.');
      return;
    }

    setSaving(true);
    setFormError(undefined);

    const dto = {
      approverId: props.currentUser.UserId,
      approvalLevel: pendingAction.claim.ApprovalLevel,
      comments: comments || undefined
    };

    const sendAction = actionRequests[pendingAction.action];

    sendAction(pendingAction.claim.ExpenseClaimId, dto)
      .then(() => {
        setSaving(false);
        setPendingAction(undefined);
        pagination.reload();
      })
      .catch((err: ApiError) => {
        setSaving(false);
        setFormError(err.message);
      });
  };

  if (pendingAction) {
    return (
      <TableCard title={`${actionLabels[pendingAction.action]} ${pendingAction.claim.ClaimNumber}`}>
        <Stack tokens={{ childrenGap: 12 }}>
          {formError && <ErrorMessage message={formError} />}
          <FormRow label="Comments" required={commentsRequired}>
            <TextField
              multiline
              value={comments}
              onChange={(_e, value) => setComments(value || '')}
            />
          </FormRow>
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            <PrimaryButton
              text={actionLabels[pendingAction.action]}
              onClick={confirmAction}
              disabled={saving}
            />
            <DefaultButton text="Cancel" onClick={() => setPendingAction(undefined)} />
          </Stack>
        </Stack>
      </TableCard>
    );
  }

  const columns: IColumn[] = [
    { key: 'claimNumber', name: 'Claim #', fieldName: 'ClaimNumber', minWidth: 130, isResizable: true },
    { key: 'employee', name: 'Employee', fieldName: 'EmployeeName', minWidth: 140, isResizable: true },
    { key: 'department', name: 'Department', fieldName: 'DepartmentName', minWidth: 120, isResizable: true },
    { key: 'purpose', name: 'Business Purpose', fieldName: 'BusinessPurpose', minWidth: 180, isResizable: true },
    {
      key: 'amount', name: 'Amount', minWidth: 100,
      onRender: (item: IPendingApproval) => formatCurrency(item.TotalAmount)
    },
    {
      key: 'submitted', name: 'Submitted', minWidth: 100,
      onRender: (item: IPendingApproval) => formatDate(item.SubmittedAt)
    },
    { key: 'status', name: 'Status', fieldName: 'Status', minWidth: 130 },
    {
      key: 'actions', name: '', minWidth: 260,
      onRender: (item: IPendingApproval) => (
        <Stack horizontal tokens={{ childrenGap: 8 }}>
          <PrimaryButton text="Approve" onClick={() => openAction(item, 'approve')} />
          <DefaultButton text="Reject" onClick={() => openAction(item, 'reject')} />
          <DefaultButton text="Send Back" onClick={() => openAction(item, 'sendBack')} />
        </Stack>
      )
    }
  ];

  return (
    <div>
      {pagination.error && <ErrorMessage message={pagination.error} />}
      <TableCard>
        {pagination.loading && pagination.pageItems.length === 0 ? <LoadingState /> : (
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
