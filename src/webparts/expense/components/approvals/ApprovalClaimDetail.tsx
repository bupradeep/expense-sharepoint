import * as React from 'react';
import { TextField } from '@fluentui/react/lib/TextField';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { approvalService } from '../../../../services/approvalService';
import { IExpenseClaim } from '../../../../models/IExpenseClaim';
import { IPendingApproval } from '../../../../models/IApproval';
import { IUser } from '../../../../models/IUser';
import { ApiError } from '../../../../models/IApiError';
import { formatCurrency, formatDate } from '../../../../utils/Formatters';
import { getStatusColor } from '../../../../utils/StatusBadge';
import ErrorMessage from '../common/ErrorMessage';
import TableCard from '../common/TableCard';
import FormRow from '../common/FormRow';
import ClaimComments from '../common/ClaimComments';
import BackButton from '../common/BackButton';
import ExpenseItemsView from '../common/ExpenseItemsView';

export interface IApprovalClaimDetailProps {
  currentUser: IUser;
  claim: IExpenseClaim;
  approvalSummary: IPendingApproval;
  onActionComplete: () => void;
  onClose: () => void;
}

type ActionType = 'approve' | 'reject' | 'sendBack';

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

const ApprovalClaimDetail: React.FC<IApprovalClaimDetailProps> = (props) => {
  const { claim } = props;
  const [action, setAction] = React.useState<ActionType | undefined>(undefined);
  const [comments, setComments] = React.useState<string>('');
  const [saving, setSaving] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | undefined>(undefined);

  const commentsRequired = action === 'reject' || action === 'sendBack';

  const openAction = (next: ActionType): void => {
    setAction(next);
    setComments('');
    setError(undefined);
  };

  const confirmAction = (): void => {
    if (!action) {
      return;
    }
    if (commentsRequired && !comments) {
      setError('Comments are required.');
      return;
    }

    setSaving(true);
    setError(undefined);

    const dto = {
      approverId: props.currentUser.UserId,
      approvalLevel: props.approvalSummary.ApprovalLevel,
      comments: comments || undefined
    };

    actionRequests[action](claim.ExpenseClaimId, dto)
      .then(() => {
        setSaving(false);
        props.onActionComplete();
      })
      .catch((err: ApiError) => {
        setSaving(false);
        setError(err.message);
      });
  };

  if (action) {
    return (
      <TableCard title={`${actionLabels[action]} ${claim.ClaimNumber}`}>
        <Stack tokens={{ childrenGap: 12 }}>
          {error && <ErrorMessage message={error} />}
          <FormRow label="Comments" required={commentsRequired}>
            <TextField
              multiline
              value={comments}
              onChange={(_e, value) => setComments(value || '')}
            />
          </FormRow>
          <Stack horizontal tokens={{ childrenGap: 8 }}>
            <PrimaryButton text={actionLabels[action]} onClick={confirmAction} disabled={saving} />
            <DefaultButton text="Cancel" onClick={() => setAction(undefined)} />
          </Stack>
        </Stack>
      </TableCard>
    );
  }

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
      {claim.SubmittedAt && <Text>Submitted: {formatDate(claim.SubmittedAt)}</Text>}

      <TableCard title="Expense Items">
        <ExpenseItemsView items={claim.Items || []} />
      </TableCard>

      <ClaimComments claim={claim} currentUser={props.currentUser} />

      <Stack horizontal tokens={{ childrenGap: 8 }}>
        <PrimaryButton text="Approve" onClick={() => openAction('approve')} />
        <DefaultButton text="Reject" onClick={() => openAction('reject')} />
        <DefaultButton text="Send Back" onClick={() => openAction('sendBack')} />
      </Stack>

      <BackButton onClick={props.onClose} />
    </Stack>
  );
};

export default ApprovalClaimDetail;
