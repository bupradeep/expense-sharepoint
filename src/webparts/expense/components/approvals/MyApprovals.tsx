import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn } from '@fluentui/react/lib/DetailsList';
import { Panel, PanelType } from '@fluentui/react/lib/Panel';
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
  const [items, setItems] = React.useState<IPendingApproval[] | undefined>(undefined);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [pendingAction, setPendingAction] = React.useState<IPendingAction | undefined>(undefined);
  const [comments, setComments] = React.useState<string>('');
  const [saving, setSaving] = React.useState<boolean>(false);
  const [formError, setFormError] = React.useState<string | undefined>(undefined);

  const load = React.useCallback(() => {
    setError(undefined);
    approvalService.getPending(props.currentUser.UserId)
      .then(setItems)
      .catch((err: ApiError) => setError(err.message));
  }, [props.currentUser.UserId]);

  React.useEffect(() => { load(); }, [load]);

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
        load();
      })
      .catch((err: ApiError) => {
        setSaving(false);
        setFormError(err.message);
      });
  };

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
      {error && <ErrorMessage message={error} />}
      <TableCard>
        {!items ? <LoadingState /> : (
          <DetailsList
            items={items}
            columns={columns}
            layoutMode={DetailsListLayoutMode.justified}
            selectionMode={SelectionMode.none}
          />
        )}
      </TableCard>

      <Panel
        isOpen={!!pendingAction}
        onDismiss={() => setPendingAction(undefined)}
        type={PanelType.smallFixedFar}
        headerText={pendingAction ? `${actionLabels[pendingAction.action]} ${pendingAction.claim.ClaimNumber}` : ''}
      >
        <Stack tokens={{ childrenGap: 12 }}>
          {formError && <ErrorMessage message={formError} />}
          <TextField
            label="Comments"
            required={commentsRequired}
            multiline
            value={comments}
            onChange={(_e, value) => setComments(value || '')}
          />
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            <PrimaryButton
              text={pendingAction ? actionLabels[pendingAction.action] : 'Confirm'}
              onClick={confirmAction}
              disabled={saving}
            />
            <DefaultButton text="Cancel" onClick={() => setPendingAction(undefined)} />
          </Stack>
        </Stack>
      </Panel>
    </div>
  );
};

export default MyApprovals;
