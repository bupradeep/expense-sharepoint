import * as React from 'react';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import { IUser } from '../../../../models/IUser';
import TableCard from '../common/TableCard';
import FormRow from '../common/FormRow';
import BackButton from '../common/BackButton';

export interface IUserDetailProps {
  user: IUser;
  onClose: () => void;
}

const UserDetail: React.FC<IUserDetailProps> = (props) => (
  <Stack tokens={{ childrenGap: 12 }}>
    <TableCard title="User Details">
      <Stack tokens={{ childrenGap: 12 }}>
        <FormRow label="Full Name"><Text>{props.user.FullName}</Text></FormRow>
        <FormRow label="Email"><Text>{props.user.Email}</Text></FormRow>
        <FormRow label="Employee Code"><Text>{props.user.EmployeeCode}</Text></FormRow>
        <FormRow label="Employee Object Id"><Text>{props.user.EmployeeObjectId}</Text></FormRow>
        <FormRow label="Role"><Text>{props.user.Role}</Text></FormRow>
        <FormRow label="Department"><Text>{props.user.Department?.DepartmentName || '—'}</Text></FormRow>
        <FormRow label="Manager"><Text>{props.user.Manager?.FullName || '—'}</Text></FormRow>
        <FormRow label="Active"><Text>{props.user.IsActive ? 'Yes' : 'No'}</Text></FormRow>
      </Stack>
    </TableCard>
    <BackButton onClick={props.onClose} />
  </Stack>
);

export default UserDetail;
